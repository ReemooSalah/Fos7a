/** مساعدات التخزين المحلي لحالة الطفل والاشتراك والتقدم */

export interface User {
  id: string
  name: string
  email: string
  joinDate: string
}

export interface ChildProfile {
  avatar: string
  childName: string
  age: number
  interests: string[]
}

export type PlanId = 'free' | 'premium' | 'family'

export interface Subscription {
  plan: PlanId
  email: string
  verified: boolean
  since: string
  /** تاريخ انتهاء التجربة/الاشتراك */
  until: string
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export const getUser = () => read<User | null>('fos7a_user', null)
export const setUser = (u: User) => write('fos7a_user', u)
export const getProfile = () => read<ChildProfile | null>('fos7a_child_profile', null)
export const setProfile = (p: ChildProfile) => write('fos7a_child_profile', p)

// ── الاشتراك ─────────────────────────────────────────────
export const getSubscription = () => read<Subscription | null>('fos7a_subscription', null)
export const setSubscription = (s: Subscription | null) =>
  s ? write('fos7a_subscription', s) : localStorage.removeItem('fos7a_subscription')

export function isPremiumActive(): boolean {
  const s = getSubscription()
  if (!s || !s.verified || s.plan === 'free') return false
  return new Date(s.until).getTime() > Date.now()
}

// ── النجوم ────────────────────────────────────────────────
export const getStars = () => (typeof window === 'undefined' ? 0 : parseInt(localStorage.getItem('fos7a_stars') || '0', 10))
export function addStars(n: number): number {
  const total = getStars() + n
  localStorage.setItem('fos7a_stars', String(total))
  return total
}

// ── الشارات ───────────────────────────────────────────────
export const getBadges = () => read<string[]>('fos7a_badges', [])
export function unlockBadge(id: string): boolean {
  const b = getBadges()
  if (b.includes(id)) return false
  write('fos7a_badges', [...b, id])
  return true
}

// ── تقدم الحروف ───────────────────────────────────────────
export interface LetterProgress {
  learned: string[]  // حروف تم الاستماع لها واستكشافها
  written: string[]  // حروف كتبها الطفل بنجاح
}
export const getLetterProgress = () => read<LetterProgress>('fos7a_letters', { learned: [], written: [] })
export function markLetterLearned(id: string) {
  const p = getLetterProgress()
  if (!p.learned.includes(id)) {
    p.learned.push(id)
    write('fos7a_letters', p)
    if (p.learned.length >= 14) unlockBadge('letters_half')
    if (p.learned.length >= 28) unlockBadge('letters_all')
    return true
  }
  return false
}
export function markLetterWritten(id: string) {
  const p = getLetterProgress()
  if (!p.written.includes(id)) {
    p.written.push(id)
    write('fos7a_letters', p)
    if (p.written.length >= 10) unlockBadge('writer')
    return true
  }
  return false
}

// ── الألعاب ───────────────────────────────────────────────
export function recordGameWin() {
  const wins = parseInt(localStorage.getItem('fos7a_game_wins') || '0', 10) + 1
  localStorage.setItem('fos7a_game_wins', String(wins))
  if (wins >= 5) unlockBadge('game_master')
}

// ── السجل والمفضلة ────────────────────────────────────────
export const getFavorites = () => read<string[]>('fos7a_favorites', [])
export function toggleFavorite(id: string): boolean {
  const f = getFavorites()
  const next = f.includes(id) ? f.filter(x => x !== id) : [...f, id]
  write('fos7a_favorites', next)
  return next.includes(id)
}
export const getDownloads = () => read<string[]>('fos7a_downloads', [])
export function toggleDownload(id: string): boolean {
  const d = getDownloads()
  const next = d.includes(id) ? d.filter(x => x !== id) : [...d, id]
  write('fos7a_downloads', next)
  return next.includes(id)
}
export const getHistory = () => read<string[]>('fos7a_history', [])
export function pushHistory(id: string) {
  const h = getHistory()
  write('fos7a_history', [id, ...h.filter(x => x !== id)].slice(0, 30))
  const prophetsListened = h.filter(x => x.startsWith('p-')).length + (id.startsWith('p-') ? 1 : 0)
  if (h.length === 0) unlockBadge('first_story')
  if (h.length + 1 >= 5) unlockBadge('five_stories')
  if (prophetsListened >= 3) unlockBadge('prophet_lover')
}

// ── سجل الاستماع اليومي (للوالدين) ──────────────────────
export interface DayLog { date: string; minutes: number; items: string[] }
export function logListening(id: string, seconds: number) {
  const logs = read<DayLog[]>('fos7a_daily_log', [])
  const today = new Date().toISOString().slice(0, 10)
  let day = logs.find(l => l.date === today)
  if (!day) { day = { date: today, minutes: 0, items: [] }; logs.push(day) }
  day.minutes += seconds / 60
  if (!day.items.includes(id)) day.items.push(id)
  write('fos7a_daily_log', logs.slice(-30))
  // streak
  const dates = new Set(logs.map(l => l.date))
  let streak = 0
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    if (dates.has(d.toISOString().slice(0, 10))) streak++
    else break
  }
  if (streak >= 7) unlockBadge('streak_7')
}
export const getDailyLogs = () => read<DayLog[]>('fos7a_daily_log', [])

// ── المشغل ───────────────────────────────────────────────
export interface CurrentTrack { id: string; title: string; emoji: string; coverColor: string }
export const getCurrentTrack = () => read<CurrentTrack | null>('fos7a_current_track', null)
export function startTrack(t: CurrentTrack, progress = 0) {
  write('fos7a_current_track', t)
  localStorage.setItem('fos7a_is_playing', 'true')
  localStorage.setItem('fos7a_progress', String(progress))
  pushHistory(t.id)
}
export function clearTrack() {
  localStorage.removeItem('fos7a_current_track')
  localStorage.removeItem('fos7a_is_playing')
  localStorage.removeItem('fos7a_progress')
}
