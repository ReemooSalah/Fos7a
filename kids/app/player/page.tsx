'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { durationToSeconds, getColorFromGradient, getCoverColors, type ContentItem } from '@/lib/data'
import { getAllContent } from '@/lib/contentStore'
import { addStars, clearTrack, getCurrentTrack, logListening, toggleFavorite, getFavorites, type CurrentTrack } from '@/lib/store'
import { getVoiceSettings, loadVoices, pauseSpeaking, resumeSpeaking, saveVoiceSettings, speak, speechSupported, stopSpeaking } from '@/lib/speech'

/**
 * المشغّل: إن كان للمحتوى ملف صوتي يُشغَّل عبر <audio>،
 * وإلا يُقرأ نص المحتوى بالصوت الآلي المختار مع إبراز الجملة الحالية.
 */
export default function PlayerPage() {
  const router = useRouter()
  const [track, setTrack] = useState<CurrentTrack | null>(null)
  const [item, setItem] = useState<ContentItem | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [showTimer, setShowTimer] = useState(false)
  const [showVoices, setShowVoices] = useState(false)
  const [sleepMin, setSleepMin] = useState<number | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState<string | null>(null)
  const [sentenceIdx, setSentenceIdx] = useState(-1)
  const [isFav, setIsFav] = useState(false)
  const [completed, setCompleted] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const sentences = useRef<string[]>([])
  const sentenceRef = useRef(0)
  const playingRef = useRef(false)
  const startedAt = useRef<number>(0)
  const sleepTimer = useRef<NodeJS.Timeout | null>(null)

  // تحميل المسار
  useEffect(() => {
    const t = getCurrentTrack()
    if (!t) { router.replace('/home'); return }
    setTrack(t)
    const it = getAllContent().find(c => c.id === t.id) || null
    setItem(it)
    setIsFav(getFavorites().includes(t.id))
    const p = parseInt(localStorage.getItem('fos7a_progress') || '0', 10)
    setProgress(p >= 100 ? 0 : p)
    if (it?.body) {
      sentences.current = it.body.split(/(?<=[.!؟?])\s+/).filter(s => s.trim())
      const startIdx = Math.floor((p / 100) * sentences.current.length)
      sentenceRef.current = Math.min(startIdx, sentences.current.length - 1)
    }
    setVoiceName(getVoiceSettings().voiceName)
    loadVoices().then(setVoices)
    startedAt.current = Date.now()
    const wantPlay = localStorage.getItem('fos7a_is_playing') === 'true'
    if (wantPlay) setTimeout(() => play(), 300)
    return () => {
      stopSpeaking()
      audioRef.current?.pause()
      if (sleepTimer.current) clearTimeout(sleepTimer.current)
      if (t) logListening(t.id, (Date.now() - startedAt.current) / 1000)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const setProg = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(100, v))
    setProgress(clamped)
    localStorage.setItem('fos7a_progress', String(Math.round(clamped)))
  }, [])

  const finish = useCallback(() => {
    playingRef.current = false; setIsPlaying(false)
    localStorage.setItem('fos7a_is_playing', 'false')
    setProg(100); setSentenceIdx(-1)
    if (!completed) { addStars(10); setCompleted(true) }
  }, [completed, setProg])

  // قراءة الجملة التالية (وضع TTS)
  const speakNext = useCallback(() => {
    if (!playingRef.current) return
    const i = sentenceRef.current
    const list = sentences.current
    if (i >= list.length) { finish(); return }
    setSentenceIdx(i)
    setProg((i / list.length) * 100)
    speak(list[i], {
      rate: getVoiceSettings().rate * speed,
      onEnd: () => {
        if (!playingRef.current) return
        sentenceRef.current = i + 1
        speakNext()
      },
    })
  }, [finish, setProg, speed])

  const play = () => {
    if (!item && !track) return
    playingRef.current = true; setIsPlaying(true)
    localStorage.setItem('fos7a_is_playing', 'true')
    if (item?.audioUrl) {
      if (!audioRef.current) {
        const a = new Audio(item.audioUrl)
        a.playbackRate = speed
        a.ontimeupdate = () => { if (a.duration) setProg((a.currentTime / a.duration) * 100) }
        a.onended = finish
        a.onerror = () => { audioRef.current = null; if (item.body) speakNext() }
        audioRef.current = a
        a.currentTime = 0
        a.addEventListener('loadedmetadata', () => { a.currentTime = (progress / 100) * a.duration }, { once: true })
      }
      audioRef.current.play().catch(() => {})
      return
    }
    if (item?.body && speechSupported()) {
      if (window.speechSynthesis.paused && window.speechSynthesis.speaking) { resumeSpeaking(); return }
      speakNext()
      return
    }
    // لا صوت ولا نص: محاكاة التقدّم
    simulate()
  }

  const simRef = useRef<NodeJS.Timeout | null>(null)
  const simulate = () => {
    if (simRef.current) clearInterval(simRef.current)
    const total = item ? durationToSeconds(item.duration) : 180
    simRef.current = setInterval(() => {
      if (!playingRef.current) return
      setProgress(prev => {
        const next = prev + (100 / total) * speed * 0.5
        localStorage.setItem('fos7a_progress', String(Math.round(next)))
        if (next >= 100) { clearInterval(simRef.current!); finish(); return 100 }
        return next
      })
    }, 500)
  }

  const pause = () => {
    playingRef.current = false; setIsPlaying(false)
    localStorage.setItem('fos7a_is_playing', 'false')
    audioRef.current?.pause()
    if (item?.body && !item.audioUrl) pauseSpeaking()
  }

  const toggle = () => (isPlaying ? pause() : play())

  const seek = (pct: number) => {
    setProg(pct)
    if (audioRef.current && audioRef.current.duration) audioRef.current.currentTime = (pct / 100) * audioRef.current.duration
    else if (sentences.current.length) {
      sentenceRef.current = Math.floor((pct / 100) * sentences.current.length)
      if (isPlaying) { stopSpeaking(); setTimeout(speakNext, 50) }
    }
  }

  const skip = (dir: 1 | -1) => {
    if (sentences.current.length && !item?.audioUrl) {
      sentenceRef.current = Math.max(0, Math.min(sentences.current.length - 1, sentenceRef.current + dir))
      if (isPlaying) { stopSpeaking(); setTimeout(speakNext, 50) } else setProg((sentenceRef.current / sentences.current.length) * 100)
    } else seek(progress + dir * 10)
  }

  const changeSpeed = () => {
    const s = [0.75, 1, 1.25, 1.5]
    const nxt = s[(s.indexOf(speed) + 1) % s.length]
    setSpeed(nxt)
    if (audioRef.current) audioRef.current.playbackRate = nxt
    else if (isPlaying) { stopSpeaking(); setTimeout(speakNext, 50) }
  }

  const chooseVoice = (name: string) => {
    saveVoiceSettings({ voiceName: name }); setVoiceName(name); setShowVoices(false)
    if (isPlaying && !item?.audioUrl) { stopSpeaking(); setTimeout(speakNext, 50) }
    else speak('مرحباً! أنا صوتك الجديد')
  }

  const setSleep = (m: number | null) => {
    setSleepMin(m); setShowTimer(false)
    if (sleepTimer.current) clearTimeout(sleepTimer.current)
    if (m) sleepTimer.current = setTimeout(() => pause(), m * 60 * 1000)
  }

  if (!track) return <div className="min-h-screen" style={{ background: '#1E0A4A' }} />

  const colors = getCoverColors(track.coverColor)
  const totalSecs = item ? durationToSeconds(item.duration) : 180
  const fmt = (pct: number) => { const s = Math.round((pct / 100) * totalSecs); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` }
  const currentVoice = voices.find(v => v.name === voiceName) || voices.find(v => v.lang.startsWith('ar'))

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${colors.from} 0%, #1E0A4A 55%, #0D0520 100%)` }}>
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <button onClick={() => router.back()} className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center btn-press"><span className="text-white text-xl">↓</span></button>
        <div className="text-center">
          <p className="text-white/60 text-xs">يُشغّل الآن</p>
          <p className="text-white font-bold text-sm truncate max-w-[200px]">{track.title}</p>
        </div>
        <button onClick={() => { stopSpeaking(); audioRef.current?.pause(); clearTrack(); router.push('/home') }} className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center btn-press"><span className="text-white text-sm">✕</span></button>
      </div>

      <div className="flex flex-col items-center px-6 mt-1 flex-1">
        <div className="w-44 h-44 rounded-3xl flex items-center justify-center shadow-2xl mb-4" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)' }}>
          <span className="text-8xl">{track.emoji}</span>
        </div>

        <div className="flex items-end gap-1 h-8 mb-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`w-2 rounded-full ${isPlaying ? 'wave-bar' : ''}`}
              style={{ background: 'rgba(255,255,255,0.5)', height: isPlaying ? undefined : `${4 + (i % 5) * 4}px`, animationDelay: `${(i % 7) * 0.1}s` }} />
          ))}
        </div>

        <div className="text-center mb-3 w-full">
          <h2 className="text-xl font-black text-white mb-0.5">{track.title}</h2>
          <p className="text-white/60 text-sm">{item?.subtitle}</p>
          <p className="text-white/40 text-[11px] mt-1">{item?.audioUrl ? '🎙️ تسجيل صوتي' : `🗣️ ${currentVoice?.name?.slice(0, 28) || 'الصوت الافتراضي'}`}</p>
        </div>

        {/* النص المقروء */}
        {item?.body && !item.audioUrl && (
          <div className="w-full rounded-2xl p-3 mb-3 max-h-24 overflow-y-auto" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <p className="text-white/80 text-sm leading-relaxed text-center">
              {sentenceIdx >= 0 ? sentences.current[sentenceIdx] : sentences.current[sentenceRef.current] || item.body.slice(0, 120)}
            </p>
          </div>
        )}

        <div className="w-full mb-2">
          <input type="range" min={0} max={100} value={Math.round(progress)} onChange={e => seek(parseInt(e.target.value, 10))} className="w-full cursor-pointer" style={{ accentColor: 'white' }} />
          <div className="flex justify-between text-white/50 text-xs mt-1"><span>{fmt(progress)}</span><span>{item?.duration || '0:00'}</span></div>
        </div>

        <div className="flex items-center justify-between w-full mb-4 px-4">
          <button className="btn-press opacity-70" onClick={() => skip(-1)}><span className="text-white text-3xl">⏮</span></button>
          <button onClick={toggle} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl btn-press">
            <span className="text-4xl" style={{ color: colors.to }}>{isPlaying ? '⏸' : '▶'}</span>
          </button>
          <button className="btn-press opacity-70" onClick={() => skip(1)}><span className="text-white text-3xl">⏭</span></button>
        </div>

        <div className="flex gap-6 pb-8">
          <button onClick={changeSpeed} className="flex flex-col items-center gap-1 btn-press">
            <span className="text-white/70 border border-white/30 rounded-full px-2 py-0.5 text-sm">{speed}x</span>
            <span className="text-white/40 text-xs">السرعة</span>
          </button>
          {!item?.audioUrl && (
            <button onClick={() => setShowVoices(true)} className="flex flex-col items-center gap-1 btn-press">
              <span className="text-2xl opacity-80">🗣️</span>
              <span className="text-white/40 text-xs">الصوت</span>
            </button>
          )}
          <button onClick={() => setShowTimer(true)} className="flex flex-col items-center gap-1 btn-press">
            <span className="text-2xl opacity-70">⏱</span>
            <span className="text-white/40 text-xs">{sleepMin ? `${sleepMin} د` : 'مؤقت'}</span>
          </button>
          <button onClick={() => setIsFav(toggleFavorite(track.id))} className="flex flex-col items-center gap-1 btn-press">
            <span className="text-2xl">{isFav ? '❤️' : '🤍'}</span>
            <span className="text-white/40 text-xs">المفضلة</span>
          </button>
        </div>
      </div>

      {/* اختيار الصوت */}
      {showVoices && (
        <Sheet onClose={() => setShowVoices(false)} title="اختر صوت القراءة">
          {voices.length === 0 && <p className="text-white/60 text-sm text-center py-4">لا تتوفر أصوات في هذا المتصفح</p>}
          <div className="max-h-72 overflow-y-auto space-y-2">
            {voices.map(v => (
              <button key={v.name} onClick={() => chooseVoice(v.name)} className="w-full p-3 rounded-xl text-right btn-press flex items-center gap-3"
                style={{ background: voiceName === v.name ? '#5C35BF' : 'rgba(255,255,255,0.1)' }}>
                <span className="text-xl">{v.lang.startsWith('ar') ? '🇸🇦' : '🌐'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{v.name}</p>
                  <p className="text-white/50 text-xs">{v.lang}</p>
                </div>
                {voiceName === v.name && <span className="text-white">✓</span>}
              </button>
            ))}
          </div>
          <p className="text-white/40 text-[11px] text-center mt-3">💡 يمكن لولي الأمر رفع تسجيل صوتي حقيقي لكل قصة من لوحة التحكم</p>
        </Sheet>
      )}

      {showTimer && (
        <Sheet onClose={() => setShowTimer(false)} title="مؤقت النوم">
          {[5, 10, 15, 30, 60].map(m => (
            <button key={m} className="w-full py-3 mb-2 rounded-xl text-white text-base btn-press" style={{ background: sleepMin === m ? '#5C35BF' : 'rgba(255,255,255,0.1)' }} onClick={() => setSleep(m)}>{m} دقيقة</button>
          ))}
          <button className="w-full py-3 rounded-xl text-white/50 text-base btn-press" onClick={() => setSleep(null)}>إيقاف المؤقت</button>
        </Sheet>
      )}

      {progress >= 100 && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 max-w-[390px] mx-auto">
          <div className="bg-white rounded-3xl p-8 mx-6 text-center bounce-in">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-black text-gray-800 mb-2">أحسنت!</h2>
            <p className="text-gray-500 mb-1">انتهيت من الاستماع</p>
            <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-xl mb-6"><span>+10</span><span>⭐</span></div>
            <div className="flex gap-2">
              <button onClick={() => { seek(0); sentenceRef.current = 0; setCompleted(false); play() }} className="flex-1 py-3 rounded-2xl font-bold text-gray-700 bg-gray-100 btn-press">🔄 مجدداً</button>
              <button onClick={() => { clearTrack(); router.push('/home') }} className="flex-1 py-3 rounded-2xl font-bold text-white btn-press" style={{ background: '#5C35BF' }}>الرئيسية</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Sheet({ children, onClose, title }: { children: React.ReactNode; onClose: () => void; title: string }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={onClose}>
      <div className="w-full max-w-[390px] mx-auto bg-gray-900 rounded-t-3xl p-6 slide-up" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-bold text-lg mb-4 text-center">{title}</h3>
        {children}
      </div>
    </div>
  )
}
