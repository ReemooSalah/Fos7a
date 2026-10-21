'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import PageHeader from '@/components/PageHeader'
import { getAllContent } from '@/lib/contentStore'
import { getColorFromGradient, type ContentItem } from '@/lib/data'
import { getDownloads, getFavorites, getHistory } from '@/lib/store'

const TABS = ['المفضلة', 'المحفوظة', 'سمعتها']

export default function LibraryPage() {
  const [tab, setTab] = useState(0)
  const [sets, setSets] = useState<string[][]>([[], [], []])
  const [all, setAll] = useState<ContentItem[]>([])

  useEffect(() => { setSets([getFavorites(), getDownloads(), getHistory()]); setAll(getAllContent()) }, [])

  const ids = sets[tab]
  const items = ids.map(id => all.find(c => c.id === id)).filter(Boolean) as ContentItem[]

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <PageHeader title="مكتبتي 📚" gradient={false} />
      <div className="bg-white px-5 pb-0 border-b border-gray-100 flex">
        {TABS.map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className="px-4 pb-3 text-sm font-semibold border-b-2 transition-colors" style={{ borderColor: tab === i ? '#5C35BF' : 'transparent', color: tab === i ? '#5C35BF' : '#9CA3AF' }}>
            {t} <span className="text-[10px] opacity-60">({sets[i].length})</span>
          </button>
        ))}
      </div>
      <div className="px-5 py-5">
        {items.length === 0 ? (
          <div className="text-center py-16"><div className="text-6xl mb-3">{['❤️', '⬇️', '🎧'][tab]}</div><p className="text-gray-400 text-sm">لا يوجد محتوى هنا بعد</p>
            <Link href="/explore" className="inline-block mt-4 text-sm font-bold" style={{ color: '#5C35BF' }}>اكتشف المحتوى ←</Link></div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <Link key={item.id} href={`/content/${item.id}`} className="flex gap-3 items-center bg-white p-3 rounded-2xl shadow-sm btn-press">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: getColorFromGradient(item.coverColor) }}>{item.emoji}</div>
                <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p><p className="text-gray-400 text-xs mt-0.5">{item.subtitle} · {item.duration}</p></div>
                {item.isPremium && <span className="text-xs" style={{ color: '#F5A623' }}>👑</span>}
              </Link>
            ))}
          </div>
        )}
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
