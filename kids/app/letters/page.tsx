'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { arabicLetters } from '@/lib/letters'
import { getColorFromGradient } from '@/lib/data'
import { getLetterProgress } from '@/lib/store'
import { speak } from '@/lib/speech'

export default function LettersPage() {
  const router = useRouter()
  const [learned, setLearned] = useState<string[]>([])
  const [written, setWritten] = useState<string[]>([])

  useEffect(() => {
    const p = getLetterProgress()
    setLearned(p.learned); setWritten(p.written)
  }, [])

  const pct = Math.round((learned.length / arabicLetters.length) * 100)
  const nextLetter = arabicLetters.find(l => !learned.includes(l.id)) || arabicLetters[0]

  return (
    <div className="pb-36 min-h-screen bg-gray-50">
      <div className="pt-12 pb-6 px-5" style={{ background: 'linear-gradient(135deg, #4C1D95, #7C3AED)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white">الحروف العربية 🔤</h1>
            <p className="text-white/60 text-sm">من الألف إلى الياء — 28 حرفاً</p>
          </div>
          <button
            onClick={() => speak('أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي')}
            className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center btn-press"
          >
            <span className="text-xl">🔊</span>
          </button>
        </div>

        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
          <div className="flex justify-between text-white text-sm mb-2">
            <span className="font-bold">تقدّمك</span>
            <span>{learned.length} / {arabicLetters.length} حرفاً</span>
          </div>
          <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#F5A623' }} />
          </div>
          <div className="flex gap-4 mt-3 text-white/80 text-xs">
            <span>🎧 استمعت: {learned.length}</span>
            <span>✏️ كتبت: {written.length}</span>
          </div>
        </div>
      </div>

      {/* Continue card */}
      <div className="px-5 -mt-3">
        <Link href={`/letters/${nextLetter.id}`}>
          <div className="bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 btn-press">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl font-black text-white" style={{ background: getColorFromGradient(nextLetter.color) }}>
              {nextLetter.char}
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{learned.length ? 'أكمل التعلم' : 'ابدأ من هنا'}</p>
              <p className="font-black text-gray-800 text-lg">حرف {nextLetter.name}</p>
              <p className="text-xs text-gray-500">{nextLetter.words[0].emoji} {nextLetter.words[0].word}</p>
            </div>
            <span className="text-2xl" style={{ color: '#5C35BF' }}>←</span>
          </div>
        </Link>
      </div>

      {/* Quick games */}
      <div className="px-5 mt-5 grid grid-cols-2 gap-3">
        <button onClick={() => router.push('/games?game=order')} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press text-right">
          <span className="text-2xl">🔀</span>
          <div><p className="font-bold text-gray-800 text-sm">ترتيب الحروف</p><p className="text-gray-400 text-[11px]">رتّب الحروف بالترتيب</p></div>
        </button>
        <button onClick={() => router.push('/games?game=spell')} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press text-right">
          <span className="text-2xl">🧩</span>
          <div><p className="font-bold text-gray-800 text-sm">كوّن الكلمة</p><p className="text-gray-400 text-[11px]">رتّب الحروف لتكوين كلمة</p></div>
        </button>
      </div>

      {/* Grid */}
      <div className="px-5 mt-6">
        <h2 className="text-lg font-black text-gray-800 mb-3">كل الحروف</h2>
        <div className="grid grid-cols-4 gap-3">
          {arabicLetters.map((l, i) => {
            const isLearned = learned.includes(l.id)
            const isWritten = written.includes(l.id)
            return (
              <Link key={l.id} href={`/letters/${l.id}`} className="btn-press">
                <div className="relative aspect-square rounded-2xl flex flex-col items-center justify-center shadow-sm" style={{ background: getColorFromGradient(l.color) }}>
                  <span className="text-4xl font-black text-white leading-none">{l.char}</span>
                  <span className="text-white/80 text-[10px] mt-1">{l.name}</span>
                  <span className="absolute top-1 right-1.5 text-white/50 text-[9px] font-bold">{i + 1}</span>
                  {(isLearned || isWritten) && (
                    <div className="absolute -bottom-1 -left-1 flex gap-0.5">
                      {isLearned && <span className="w-5 h-5 rounded-full bg-white text-[10px] flex items-center justify-center shadow">🎧</span>}
                      {isWritten && <span className="w-5 h-5 rounded-full bg-white text-[10px] flex items-center justify-center shadow">✏️</span>}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
