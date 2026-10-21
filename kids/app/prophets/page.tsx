'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import PageHeader from '@/components/PageHeader'
import { getAllContent } from '@/lib/contentStore'
import { getColorFromGradient, type ContentItem } from '@/lib/data'
import { getHistory, isPremiumActive } from '@/lib/store'

export default function ProphetsPage() {
  const router = useRouter()
  const [items, setItems] = useState<ContentItem[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [premium, setPremium] = useState(false)

  useEffect(() => {
    setItems(getAllContent().filter(c => c.category === 'prophets').sort((a, b) => (a.order ?? 99) - (b.order ?? 99)))
    setHistory(getHistory()); setPremium(isPremiumActive())
  }, [])

  const listened = items.filter(i => history.includes(i.id)).length

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <PageHeader title="قصص الأنبياء 🌟" subtitle={`${items.length} قصة بالترتيب الزمني · استمعت إلى ${listened}`} />

      <div className="px-5 pt-5">
        <div className="relative">
          <div className="absolute right-[27px] top-6 bottom-6 w-0.5 bg-purple-100" />
          <div className="space-y-3">
            {items.map((item, i) => {
              const done = history.includes(item.id)
              const locked = item.isPremium && !premium
              return (
                <button key={item.id} onClick={() => router.push(`/content/${item.id}`)} className="w-full flex items-center gap-3 btn-press text-right">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-md" style={{ background: getColorFromGradient(item.coverColor) }}>
                      {item.emoji}
                    </div>
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[10px] font-black flex items-center justify-center shadow" style={{ color: '#5C35BF' }}>{i + 1}</span>
                    {done && <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-green-400 text-white text-[10px] flex items-center justify-center shadow">✓</span>}
                  </div>
                  <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800 text-sm truncate">{item.title}</p>
                      {locked && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">👑</span>}
                    </div>
                    <p className="text-gray-400 text-xs truncate">{item.subtitle} · ⏱ {item.duration}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
