'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import TracingCanvas from '@/components/TracingCanvas'
import { arabicLetters, spellingWords } from '@/lib/letters'
import { speak } from '@/lib/speech'
import { addStars, getStars, markLetterWritten, recordGameWin } from '@/lib/store'

const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)

// ── شاشة الفوز المشتركة ───────────────────────────────────
function WinScreen({ emoji, title, sub, stars, onReplay }: { emoji: string; title: string; sub: string; stars: number; onReplay: () => void }) {
  useEffect(() => { addStars(stars); recordGameWin(); speak(title) }, [stars, title])
  return (
    <div className="text-center py-10 bounce-in">
      <div className="text-7xl mb-3">{emoji}</div>
      <p className="font-black text-gray-800 text-xl mb-1">{title}</p>
      <p className="text-gray-500 text-sm mb-2">{sub}</p>
      <p className="text-amber-500 font-bold text-lg mb-5">+{stars} ⭐</p>
      <button onClick={onReplay} className="text-white px-8 py-3 rounded-2xl font-bold btn-press" style={{ background: '#5C35BF' }}>العب مجدداً</button>
    </div>
  )
}

function GameHeader({ title, onBack, right }: { title: string; onBack: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center btn-press">→</button>
      <h2 className="font-black text-gray-800">{title}</h2>
      <div className="text-xs text-gray-400 min-w-[40px] text-left">{right}</div>
    </div>
  )
}

