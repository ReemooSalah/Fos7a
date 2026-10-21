'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import { getColorFromGradient, type ContentItem } from '@/lib/data'
import { getAllContent } from '@/lib/contentStore'
import { isPremiumActive } from '@/lib/store'

const CATEGORIES = [
  { id: 'all', label: 'الكل', emoji: '🌟' },
  { id: 'prophets', label: 'الأنبياء', emoji: '⭐' },
  { id: 'stories', label: 'القصص', emoji: '📚' },
  { id: 'nasheeds', label: 'الأناشيد', emoji: '🎵' },
  { id: 'quran', label: 'القرآن', emoji: '📖' },
  { id: 'podcast', label: 'بودكاست', emoji: '🎙️' },
]

const AGE_FILTERS = [
  { id: 'all', label: 'كل الأعمار' },
  { id: '3-5', label: '٣-٥ سنوات' },
  { id: '6-8', label: '٦-٨ سنوات' },
  { id: '9-12', label: '٩-١٢ سنة' },
]

function ExploreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [ageFilter, setAgeFilter] = useState('all')
  const [premiumOnly, setPremiumOnly] = useState(false)
  const [items, setItems] = useState<ContentItem[]>([])
  const [premium, setPremium] = useState(false)

  useEffect(() => { setItems(getAllContent()); setPremium(isPremiumActive()) }, [])

  const filtered = items.filter(item => {
    if (item.category === 'letters') return false
    if (category !== 'all' && item.category !== category) return false
    if (premiumOnly && !item.isPremium) return false
    if (ageFilter !== 'all') {
      const [minA, maxA] = ageFilter.split('-').map(Number)
      if (item.ageMax < minA || item.ageMin > maxA) return false
    }
    return true
  })

  return (
    <div className="pb-36">
      <div className="pt-12 pb-5 px-5" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
        <h1 className="text-2xl font-black text-white mb-1">اكتشف المحتوى 🔍</h1>
        <p className="text-white/60 text-sm">{filtered.length} محتوى متاح</p>
      </div>

      <div className="px-5 py-4 bg-white border-b border-gray-100">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold btn-press flex items-center gap-1.5"
              style={{ background: category === cat.id ? '#5C35BF' : '#F3F4F6', color: category === cat.id ? 'white' : '#4B5563' }}>
              <span>{cat.emoji}</span><span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 bg-white border-b border-gray-100 flex gap-3 items-center">
        <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 focus:outline-none">
          {AGE_FILTERS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
        </select>
        <button onClick={() => setPremiumOnly(!premiumOnly)} className="flex items-center gap-2 px-3 py-2 rounded-xl btn-press text-sm font-semibold"
          style={{ background: premiumOnly ? '#F5A623' : '#F3F4F6', color: premiumOnly ? 'white' : '#4B5563' }}>
          <span>👑</span><span>مميز</span>
        </button>
      </div>

      <div className="px-5 pt-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16"><div className="text-6xl mb-4">😔</div><p className="text-gray-500 font-medium">لا توجد نتائج مطابقة</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <div key={item.id} className="bg-white rounded-2xl p-4 flex items-center gap-3 btn-press shadow-sm" onClick={() => router.push(`/content/${item.id}`)}>
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 relative" style={{ background: getColorFromGradient(item.coverColor) }}>
                  {item.emoji}
                  {item.isPremium && !premium && <span className="absolute -top-1 -left-1 text-sm">🔒</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                    {item.isNew && <span className="flex-shrink-0 text-xs bg-green-100 text-green-600 rounded-full px-2 py-0.5 font-semibold">جديد</span>}
                  </div>
                  <p className="text-gray-500 text-xs">{item.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                    <span>⏱ {item.duration}</span><span>·</span><span>👶 {item.ageMin}-{item.ageMax} سنة</span>
                    {item.audioUrl && <><span>·</span><span>🎙️ صوت</span></>}
                    {item.isPremium && <><span>·</span><span className="text-amber-500 font-semibold">👑 مميز</span></>}
                  </div>
                </div>
                <span className="text-gray-300 text-lg flex-shrink-0">←</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-spin">🎧</div></div>}>
      <ExploreContent />
    </Suspense>
  )
}
