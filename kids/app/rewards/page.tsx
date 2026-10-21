'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { badges, levels } from '@/lib/data'
import { arabicLetters } from '@/lib/letters'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { getBadges, getDailyLogs, getHistory, getLetterProgress, getProfile, getStars, isPremiumActive, type ChildProfile } from '@/lib/store'

export default function RewardsPage() {
  const [stars, setStars] = useState(0)
  const [unlocked, setUnlocked] = useState<string[]>([])
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [letters, setLetters] = useState({ learned: 0, written: 0 })
  const [listened, setListened] = useState(0)
  const [today, setToday] = useState({ listened: false, played: false, letter: false })
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    setStars(getStars()); setUnlocked(getBadges()); setProfile(getProfile())
    const lp = getLetterProgress(); setLetters({ learned: lp.learned.length, written: lp.written.length })
    setListened(getHistory().length); setPremium(isPremiumActive())
    const t = new Date().toISOString().slice(0, 10)
    const log = getDailyLogs().find(l => l.date === t)
    setToday({ listened: !!log, played: parseInt(localStorage.getItem('fos7a_game_wins') || '0', 10) > 0, letter: lp.learned.length > 0 })
  }, [])

  const current = levels.reduce((acc, l) => (stars >= l.minStars ? l : acc), levels[0])
  const next = levels.find(l => l.minStars > stars)
  const pct = next ? ((stars - current.minStars) / (next.minStars - current.minStars)) * 100 : 100

  const DAILY = [
    { text: 'استمع لقصة', done: today.listened, stars: 10, href: '/prophets' },
    { text: 'تعلّم حرفاً جديداً', done: today.letter, stars: 15, href: '/letters' },
    { text: 'العب لعبة واحدة', done: today.played, stars: 15, href: '/games' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="px-5 pt-12 pb-8 text-white" style={{ background: 'linear-gradient(180deg, #5C35BF, #2D1B69)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">حسابي</h1>
          <Link href="/settings" className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center btn-press">⚙️</Link>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">{profile?.avatar || '⭐'}</div>
          <div>
            <p className="font-black text-lg">{profile?.childName || 'صديقي'}</p>
            <p className="text-white/60 text-xs">{profile?.age ? `${profile.age} سنوات · ` : ''}{premium ? '👑 مشترك مميز' : 'حساب مجاني'}</p>
          </div>
        </div>
        <div className="bg-white/10 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-white/70 text-xs">نجومي</p><div className="flex items-center gap-2 mt-0.5"><span className="text-3xl">⭐</span><span className="text-4xl font-bold">{stars}</span></div></div>
            <div className="text-center"><div className="text-3xl">{current.emoji}</div><p className="text-white/70 text-xs mt-1">{current.name}</p></div>
          </div>
          {next && (
            <>
              <div className="flex justify-between text-xs text-white/60 mb-1"><span>المستوى التالي: {next.name}</span><span>{next.minStars - stars} نجمة متبقية</span></div>
              <div className="h-2 bg-white/20 rounded-full"><div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: '#F5A623' }} /></div>
            </>
          )}
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          {[{ l: 'حروف تعلمتها', v: `${letters.learned}/28`, e: '🔤' }, { l: 'حروف كتبتها', v: letters.written, e: '✏️' }, { l: 'قصص سمعتها', v: listened, e: '🎧' }].map(s => (
            <div key={s.l} className="bg-white rounded-2xl p-3 text-center shadow-sm"><div className="text-2xl">{s.e}</div><p className="font-black text-gray-800 text-lg">{s.v}</p><p className="text-gray-400 text-[10px] leading-tight">{s.l}</p></div>
          ))}
        </div>

        <div>
          <h2 className="font-bold text-gray-800 text-base mb-3">تحديات اليوم</h2>
          <div className="space-y-2">
            {DAILY.map((d, i) => (
              <Link key={i} href={d.href} className={`flex items-center gap-3 p-3 rounded-2xl ${d.done ? 'bg-green-50' : 'bg-white'} shadow-sm btn-press`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${d.done ? 'bg-green-400 text-white' : 'bg-gray-100 text-gray-400'}`}>{d.done ? '✓' : i + 1}</div>
                <p className={`flex-1 text-sm font-medium ${d.done ? 'text-green-700 line-through' : 'text-gray-700'}`}>{d.text}</p>
                <div className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold"><span>⭐</span>{d.stars}</div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 text-base mb-3">شاراتي ({unlocked.length}/{badges.length})</h2>
          <div className="grid grid-cols-4 gap-3">
            {badges.map(b => {
              const u = unlocked.includes(b.id)
              return (
                <div key={b.id} title={b.description} className={`flex flex-col items-center p-2 rounded-2xl ${u ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                  <div className={`text-3xl mb-1 ${u ? '' : 'grayscale opacity-40'}`}>{b.emoji}</div>
                  <p className={`text-[10px] text-center leading-tight ${u ? 'text-gray-700' : 'text-gray-400'}`}>{b.name}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-gray-800 text-base mb-3">مستويات التقدم</h2>
          <div className="space-y-2">
            {levels.map(l => (
              <div key={l.id} className={`flex items-center gap-3 p-3 rounded-2xl ${stars >= l.minStars ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
                <span className={`text-2xl ${stars >= l.minStars ? '' : 'grayscale opacity-40'}`}>{l.emoji}</span>
                <div className="flex-1"><p className={`text-sm font-semibold ${stars >= l.minStars ? 'text-gray-800' : 'text-gray-400'}`}>{l.name}</p><p className="text-xs text-gray-400">من {l.minStars} نجمة</p></div>
                {stars >= l.minStars && <span className="text-green-400 text-sm">✓</span>}
              </div>
            ))}
          </div>
        </div>

        <Link href="/library" className="block bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 btn-press">
          <span className="text-2xl">📚</span><span className="flex-1 font-bold text-gray-800">مكتبتي: المفضلة والمحفوظات</span><span className="text-gray-300">←</span>
        </Link>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