// ── 1) ترتيب الحروف ──────────────────────────────────────
function OrderGame({ onBack }: { onBack: () => void }) {
  const [round, setRound] = useState(0)
  const [pool, setPool] = useState<string[]>([])
  const [placed, setPlaced] = useState<string[]>([])
  const [target, setTarget] = useState<string[]>([])
  const [wrong, setWrong] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const ROUNDS = 5

  const newRound = useCallback((r: number) => {
    const len = Math.min(4 + Math.floor(r / 2), 6)
    const start = Math.floor(Math.random() * (arabicLetters.length - len))
    const seq = arabicLetters.slice(start, start + len).map(l => l.char)
    setTarget(seq); setPool(shuffle(seq)); setPlaced([]); setWrong(null)
  }, [])

  useEffect(() => { newRound(0) }, [newRound])

  const pick = (ch: string, i: number) => {
    const expected = target[placed.length]
    if (ch === expected) {
      const next = [...placed, ch]; setPlaced(next)
      setPool(p => p.filter((_, idx) => idx !== i))
      speak(arabicLetters.find(l => l.char === ch)?.name || ch)
      if (next.length === target.length) {
        setScore(s => s + 1)
        setTimeout(() => { if (round + 1 >= ROUNDS) setDone(true); else { setRound(round + 1); newRound(round + 1) } }, 900)
      }
    } else { setWrong(ch); setTimeout(() => setWrong(null), 400) }
  }

  const reset = () => { setRound(0); setScore(0); setDone(false); newRound(0) }

  return (
    <div>
      <GameHeader title="ترتيب الحروف" onBack={onBack} right={`${round + 1}/${ROUNDS}`} />
      {done ? <WinScreen emoji="🏆" title="رتّبت كل الحروف!" sub={`${score} جولات صحيحة`} stars={25} onReplay={reset} /> : (
        <>
          <p className="text-center text-gray-500 text-sm mb-4">اضغط على الحروف بترتيبها في الهجاء من <b>{target[0]}</b> إلى <b>{target[target.length - 1]}</b></p>
          <div className="flex justify-center gap-2 mb-8 flex-wrap" dir="rtl">
            {target.map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-dashed transition-all"
                style={{ borderColor: placed[i] ? '#5C35BF' : '#D1D5DB', background: placed[i] ? '#5C35BF' : 'white', color: 'white' }}>
                {placed[i] || ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {pool.map((ch, i) => (
              <button key={ch + i} onClick={() => pick(ch, i)}
                className={`h-20 rounded-2xl text-4xl font-black btn-press shadow-sm ${wrong === ch ? 'shake bg-red-100 text-red-500' : 'bg-white text-gray-800'}`}>
                {ch}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── 2) كوّن الكلمة ───────────────────────────────────────
function SpellGame({ onBack }: { onBack: () => void }) {
  const [words] = useState(() => shuffle(spellingWords).slice(0, 6))
  const [qi, setQi] = useState(0)
  const [pool, setPool] = useState<{ ch: string; id: number }[]>([])
  const [placed, setPlaced] = useState<string[]>([])
  const [wrong, setWrong] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const w = words[qi]

  useEffect(() => {
    if (!w) return
    setPool(shuffle(w.letters.map((ch, id) => ({ ch, id })))); setPlaced([])
    speak(w.word)
  }, [qi, w])

  const pick = (p: { ch: string; id: number }) => {
    if (p.ch === w.letters[placed.length]) {
      const next = [...placed, p.ch]; setPlaced(next); setPool(pl => pl.filter(x => x.id !== p.id))
      if (next.length === w.letters.length) {
        speak(`أحسنت! ${w.word}`)
        setTimeout(() => (qi + 1 >= words.length ? setDone(true) : setQi(qi + 1)), 1100)
      }
    } else { setWrong(p.id); setTimeout(() => setWrong(null), 400) }
  }

  return (
    <div>
      <GameHeader title="كوّن الكلمة" onBack={onBack} right={`${qi + 1}/${words.length}`} />
      {done ? <WinScreen emoji="🧩" title="كوّنت كل الكلمات!" sub="أنت قارئ ممتاز" stars={30} onReplay={() => { setQi(0); setDone(false) }} /> : (
        <>
          <button onClick={() => speak(w.word)} className="mx-auto block bg-amber-50 rounded-3xl p-5 mb-5 text-center btn-press w-full">
            <div className="text-7xl mb-2">{w.emoji}</div>
            <p className="text-gray-500 text-sm">🔊 اضغط لسماع الكلمة ثم رتّب حروفها</p>
          </button>
          <div className="flex justify-center gap-2 mb-8" dir="rtl">
            {w.letters.map((_, i) => (
              <div key={i} className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl font-black border-2 border-dashed"
                style={{ borderColor: placed[i] ? '#16a34a' : '#D1D5DB', background: placed[i] ? '#16a34a' : 'white', color: 'white' }}>
                {placed[i] || ''}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            {pool.map(p => (
              <button key={p.id} onClick={() => pick(p)} className={`w-16 h-16 rounded-2xl text-3xl font-black btn-press shadow-sm ${wrong === p.id ? 'shake bg-red-100 text-red-500' : 'bg-white text-gray-800'}`}>{p.ch}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── 3) اكتب الحرف ────────────────────────────────────────
function TraceGame({ onBack }: { onBack: () => void }) {
  const [set] = useState(() => shuffle(arabicLetters).slice(0, 5))
  const [i, setI] = useState(0)
  const [done, setDone] = useState(false)
  const l = set[i]
  useEffect(() => { if (l) speak(`اكتب حرف ${l.name}`) }, [l])
  return (
    <div>
      <GameHeader title="اكتب الحرف" onBack={onBack} right={`${i + 1}/${set.length}`} />
      {done ? <WinScreen emoji="✏️" title="كتبت 5 حروف!" sub="خطك جميل جداً" stars={30} onReplay={() => { setI(0); setDone(false) }} /> : (
        <div className="flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-3">تتبّع حرف <b className="text-lg" style={{ color: '#5C35BF' }}>{l.name}</b> بإصبعك</p>
          <TracingCanvas char={l.char} onComplete={() => { markLetterWritten(l.id); setTimeout(() => (i + 1 >= set.length ? setDone(true) : setI(i + 1)), 1200) }} />
        </div>
      )}
    </div>
  )
}

// ── 4) أي حرف تسمع؟ ──────────────────────────────────────
function ListenGame({ onBack }: { onBack: () => void }) {
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const rounds = useMemo(() => Array.from({ length: 6 }, () => {
    const opts = shuffle(arabicLetters).slice(0, 4)
    return { answer: opts[Math.floor(Math.random() * 4)], opts }
  }), [])
  const r = rounds[qi]
  useEffect(() => { if (r) setTimeout(() => speak(r.answer.name), 300) }, [r])
  const pick = (id: string) => {
    if (chosen) return
    setChosen(id)
    if (id === r.answer.id) setScore(s => s + 1)
    setTimeout(() => { if (qi + 1 >= rounds.length) setDone(true); else { setQi(qi + 1); setChosen(null) } }, 900)
  }
  return (
    <div>
      <GameHeader title="أي حرف تسمع؟" onBack={onBack} right={`${qi + 1}/${rounds.length}`} />
      {done ? <WinScreen emoji="👂" title={`${score}/${rounds.length} صحيحة`} sub="أذنك قوية!" stars={score * 4} onReplay={() => { setQi(0); setScore(0); setChosen(null); setDone(false) }} /> : (
        <>
          <button onClick={() => speak(r.answer.name)} className="mx-auto block w-28 h-28 rounded-full text-5xl btn-press shadow-lg mb-8 text-white" style={{ background: '#5C35BF' }}>🔊</button>
          <div className="grid grid-cols-2 gap-3">
            {r.opts.map(o => (
              <button key={o.id} onClick={() => pick(o.id)} className={`h-24 rounded-2xl text-5xl font-black btn-press transition-colors ${
                chosen === null ? 'bg-white text-gray-800 shadow-sm' : o.id === r.answer.id ? 'bg-green-400 text-white' : chosen === o.id ? 'bg-red-300 text-white' : 'bg-gray-100 text-gray-300'}`}>
                {o.char}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── 5) بطاقات الذاكرة ────────────────────────────────────
const PAIRS = [
  { emoji: '🦁' }, { emoji: '🐘' }, { emoji: '🐬' }, { emoji: '🦊' }, { emoji: '🐸' }, { emoji: '🌸' }, { emoji: '⭐' }, { emoji: '🌙' },
]
function MemoryGame({ onBack }: { onBack: () => void }) {
  const make = () => shuffle([...PAIRS, ...PAIRS].map((p, i) => ({ ...p, id: i, flipped: false, matched: false })))
  const [cards, setCards] = useState(make)
  const [sel, setSel] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)

  useEffect(() => {
    if (sel.length === 2) {
      setMoves(m => m + 1)
      const [a, b] = sel
      if (cards[a].emoji === cards[b].emoji) { setCards(cs => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c))); setSel([]) }
      else { const t = setTimeout(() => { setCards(cs => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c))); setSel([]) }, 800); return () => clearTimeout(t) }
    }
  }, [sel, cards])
  useEffect(() => { if (cards.every(c => c.matched)) setWon(true) }, [cards])

  const flip = (i: number) => {
    if (sel.length === 2 || cards[i].flipped || cards[i].matched) return
    setCards(cs => cs.map((c, idx) => (idx === i ? { ...c, flipped: true } : c))); setSel(s => [...s, i])
  }
  return (
    <div>
      <GameHeader title="بطاقات الذاكرة" onBack={onBack} right={`${moves} خطوة`} />
      {won ? <WinScreen emoji="🏆" title="أحسنت!" sub={`${moves} خطوة`} stars={20} onReplay={() => { setCards(make()); setSel([]); setMoves(0); setWon(false) }} /> : (
        <div className="grid grid-cols-4 gap-2">
          {cards.map((c, i) => (
            <button key={c.id} onClick={() => flip(i)} className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${c.matched ? 'bg-green-100' : c.flipped ? 'bg-purple-100' : 'text-white'}`}
              style={{ background: c.matched || c.flipped ? undefined : '#5C35BF' }}>
              {c.flipped || c.matched ? c.emoji : '❓'}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 6) عدّ واختر ─────────────────────────────────────────
const COUNT_QS = [{ emoji: '🌟', count: 3 }, { emoji: '🍎', count: 5 }, { emoji: '🐝', count: 2 }, { emoji: '🌸', count: 4 }, { emoji: '🚀', count: 6 }]
function CountGame({ onBack }: { onBack: () => void }) {
  const [qi, setQi] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const q = COUNT_QS[qi]
  const pick = (n: number) => {
    if (chosen !== null) return
    setChosen(n); if (n === q.count) setScore(s => s + 1)
    setTimeout(() => { if (qi + 1 >= COUNT_QS.length) setDone(true); else { setQi(qi + 1); setChosen(null) } }, 900)
  }
  return (
    <div>
      <GameHeader title="عدّ واختر" onBack={onBack} right={`${qi + 1}/${COUNT_QS.length}`} />
      {done ? <WinScreen emoji="🎉" title={`${score}/${COUNT_QS.length} صحيح`} sub="أنت بطل الأرقام" stars={score * 4} onReplay={() => { setQi(0); setScore(0); setChosen(null); setDone(false) }} /> : (
        <>
          <div className="bg-amber-50 rounded-3xl p-6 mb-6 text-center">
            <div className="flex flex-wrap justify-center gap-2">{Array.from({ length: q.count }).map((_, i) => <span key={i} className="text-4xl">{q.emoji}</span>)}</div>
            <p className="text-gray-500 text-sm mt-3">كم عدد {q.emoji}؟</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <button key={n} onClick={() => pick(n)} className={`py-4 rounded-2xl font-bold text-xl transition-colors ${chosen === null ? 'bg-white text-gray-700 shadow-sm' : n === q.count ? 'bg-green-400 text-white' : chosen === n ? 'bg-red-300 text-white' : 'bg-gray-100 text-gray-300'}`}>{n}</button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ── القائمة ──────────────────────────────────────────────
const GAMES = [
  { id: 'order', title: 'ترتيب الحروف', desc: 'رتّب الحروف حسب الهجاء', emoji: '🔀', color: '#5C35BF', stars: 25, tag: 'حروف' },
  { id: 'spell', title: 'كوّن الكلمة', desc: 'رتّب الحروف لتكوين كلمة', emoji: '🧩', color: '#16a34a', stars: 30, tag: 'حروف' },
  { id: 'trace', title: 'اكتب الحرف', desc: 'تتبّع الحرف بإصبعك', emoji: '✏️', color: '#db2777', stars: 30, tag: 'حروف' },
  { id: 'listen', title: 'أي حرف تسمع؟', desc: 'استمع واختر الحرف الصحيح', emoji: '👂', color: '#0891b2', stars: 24, tag: 'حروف' },
  { id: 'memory', title: 'بطاقات الذاكرة', desc: 'اوجد أزواج البطاقات', emoji: '🃏', color: '#7c3aed', stars: 20, tag: 'تركيز' },
  { id: 'count', title: 'عدّ واختر', desc: 'عدّ الأشياء واختر الرقم', emoji: '🔢', color: '#ea580c', stars: 20, tag: 'أرقام' },
]

function GamesContent() {
  const params = useSearchParams()
  const [active, setActive] = useState<string | null>(params.get('game'))
  const [stars, setStars] = useState(0)
  useEffect(() => { setStars(getStars()) }, [active])

  const back = () => { setActive(null); setStars(getStars()) }
  const wrap = (el: React.ReactNode) => <div className="min-h-screen bg-gray-50 px-5 pt-12 pb-36">{el}<MiniPlayer /><BottomNav /></div>
  if (active === 'order') return wrap(<OrderGame onBack={back} />)
  if (active === 'spell') return wrap(<SpellGame onBack={back} />)
  if (active === 'trace') return wrap(<TraceGame onBack={back} />)
  if (active === 'listen') return wrap(<ListenGame onBack={back} />)
  if (active === 'memory') return wrap(<MemoryGame onBack={back} />)
  if (active === 'count') return wrap(<CountGame onBack={back} />)

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <div className="px-5 pt-12 pb-6" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
        <div className="flex justify-between items-center">
          <div><h1 className="text-2xl font-black text-white">الألعاب 🎮</h1><p className="text-white/60 text-sm">العب وتعلّم واجمع النجوم</p></div>
          <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full"><span>⭐</span><span className="font-bold text-white text-sm">{stars}</span></div>
        </div>
      </div>
      <div className="px-5 py-5 space-y-3">
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setActive(g.id)} className="btn-press w-full bg-white rounded-3xl p-4 shadow-sm text-right flex gap-4 items-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0" style={{ backgroundColor: g.color + '20' }}>{g.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><p className="font-bold text-gray-800">{g.title}</p><span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: g.color + '20', color: g.color }}>{g.tag}</span></div>
              <p className="text-gray-400 text-xs mt-0.5">{g.desc}</p>
              <p className="text-amber-600 text-xs font-semibold mt-1">⭐ حتى {g.stars} نجمة</p>
            </div>
            <span className="text-gray-300 text-xl">←</span>
          </button>
        ))}
      </div>
      <MiniPlayer />
      <BottomNav />
    </div>
  )
}

export default function GamesPage() {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50" />}><GamesContent /></Suspense>
}
