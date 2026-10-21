'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { homeCategories, getColorFromGradient, type ContentItem } from '@/lib/data'
import { getAllContent } from '@/lib/contentStore'
import { arabicLetters } from '@/lib/letters'
import { getLetterProgress, getProfile, getStars, isPremiumActive, type ChildProfile } from '@/lib/store'

export default function HomePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ChildProfile | null>(null)
  const [stars, setStars] = useState(0)
  const [greeting, setGreeting] = useState('مرحباً')
  const [items, setItems] = useState<ContentItem[]>([])
  const [lettersLearned, setLettersLearned] = useState(0)
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    setProfile(getProfile()); setStars(getStars())
    const h = new Date().getHours()
    setGreeting(h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور')
    setItems(getAllContent())
    setLettersLearned(getLetterProgress().learned.length)
    setPremium(isPremiumActive())
  }, [])

  const trending = items.filter(c => c.isTrending).slice(0, 6)
  const prophets = items.filter(c => c.category === 'prophets').sort((a, b) => (a.order ?? 99) - (b.order ?? 99)).slice(0, 5)
  const newest = items.filter(c => c.isNew).slice(0, 6)
  const continueItems = items.filter(c => c.progress !== undefined && c.progress > 0 && c.progress < 100).slice(0, 3)
  const nextLetter = arabicLetters[Math.min(lettersLearned, 27)]

  return (
    <div className="pb-36">
      <div className="pt-12 pb-6 px-5" style={{ background: 'linear-gradient(135deg, #1E0A4A 0%, #5C35BF 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-sm">{greeting}،</p>
            <h1 className="text-2xl font-black text-white">{profile?.childName || 'صديقي الصغير'} {profile?.avatar || '⭐'}</h1>
          </div>
          <div className="flex gap-2">
            {!premium && (
              <Link href="/subscription" className="btn-press">
                <div className="h-11 px-3 rounded-full flex items-center gap-1 font-bold text-xs" style={{ background: '#F5A623', color: '#1E0A4A' }}>👑 اشترك</div>
              </Link>
            )}
            <Link href="/settings" className="btn-press">
              <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center"><span className="text-white text-xl">⚙️</span></div>
            </Link>
          </div>
        </div>

        <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}>
          <span className="text-2xl">⭐</span>
          <div className="flex-1">
            <p className="text-white/70 text-xs">نجومك</p>
            <p className="text-white font-bold text-lg">{stars} نجمة</p>
          </div>
          <Link href="/rewards" className="bg-white/20 rounded-xl px-3 py-1.5 text-white text-xs font-semibold btn-press">عرض الجوائز</Link>
        </div>
      </div>

      <div className="px-5 -mt-3">
        <Link href="/search">
          <div className="bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-md btn-press">
            <span className="text-gray-400 text-lg">🔍</span>
            <span className="text-gray-400 text-sm font-medium">ابحث عن قصة أو حرف أو نشيد...</span>
          </div>
        </Link>
      </div>

      {/* Letters progress banner */}
      <div className="px-5 mt-5">
        <Link href={`/letters/${nextLetter.id}`}>
          <div className="rounded-2xl p-4 shadow-md flex items-center gap-4 btn-press" style={{ background: 'linear-gradient(135deg, #7C3AED, #4F46E5)' }}>
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-5xl font-black">{nextLetter.char}</div>
            <div className="flex-1 text-white">
              <p className="text-xs text-white/70">درس اليوم</p>
              <p className="font-black text-lg">حرف {nextLetter.name}</p>
              <div className="h-1.5 bg-white/20 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(lettersLearned / 28) * 100}%` }} />
              </div>
              <p className="text-[11px] text-white/70 mt-1">{lettersLearned} من 28 حرفاً</p>
            </div>
            <span className="text-white text-2xl">←</span>
          </div>
        </Link>
      </div>

      {/* Categories */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-gray-800">الأقسام</h2>
          <Link href="/explore" className="text-sm font-semibold" style={{ color: '#5C35BF' }}>الكل</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5">
          {homeCategories.map(cat => (
            <Link key={cat.id} href={cat.href} className="flex-shrink-0 btn-press">
              <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md" style={{ background: getColorFromGradient(cat.color) }}>
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-white text-xs font-bold">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {continueItems.length > 0 && (
        <div className="mt-6 px-5">
          <h2 className="text-lg font-black text-gray-800 mb-3">أكمل الاستماع 🎧</h2>
          <div className="space-y-3">
            {continueItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 btn-press shadow-sm" onClick={() => router.push(`/content/${item.id}`)}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: getColorFromGradient(item.coverColor) }}>{item.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                  <p className="text-gray-500 text-xs">{item.subtitle} · {item.duration}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full mt-2"><div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: '#5C35BF' }} /></div>
                </div>
                <span className="text-gray-400 text-sm">{item.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prophets */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 px-5">
          <h2 className="text-lg font-black text-gray-800">🌟 قصص الأنبياء</h2>
          <Link href="/prophets" className="text-sm font-semibold" style={{ color: '#5C35BF' }}>الكل</Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 px-5">
          {prophets.map(item => <HCard key={item.id} item={item} onClick={() => router.push(`/content/${item.id}`)} locked={item.isPremium && !premium} />)}
        </div>
      </div>

      {/* Trending */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 px-5"><h2 className="text-lg font-black text-gray-800">🔥 الأكثر استماعاً</h2></div>
        <div className="flex gap-3 overflow-x-auto pb-2 px-5">
          {trending.map(item => <HCard key={item.id} item={item} onClick={() => router.push(`/content/${item.id}`)} locked={item.isPremium && !premium} />)}
        </div>
      </div>

      {/* New */}
      <div className="mt-6 px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-gray-800">✨ جديد لك</h2>
          <Link href="/explore" className="text-sm font-semibold" style={{ color: '#5C35BF' }}>الكل</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {newest.map(item => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden btn-press shadow-sm" onClick={() => router.push(`/content/${item.id}`)}>
              <div className="h-24 flex items-center justify-center text-4xl relative" style={{ background: getColorFromGradient(item.coverColor) }}>
                {item.emoji}
                {item.isPremium && !premium && <span className="absolute top-2 left-2 text-sm">🔒</span>}
              </div>
              <div className="p-3">
                <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  {item.isPremium && <span className="text-xs bg-amber-100 text-amber-600 rounded-full px-2 py-0.5 font-semibold">مميز</span>}
                  <span className="text-gray-400 text-xs">{item.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  )
}

function HCard({ item, onClick, locked }: { item: ContentItem; onClick: () => void; locked: boolean }) {
  return (
    <div className="flex-shrink-0 w-32 btn-press" onClick={onClick}>
      <div className="w-full h-32 rounded-2xl flex items-center justify-center text-5xl shadow-md mb-2 relative" style={{ background: getColorFromGradient(item.coverColor) }}>
        {item.emoji}
        {locked && <span className="absolute top-2 left-2 text-sm">🔒</span>}
      </div>
      <p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p>
      <p className="text-gray-400 text-xs">{item.duration}</p>
    </div>
  )
}
