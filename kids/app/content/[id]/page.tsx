'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import Paywall from '@/components/Paywall'
import { categoryLabels, getCoverColors, type ContentItem } from '@/lib/data'
import { getAllContent } from '@/lib/contentStore'
import { getDownloads, getFavorites, isPremiumActive, startTrack, toggleDownload, toggleFavorite } from '@/lib/store'

export default function ContentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [items, setItems] = useState<ContentItem[]>([])
  const [isFav, setIsFav] = useState(false)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const [premium, setPremium] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(getAllContent()); setPremium(isPremiumActive())
    setIsFav(getFavorites().includes(id)); setIsDownloaded(getDownloads().includes(id))
    setLoaded(true)
  }, [id])

  const item = items.find(c => c.id === id)

  if (!loaded) return <div className="min-h-screen bg-gray-100" />
  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">😔</div><p className="text-gray-500">المحتوى غير موجود</p>
          <button onClick={() => router.back()} className="mt-4 text-purple-600 font-semibold">رجوع</button></div>
      </div>
    )
  }

  const colors = getCoverColors(item.coverColor)
  const locked = item.isPremium && !premium
  const related = items.filter(c => c.category === item.category && c.id !== item.id).slice(0, 4)

  const handlePlay = () => {
    if (locked) { setShowPaywall(true); return }
    startTrack({ id: item.id, title: item.title, emoji: item.emoji, coverColor: item.coverColor }, item.progress || 0)
    router.push('/player')
  }

  return (
    <div className="pb-36 bg-gray-100 min-h-screen">
      <div className="relative pt-12 pb-8 flex flex-col items-center" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
        <button onClick={() => router.back()} className="absolute top-12 right-5 w-9 h-9 bg-black/20 rounded-full flex items-center justify-center btn-press"><span className="text-white">→</span></button>
        <button onClick={() => setIsFav(toggleFavorite(item.id))} className="absolute top-12 left-5 w-9 h-9 bg-black/20 rounded-full flex items-center justify-center btn-press"><span className="text-lg">{isFav ? '❤️' : '🤍'}</span></button>
        <div className="w-36 h-36 bg-white/20 rounded-3xl flex items-center justify-center text-7xl shadow-xl mt-4 relative">
          {item.emoji}
          {locked && <span className="absolute -bottom-2 -left-2 w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow">🔒</span>}
        </div>
        {item.isNew && <span className="mt-3 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">✨ جديد</span>}
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-xl font-black text-gray-800 mb-1">{item.title}</h1>
            <p className="text-gray-500 text-sm">{item.subtitle}</p>
          </div>
          {item.isPremium && <span className="bg-amber-100 text-amber-600 text-xs font-bold px-3 py-1 rounded-full">👑 مميز</span>}
        </div>

        <div className="flex items-center gap-4 mb-4 text-gray-500 text-sm flex-wrap">
          <span>⏱ {item.duration}</span>
          <span>📂 {categoryLabels[item.category]}</span>
          <span>👶 {item.ageMin}-{item.ageMax}</span>
          <span>{item.audioUrl ? '🎙️ صوت مسجّل' : '🗣️ قراءة آلية'}</span>
        </div>

        {item.progress !== undefined && item.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1"><span>تم الاستماع</span><span>{item.progress}%</span></div>
            <div className="h-2 bg-gray-200 rounded-full"><div className="h-full rounded-full" style={{ width: `${item.progress}%`, background: colors.from }} /></div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-2">عن هذا المحتوى</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
        </div>

        {item.body && !locked && (
          <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">📜 النص</h3>
            <p className="text-gray-600 text-sm leading-loose">{item.body}</p>
          </div>
        )}

        <div className="flex gap-3 mb-4">
          <button onClick={() => (locked ? setShowPaywall(true) : setIsDownloaded(toggleDownload(item.id)))}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm btn-press flex items-center justify-center gap-2"
            style={{ background: isDownloaded ? '#EDE9FE' : 'white', color: isDownloaded ? '#5C35BF' : '#6B7280' }}>
            <span>{isDownloaded ? '✅' : '⬇️'}</span><span>{isDownloaded ? 'محفوظ' : 'تحميل'}</span>
          </button>
          <button onClick={() => navigator.share?.({ title: item.title, text: item.description }).catch(() => {})}
            className="flex-1 py-3 rounded-2xl font-semibold text-sm btn-press bg-white text-gray-500 flex items-center justify-center gap-2">
            <span>📤</span><span>مشاركة</span>
          </button>
        </div>

        <button onClick={handlePlay} className="w-full py-4 rounded-2xl font-black text-white text-lg btn-press shadow-xl mb-5"
          style={{ background: locked ? 'linear-gradient(135deg, #F5A623, #E8890B)' : `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}>
          {locked ? '👑 اشترك للاستماع' : item.progress && item.progress > 0 ? `▶ أكمل (${item.progress}%)` : '▶ استمع الآن'}
        </button>

        {related.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-800 mb-3">محتوى مشابه</h3>
            <div className="space-y-3">
              {related.map(rel => {
                const rc = getCoverColors(rel.coverColor)
                return (
                  <Link key={rel.id} href={`/content/${rel.id}`} className="bg-white rounded-2xl p-3 flex items-center gap-3 btn-press shadow-sm">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: `linear-gradient(135deg, ${rc.from}, ${rc.to})` }}>{rel.emoji}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm truncate">{rel.title}</p><p className="text-gray-400 text-xs">{rel.duration}</p></div>
                    {rel.isPremium && <span className="text-amber-500 text-xs">👑</span>}
                    <span className="text-gray-300">←</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showPaywall && <Paywall onClose={() => setShowPaywall(false)} />}
      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
