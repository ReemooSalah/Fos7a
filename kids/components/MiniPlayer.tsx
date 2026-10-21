'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getColorFromGradient } from '@/lib/data'
import { clearTrack, type CurrentTrack } from '@/lib/store'
import { stopSpeaking } from '@/lib/speech'

const HIDDEN_PATHS = ['/', '/onboarding', '/auth/login', '/auth/register', '/setup', '/player', '/admin']

export default function MiniPlayer() {
  const pathname = usePathname()
  const router = useRouter()
  const [track, setTrack] = useState<CurrentTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const load = () => {
      const t = localStorage.getItem('fos7a_current_track')
      setTrack(t ? JSON.parse(t) : null)
      setIsPlaying(localStorage.getItem('fos7a_is_playing') === 'true')
      setProgress(parseInt(localStorage.getItem('fos7a_progress') || '0', 10))
    }
    load()
    window.addEventListener('storage', load)
    const interval = setInterval(load, 1000)
    return () => { window.removeEventListener('storage', load); clearInterval(interval) }
  }, [])

  const isHidden = HIDDEN_PATHS.some(p => (p === '/' ? pathname === '/' : pathname.startsWith(p)))
  if (isHidden || !track) return null

  return (
    <div className="fixed bottom-[68px] left-1/2 -translate-x-1/2 w-full max-w-[390px] px-3 z-40">
      <div
        onClick={() => router.push('/player')}
        className="bg-white rounded-2xl p-3 flex items-center gap-3 cursor-pointer btn-press"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: getColorFromGradient(track.coverColor) }}
        >
          {track.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-800 text-sm truncate">{track.title}</p>
          <div className="h-1 bg-gray-100 rounded-full mt-1">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: '#5C35BF' }} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); router.push('/player') }}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-press"
            style={{ background: '#5C35BF' }}
          >
            <span className="text-white text-base">{isPlaying ? '⏸' : '▶'}</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); stopSpeaking(); clearTrack(); setTrack(null) }}
            className="w-7 h-7 rounded-full flex items-center justify-center btn-press bg-gray-100"
          >
            <span className="text-gray-500 text-xs">✕</span>
          </button>
        </div>
      </div>
    </div>
  )
}
