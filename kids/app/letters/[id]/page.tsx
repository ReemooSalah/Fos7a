'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import TracingCanvas from '@/components/TracingCanvas'
import { arabicLetters, letterById, letterIndex } from '@/lib/letters'
import { getColorFromGradient, getCoverColors } from '@/lib/data'
import { playLetterSound, speak, stopSpeaking } from '@/lib/speech'
import { addStars, markLetterLearned, markLetterWritten } from '@/lib/store'

type Tab = 'learn' | 'write' | 'quiz'

export default function LetterPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const letter = letterById(id)
  const idx = letterIndex(id)
  const [tab, setTab] = useState<Tab>('learn')
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [quizOptions, setQuizOptions] = useState<{ word: string; emoji: string; correct: boolean }[]>([])

  useEffect(() => {
    if (!letter) return
    markLetterLearned(letter.id)
    // تحضير سؤال الاختبار: كلمة واحدة صحيحة + 3 من حروف أخرى
    const others = arabicLetters.filter(l => l.id !== letter.id).sort(() => Math.random() - 0.5).slice(0, 3)
    const opts = [
      { ...letter.words[Math.floor(Math.random() * letter.words.length)], correct: true },
      ...others.map(o => ({ ...o.words[0], correct: false })),
    ].sort(() => Math.random() - 0.5)
    setQuizOptions(opts); setQuizAnswer(null)
    setTab('learn')
    return () => stopSpeaking()
  }, [letter])

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">😔</div><p className="text-gray-500">الحرف غير موجود</p>
          <Link href="/letters" className="mt-4 inline-block text-purple-600 font-semibold">رجوع</Link></div>
      </div>
    )
  }

  const colors = getCoverColors(letter.color)
  const bg = getColorFromGradient(letter.color)
  const prev = arabicLetters[idx - 1]
  const next = arabicLetters[idx + 1]

  const say = (key: string, text: string) => {
    setSpeaking(key)
    if (key === 'main') playLetterSound(letter.id, `${letter.name}. ${letter.char}`, () => setSpeaking(null))
    else speak(text, { onEnd: () => setSpeaking(null) })
  }

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(null), 1800) }

  const onWritten = () => {
    const first = markLetterWritten(letter.id)
    addStars(first ? 15 : 3)
    showToast(first ? '+15 ⭐ كتبت الحرف لأول مرة!' : '+3 ⭐ أحسنت!')
    speak(`أحسنت! كتبت حرف ${letter.name}`)
  }

  const answerQuiz = (opt: { word: string; correct: boolean }) => {
    if (quizAnswer) return
    setQuizAnswer(opt.word)
    if (opt.correct) { addStars(5); showToast('+5 ⭐ إجابة صحيحة!'); speak(`صحيح! ${opt.word} تبدأ بحرف ${letter.name}`) }
    else speak(`حاول مرة أخرى`)
  }

  const Speaker = ({ k, text, size = 'md' }: { k: string; text: string; size?: 'sm' | 'md' }) => (
    <button onClick={e => { e.stopPropagation(); say(k, text) }}
      className={`rounded-full flex items-center justify-center btn-press ${size === 'sm' ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'} ${speaking === k ? 'animate-pulse' : ''}`}
      style={{ background: speaking === k ? colors.from : '#F3F4F6' }}>
      🔊
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Hero */}
      <div className="pt-12 pb-6 px-5 relative" style={{ background: bg }}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => router.push('/letters')} className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center btn-press"><span className="text-white">→</span></button>
          <p className="text-white/80 text-sm font-bold">الحرف {idx + 1} من 28</p>
          <div className="w-9" />
        </div>
        <div className="flex flex-col items-center">
          <button onClick={() => say('main', letter.name)} className="btn-press">
            <div className="w-40 h-40 rounded-[40px] bg-white/20 flex items-center justify-center shadow-xl" style={{ backdropFilter: 'blur(10px)' }}>
              <span className="text-white font-black leading-none" style={{ fontSize: 110 }}>{letter.char}</span>
            </div>
          </button>
          <h1 className="text-white text-3xl font-black mt-4">حرف {letter.name}</h1>
          <p className="text-white/70 text-sm">اضغط على الحرف لسماعه 🔊</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 -mt-5">
        <div className="bg-white rounded-2xl p-1.5 shadow-md flex">
          {([['learn', '🎧 تعلّم'], ['write', '✏️ اكتب'], ['quiz', '🧠 اختبر']] as [Tab, string][]).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 py-2.5 rounded-xl text-sm font-bold btn-press transition-all"
              style={{ background: tab === t ? bg : 'transparent', color: tab === t ? 'white' : '#6B7280' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-5 space-y-4">
        {tab === 'learn' && (
          <>
            {/* Forms */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">أشكال الحرف</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[['منفرد', letter.char], ['أول', letter.forms.initial], ['وسط', letter.forms.medial], ['آخر', letter.forms.final]].map(([lbl, f]) => (
                  <div key={lbl} className="bg-gray-50 rounded-xl py-3">
                    <p className="text-3xl font-black" style={{ color: colors.to }}>{f}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{lbl}</p>
                  </div>
                ))}
              </div>
              {!letter.connects && <p className="text-xs text-gray-400 mt-2 text-center">💡 هذا الحرف لا يتصل بالحرف الذي بعده</p>}
            </div>

            {/* Harakat */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">الحركات</h3>
              <div className="grid grid-cols-3 gap-2">
                {[['فتحة', letter.harakat.fatha], ['ضمة', letter.harakat.damma], ['كسرة', letter.harakat.kasra]].map(([lbl, h]) => (
                  <button key={lbl} onClick={() => say('h-' + lbl, h)} className="rounded-xl py-3 flex flex-col items-center gap-1 btn-press"
                    style={{ background: speaking === 'h-' + lbl ? bg : '#F9FAFB', color: speaking === 'h-' + lbl ? 'white' : colors.to }}>
                    <span className="text-3xl font-black">{h}</span>
                    <span className="text-[11px] opacity-70">{lbl}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Words */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-3">كلمات تبدأ بحرف {letter.name}</h3>
              <div className="space-y-2">
                {letter.words.map(w => (
                  <div key={w.word} role="button" tabIndex={0} onClick={() => say('w-' + w.word, w.word)} className="w-full flex items-center gap-3 p-3 rounded-xl btn-press cursor-pointer"
                    style={{ background: speaking === 'w-' + w.word ? `${colors.from}22` : '#F9FAFB' }}>
                    <span className="text-3xl">{w.emoji}</span>
                    <span className="flex-1 text-right text-xl font-black text-gray-800">
                      <span style={{ color: colors.to }}>{w.word[0]}</span>{w.word.slice(1)}
                    </span>
                    <Speaker k={'w-' + w.word} text={w.word} size="sm" />
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setTab('write')} className="w-full py-4 rounded-2xl text-white font-black text-lg btn-press shadow-lg" style={{ background: bg }}>
              ✏️ هيا نكتب حرف {letter.name}
            </button>
          </>
        )}

        {tab === 'write' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
            <h3 className="font-bold text-gray-800 mb-1">اكتب الحرف بإصبعك</h3>
            <p className="text-xs text-gray-400 mb-4">تتبّع الحرف الباهت حتى يكتمل</p>
            <TracingCanvas char={letter.char} color={colors.to} onComplete={onWritten} />
            <div className="flex gap-2 mt-4 w-full">
              <button onClick={() => say('main', letter.name)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold btn-press">🔊 اسمع الحرف</button>
              <button onClick={() => setTab('quiz')} className="flex-1 py-3 rounded-xl text-white text-sm font-bold btn-press" style={{ background: bg }}>🧠 اختبر نفسك</button>
            </div>
          </div>
        )}

        {tab === 'quiz' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-1 text-center">أي كلمة تبدأ بحرف <span style={{ color: colors.to }}>{letter.name}</span>؟</h3>
            <div className="text-center text-6xl font-black my-4" style={{ color: colors.to }}>{letter.char}</div>
            <div className="grid grid-cols-2 gap-3">
              {quizOptions.map(o => {
                const chosen = quizAnswer === o.word
                const reveal = quizAnswer !== null
                return (
                  <button key={o.word} onClick={() => answerQuiz(o)} className={`rounded-2xl p-4 flex flex-col items-center gap-2 btn-press border-2 transition-all ${chosen && !o.correct ? 'shake' : ''}`}
                    style={{
                      borderColor: reveal && o.correct ? '#4ADE80' : chosen ? '#F87171' : '#F3F4F6',
                      background: reveal && o.correct ? '#F0FDF4' : chosen ? '#FEF2F2' : '#F9FAFB',
                    }}>
                    <span className="text-4xl">{o.emoji}</span>
                    <span className="font-bold text-gray-800">{o.word}</span>
                  </button>
                )
              })}
            </div>
            {quizAnswer && (
              <button onClick={() => { setQuizAnswer(null); setQuizOptions(q => [...q].sort(() => Math.random() - 0.5)) }}
                className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm btn-press">🔄 سؤال آخر</button>
            )}
          </div>
        )}

        {/* Prev / Next */}
        <div className="flex gap-3 pt-2">
          {prev ? (
            <Link href={`/letters/${prev.id}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center gap-2 btn-press">
              <span className="text-gray-400">→</span>
              <span className="text-2xl font-black" style={{ color: getCoverColors(prev.color).to }}>{prev.char}</span>
              <span className="text-xs text-gray-500">السابق</span>
            </Link>
          ) : <div className="flex-1" />}
          {next ? (
            <Link href={`/letters/${next.id}`} className="flex-1 bg-white rounded-2xl p-3 shadow-sm flex items-center justify-end gap-2 btn-press">
              <span className="text-xs text-gray-500">التالي</span>
              <span className="text-2xl font-black" style={{ color: getCoverColors(next.color).to }}>{next.char}</span>
              <span className="text-gray-400">←</span>
            </Link>
          ) : (
            <Link href="/letters" className="flex-1 rounded-2xl p-3 shadow-sm flex items-center justify-center gap-2 btn-press text-white font-bold" style={{ background: bg }}>
              🏆 أكملت كل الحروف!
            </Link>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl z-50 slide-up">{toast}</div>
      )}
    </div>
  )
}
