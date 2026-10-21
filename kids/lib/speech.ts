/**
 * طبقة الصوت: قراءة آلية (Web Speech API) مع اختيار الصوت،
 * أو ملفات صوتية مرفوعة من الداشبورد.
 */

export interface VoiceSettings {
  /** اسم صوت النظام المختار (speechSynthesis) */
  voiceName: string | null
  /** سرعة القراءة 0.5 – 1.5 */
  rate: number
  /** طبقة الصوت 0.5 – 2 */
  pitch: number
}

const KEY = 'fos7a_voice'
const LETTER_AUDIO_KEY = 'fos7a_letter_audio'

export const defaultVoiceSettings: VoiceSettings = { voiceName: null, rate: 0.9, pitch: 1.1 }

export function getVoiceSettings(): VoiceSettings {
  if (typeof window === 'undefined') return defaultVoiceSettings
  try {
    const s = localStorage.getItem(KEY)
    if (s) return { ...defaultVoiceSettings, ...JSON.parse(s) }
  } catch {}
  return defaultVoiceSettings
}

export function saveVoiceSettings(s: Partial<VoiceSettings>) {
  localStorage.setItem(KEY, JSON.stringify({ ...getVoiceSettings(), ...s }))
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** أصوات النظام العربية أولاً ثم الباقي */
export function listVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return []
  const all = window.speechSynthesis.getVoices()
  const ar = all.filter(v => v.lang.toLowerCase().startsWith('ar'))
  const rest = all.filter(v => !v.lang.toLowerCase().startsWith('ar'))
  return [...ar, ...rest]
}

/** تنتظر تحميل الأصوات (بعض المتصفحات تحمّلها بشكل غير متزامن) */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!speechSupported()) return resolve([])
    const v = listVoices()
    if (v.length) return resolve(v)
    const handler = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', handler)
      resolve(listVoices())
    }
    window.speechSynthesis.addEventListener('voiceschanged', handler)
    setTimeout(() => resolve(listVoices()), 1500)
  })
}

export function pickVoice(): SpeechSynthesisVoice | null {
  const voices = listVoices()
  if (!voices.length) return null
  const { voiceName } = getVoiceSettings()
  if (voiceName) {
    const found = voices.find(v => v.name === voiceName)
    if (found) return found
  }
  return voices.find(v => v.lang.toLowerCase().startsWith('ar')) || voices[0]
}

export interface SpeakOptions {
  rate?: number
  pitch?: number
  onEnd?: () => void
  onBoundary?: (charIndex: number) => void
}

export function stopSpeaking() {
  if (speechSupported()) window.speechSynthesis.cancel()
}

export function pauseSpeaking() {
  if (speechSupported()) window.speechSynthesis.pause()
}

export function resumeSpeaking() {
  if (speechSupported()) window.speechSynthesis.resume()
}

export function speak(text: string, opts: SpeakOptions = {}): SpeechSynthesisUtterance | null {
  if (!speechSupported()) { opts.onEnd?.(); return null }
  window.speechSynthesis.cancel()
  const settings = getVoiceSettings()
  const u = new SpeechSynthesisUtterance(text)
  const voice = pickVoice()
  if (voice) u.voice = voice
  u.lang = voice?.lang || 'ar-SA'
  u.rate = opts.rate ?? settings.rate
  u.pitch = opts.pitch ?? settings.pitch
  u.onend = () => opts.onEnd?.()
  u.onerror = () => opts.onEnd?.()
  if (opts.onBoundary) u.onboundary = e => opts.onBoundary?.(e.charIndex)
  window.speechSynthesis.speak(u)
  return u
}

// ── أصوات الحروف المرفوعة من الداشبورد ─────────────────────
export type LetterAudioMap = Record<string, string>

export function getLetterAudio(): LetterAudioMap {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(LETTER_AUDIO_KEY) || '{}') } catch { return {} }
}

export function setLetterAudio(letterId: string, url: string | null) {
  const map = getLetterAudio()
  if (url) map[letterId] = url
  else delete map[letterId]
  localStorage.setItem(LETTER_AUDIO_KEY, JSON.stringify(map))
}

let currentAudio: HTMLAudioElement | null = null

/** يشغّل ملف صوت مرفوع إن وُجد، وإلا يقرأ النص آلياً */
export function playLetterSound(letterId: string, fallbackText: string, onEnd?: () => void) {
  const url = getLetterAudio()[letterId]
  if (currentAudio) { currentAudio.pause(); currentAudio = null }
  if (url) {
    stopSpeaking()
    currentAudio = new Audio(url)
    currentAudio.onended = () => onEnd?.()
    currentAudio.onerror = () => speak(fallbackText, { onEnd })
    currentAudio.play().catch(() => speak(fallbackText, { onEnd }))
    return
  }
  speak(fallbackText, { onEnd })
}
