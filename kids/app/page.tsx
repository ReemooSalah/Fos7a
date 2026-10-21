'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      const onboarded = localStorage.getItem('fos7a_onboarding_done')
      const user = localStorage.getItem('fos7a_user')
      const profile = localStorage.getItem('fos7a_child_profile')
      if (!onboarded) router.replace('/onboarding')
      else if (!user) router.replace('/auth/login')
      else if (!profile) router.replace('/setup')
      else router.replace('/home')
    }, 2200)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #1E0A4A 0%, #2D1B69 40%, #5C35BF 100%)' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div
            className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
          >
            <span className="text-7xl">🎧</span>
          </div>
          <div className="absolute inset-0 rounded-3xl pulse-ring" style={{ border: '2px solid rgba(255,255,255,0.3)' }} />
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black text-white mb-1" style={{ letterSpacing: '2px' }}>فُسحة</h1>
          <p className="text-white/70 text-lg font-medium">تعلّم، استمع، العب</p>
        </div>
        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-white/60" style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
          ))}
        </div>
      </div>
      <div className="absolute bottom-12 text-center">
        <p className="text-white/50 text-sm">منصة تعليمية صوتية للأطفال</p>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
