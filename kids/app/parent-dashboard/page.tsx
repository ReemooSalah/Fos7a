'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import PageHeader from '@/components/PageHeader'
import { getAllContent } from '@/lib/contentStore'
import { arabicLetters } from '@/lib/letters'
import { getBadges, getDailyLogs, getHistory, getLetterProgress, getProfile, getStars, type ChildProfile, type DayLog } from '@/lib/store'
import type { ContentItem } from '@/lib/data'

const DAY_NAMES = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']

export default function ParentDashboardPage() {
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [logs, setLogs] = useState<DayLog[]>([])
  const [history, setHistory] = useState<ContentItem[]>([])
  const [letters, setLetters] = useState({ learned: [] as string[], written: [] as string[] })
  const [stars, setStars] = useState(0)
  const [badgeCount, setBadgeCount] = useState(0)

  useEffect(() => {
    setProfile(getProfile()); setLogs(getDailyLogs()); setStars(getStars()); setBadgeCount(getBadges().length)
    const all = getAllContent()
    setHistory(getHistory().map(id => all.find(c => c.id === id)).filter(Boolean) as ContentItem[])
    setLetters(getLetterProgress())
  }, [])

  // آخر 7 أيام
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const log = logs.find(l => l.date === key)
    return { day: DAY_NAMES[d.getDay()], minutes: Math.round(log?.minutes || 0), items: log?.items.length || 0, isToday: i === 6 }
  })
  const totalMin = week.reduce((a, b) => a + b.minutes, 0)
  const maxMin = Math.max(...week.map(w => w.minutes), 1)
  const byCategory = history.reduce<Record<string, number>>((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc }, {})
  const catLabel: Record<string, string> = { prophets: 'الأنبياء', stories: 'القصص', nasheeds: 'الأناشيد', quran: 'القرآن', podcast: 'بودكاست' }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <PageHeader title="لوحة الوالدين" subtitle="متابعة تعلّم طفلك" gradient={false} />

      <div className="px-5 py-5 space-y-5">
        <div className="rounded-3xl p-5 text-white flex gap-4 items-center" style={{ background: 'linear-gradient(135deg, #5C35BF, #2D1B69)' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-4xl">{profile?.avatar || '🧒'}</div>
          <div className="flex-1">
            <p className="text-white/70 text-xs">طفلك</p>
            <p className="font-bold text-lg">{profile?.childName || 'لم يُضَف بعد'}</p>
            <p className="text-white/60 text-xs">{profile?.age ? `${profile.age} سنوات · ` : ''}{profile?.interests?.slice(0, 3).join('، ')}</p>
          </div>
          <div className="text-center"><p className="text-2xl font-black">{stars}</p><p className="text-white/60 text-[10px]">نجمة</p></div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 text-base mb-4">هذا الأسبوع</h2>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {[{ l: 'دقائق', v: totalMin, e: '⏱' }, { l: 'استماع', v: history.length, e: '🎧' }, { l: 'حروف', v: `${letters.learned.length}/28`, e: '🔤' }, { l: 'شارات', v: badgeCount, e: '🏅' }].map(s => (
              <div key={s.l} className="bg-gray-50 rounded-2xl p-2.5 text-center"><div className="text-xl">{s.e}</div><p className="font-bold text-gray-800">{s.v}</p><p className="text-gray-400 text-[10px]">{s.l}</p></div>
            ))}
          </div>
          <h3 className="text-gray-500 text-xs font-semibold mb-3">دقائق الاستماع اليومي</h3>
          <div className="flex items-end gap-1.5 h-24">
            {week.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] text-gray-400">{w.minutes || ''}</span>
                <div className="w-full rounded-t-md transition-all" style={{ height: `${Math.max((w.minutes / maxMin) * 64, 3)}px`, background: w.isToday ? '#5C35BF' : '#E5E7EB' }} />
                <span className="text-gray-400 text-[10px]">{w.day}</span>
              </div>
            ))}
          </div>
          {totalMin === 0 && <p className="text-center text-xs text-gray-400 mt-3">لا يوجد نشاط مسجّل هذا الأسبوع بعد</p>}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 text-base mb-3">تقدّم الحروف</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {arabicLetters.map(l => {
              const learned = letters.learned.includes(l.id), written = letters.written.includes(l.id)
              return (
                <Link key={l.id} href={`/letters/${l.id}`} className="aspect-square rounded-lg flex items-center justify-center font-black text-lg"
                  style={{ background: written ? '#5C35BF' : learned ? '#C4B5FD' : '#F3F4F6', color: written ? 'white' : learned ? '#2D1B69' : '#9CA3AF' }}>{l.char}</Link>
              )
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[11px] text-gray-500">
            <span><span className="inline-block w-3 h-3 rounded bg-[#5C35BF] align-middle mr-1" /> كتبه</span>
            <span><span className="inline-block w-3 h-3 rounded bg-[#C4B5FD] align-middle mr-1" /> استمع له</span>
            <span><span className="inline-block w-3 h-3 rounded bg-gray-100 align-middle mr-1" /> لم يبدأ</span>
          </div>
        </div>

        {Object.keys(byCategory).length > 0 && (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 text-base mb-3">ماذا يفضّل طفلك؟</h2>
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, n]) => (
              <div key={cat} className="mb-2">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-700">{catLabel[cat] || cat}</span><span className="text-gray-400 text-xs">{n}</span></div>
                <div className="h-2 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${(n / history.length) * 100}%`, background: '#5C35BF' }} /></div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 text-base mb-3">آخر ما استمع إليه</h2>
          {history.length === 0 ? <p className="text-sm text-gray-400">لا يوجد سجل بعد</p> : (
            <div className="space-y-3">
              {history.slice(0, 5).map((item, i) => (
                <Link key={item.id} href={`/content/${item.id}`} className="flex items-center gap-3 btn-press">
                  <span className="font-bold w-5 text-sm" style={{ color: '#5C35BF' }}>{i + 1}</span>
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1"><p className="text-gray-800 text-sm font-medium">{item.title}</p><p className="text-gray-400 text-xs">{item.subtitle} · {item.duration}</p></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 text-base mb-3">الإدارة</h2>
          <Link href="/admin" className="flex items-center justify-between py-2.5 border-b border-gray-50 btn-press"><p className="text-gray-700 text-sm">🎛️ لوحة التحكم — رفع محتوى وأصوات</p><span className="text-gray-300">←</span></Link>
          <Link href="/subscription" className="flex items-center justify-between py-2.5 border-b border-gray-50 btn-press"><p className="text-gray-700 text-sm">👑 إدارة الاشتراك</p><span className="text-gray-300">←</span></Link>
          <Link href="/settings" className="flex items-center justify-between py-2.5 btn-press"><p className="text-gray-700 text-sm">🗣️ صوت القراءة والإعدادات</p><span className="text-gray-300">←</span></Link>
        </div>
      </div>
    </div>
  )
}
