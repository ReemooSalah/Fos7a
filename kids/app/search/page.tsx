'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllContent } from '@/lib/contentStore'
import { getColorFromGradient, type ContentItem } from '@/lib/data'
import { arabicLetters } from '@/lib/letters'

const TRENDING = ['قصص الأنبياء', 'حرف الباء', 'سورة الفاتحة', 'نشيد الحروف', 'سيدنا يوسف']

function SearchContent() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [all, setAll] = useState<ContentItem[]>([])
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => { setAll(getAllContent()); try { setRecent(JSON.parse(localStorage.getItem('fos7a_recent_search') || '[]')) } catch {} }, [])

  const q = query.trim()
  const norm = (s: string) => s.replace(/[ً-ْ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه')
  const results = q.length > 1 ? all.filter(c => norm(c.title + ' ' + c.subtitle + ' ' + c.description + ' ' + (c.body || '')).includes(norm(q))) : []
  const letters = q.length > 0 ? arabicLetters.filter(l => l.char === q || l.name.includes(q) || norm(l.name).includes(norm(q)) || ('حرف ' + l.name).includes(q)) : []

  const commit = (s: string) => {
    setQuery(s)
    const r = [s, ...recent.filter(x => x !== s)].slice(0, 5)
    setRecent(r); localStorage.setItem('fos7a_recent_search', JSON.stringify(r))
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 text-xl btn-press">→</button>
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
            <span className="text-gray-400">🔍</span>
            <input autoFocus value={query} onChange={e => setQuery(e.target.value)} onBlur={() => q && commit(q)} placeholder="ابحث عن قصة، حرف، نشيد..." className="flex-1 bg-transparent text-gray-800 text-sm outline-none placeholder-gray-400" />
            {query && <button onClick={() => setQuery('')} className="text-gray-400 text-lg">✕</button>}
          </div>
        </div>
      </div>

      <div className="px-5 pb-10">
        {q.length === 0 ? (
          <>
            {recent.length > 0 && (
              <div className="mb-5"><h2 className="font-bold text-gray-700 text-sm mb-2">الأخيرة</h2>
                <div className="flex flex-wrap gap-2">{recent.map(s => <button key={s} onClick={() => commit(s)} className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full btn-press">{s}</button>)}</div></div>
            )}
            <h2 className="font-bold text-gray-700 text-sm mb-2">الأكثر بحثاً</h2>
            <div className="space-y-1">
              {TRENDING.map((t, i) => (
                <button key={t} onClick={() => commit(t)} className="w-full flex items-center gap-3 py-2.5 btn-press">
                  <span className="text-sm font-bold w-5" style={{ color: '#F5A623' }}>{i + 1}</span><span className="text-gray-700 text-sm">{t}</span><span className="mr-auto text-gray-300">↗</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {letters.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs mb-2">حروف</p>
                <div className="flex gap-2 flex-wrap">
                  {letters.map(l => (
                    <Link key={l.id} href={`/letters/${l.id}`} className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center text-white btn-press" style={{ background: getColorFromGradient(l.color) }}>
                      <span className="text-2xl font-black">{l.char}</span><span className="text-[10px]">{l.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {results.length === 0 && letters.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-3">🔍</div><p className="text-gray-400 text-sm">لا توجد نتائج لـ &quot;{q}&quot;</p></div>
            ) : results.length > 0 && (
              <div className="space-y-3">
                <p className="text-gray-400 text-xs">{results.length} نتيجة</p>
                {results.map(item => (
                  <Link key={item.id} href={`/content/${item.id}`} className="flex gap-3 items-center p-3 bg-gray-50 rounded-2xl btn-press">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: getColorFromGradient(item.coverColor) }}>{item.emoji}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm truncate">{item.title}</p><p className="text-gray-400 text-xs">{item.subtitle} · {item.duration}</p></div>
                    {item.isPremium && <span className="text-xs" style={{ color: '#F5A623' }}>👑</span>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return <Suspense fallback={<div className="min-h-screen bg-white" />}><SearchContent /></Suspense>
}
