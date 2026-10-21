'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import MiniPlayer from '@/components/MiniPlayer'
import PageHeader from '@/components/PageHeader'
import { getVoiceSettings, loadVoices, saveVoiceSettings, speak, speechSupported } from '@/lib/speech'
import { getSubscription, getUser, type Subscription, type User } from '@/lib/store'

export default function SettingsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState(true)
  const [safeMode, setSafeMode] = useState(true)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceName, setVoiceName] = useState<string | null>(null)
  const [rate, setRate] = useState(0.9)
  const [pitch, setPitch] = useState(1.1)
  const [user, setUser] = useState<User | null>(null)
  const [sub, setSub] = useState<Subscription | null>(null)
  const [showVoices, setShowVoices] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    setSupported(speechSupported())
    try {
      const s = JSON.parse(localStorage.getItem('fos7a_settings') || '{}')
      setNotifications(s.notifications ?? true); setSafeMode(s.safeMode ?? true)
    } catch {}
    const v = getVoiceSettings(); setVoiceName(v.voiceName); setRate(v.rate); setPitch(v.pitch)
    loadVoices().then(setVoices)
    setUser(getUser()); setSub(getSubscription())
  }, [])

  const save = (u: object) => {
    const c = JSON.parse(localStorage.getItem('fos7a_settings') || '{}')
    localStorage.setItem('fos7a_settings', JSON.stringify({ ...c, ...u }))
  }

  const signOut = () => {
    ['fos7a_user', 'fos7a_child_profile'].forEach(k => localStorage.removeItem(k))
    router.push('/')
  }

  const preview = () => speak('مرحباً يا صديقي! أنا صوت فسحة، هيا نتعلم معاً')
  const current = voices.find(v => v.name === voiceName)

  const Row = ({ label, sub, right, onClick }: { label: string; sub?: string; right: React.ReactNode; onClick?: () => void }) => (
    <div className={`flex items-center justify-between py-4 border-b border-gray-50 ${onClick ? 'btn-press cursor-pointer' : ''}`} onClick={onClick}>
      <div><p className="text-gray-800 text-sm font-medium">{label}</p>{sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}</div>
      {right}
    </div>
  )
  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="w-12 h-6 rounded-full transition-colors relative" style={{ background: value ? '#5C35BF' : '#E5E7EB' }}>
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'right-1' : 'left-1'}`} />
    </button>
  )
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl px-4 py-1"><p className="text-xs text-gray-400 pt-3 pb-1 font-semibold">{title}</p>{children}</div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-36">
      <PageHeader title="الإعدادات" gradient={false} />

      <div className="px-5 mt-4 space-y-3">
        <Section title="الحساب">
          <Row label={user?.name || 'ولي الأمر'} sub={user?.email} right={<span className="text-gray-300">👤</span>} />
          <Row label="الاشتراك" sub={sub?.verified && sub.plan !== 'free' ? `${sub.plan === 'family' ? 'عائلي' : 'مميز'} · حتى ${new Date(sub.until).toLocaleDateString('ar-EG')}` : 'حساب مجاني'}
            right={<button onClick={() => router.push('/subscription')} className="text-sm font-semibold" style={{ color: '#5C35BF' }}>{sub?.verified && sub.plan !== 'free' ? 'إدارة' : 'ترقية 👑'}</button>} />
          <Row label="لوحة الوالدين" sub="تقارير الاستماع والتعلم" right={<button onClick={() => router.push('/parent-dashboard')} className="text-sm font-semibold" style={{ color: '#5C35BF' }}>فتح</button>} />
          <Row label="لوحة التحكم (المحتوى)" sub="رفع قصص وأصوات جديدة" right={<button onClick={() => router.push('/admin')} className="text-sm font-semibold" style={{ color: '#5C35BF' }}>🔐 دخول</button>} />
        </Section>

        <Section title="🗣️ صوت القراءة">
          {!supported ? <p className="text-xs text-gray-400 py-3">القراءة الآلية غير مدعومة في هذا المتصفح</p> : (
            <>
              <Row label="الصوت" sub={current ? `${current.name} (${current.lang})` : 'الافتراضي (عربي)'} onClick={() => setShowVoices(!showVoices)}
                right={<span className="text-sm font-semibold" style={{ color: '#5C35BF' }}>{showVoices ? 'إغلاق' : 'تغيير'}</span>} />
              {showVoices && (
                <div className="max-h-56 overflow-y-auto space-y-1 py-2">
                  {voices.length === 0 && <p className="text-xs text-gray-400 text-center py-3">لا تتوفر أصوات. على iPhone فعّل الأصوات من الإعدادات › تسهيلات الاستخدام › المحتوى المنطوق</p>}
                  {voices.map(v => (
                    <button key={v.name} onClick={() => { saveVoiceSettings({ voiceName: v.name }); setVoiceName(v.name); setTimeout(preview, 50) }}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl text-right btn-press" style={{ background: voiceName === v.name ? '#EDE9FE' : '#F9FAFB' }}>
                      <span>{v.lang.startsWith('ar') ? '🇸🇦' : '🌐'}</span>
                      <div className="flex-1 min-w-0"><p className="text-sm text-gray-800 truncate">{v.name}</p><p className="text-[10px] text-gray-400">{v.lang}</p></div>
                      {voiceName === v.name && <span style={{ color: '#5C35BF' }}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
              <div className="py-3 border-b border-gray-50">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-800 font-medium">السرعة</span><span className="text-gray-400 text-xs">{rate.toFixed(2)}x</span></div>
                <input type="range" min={0.5} max={1.5} step={0.05} value={rate} onChange={e => { const r = +e.target.value; setRate(r); saveVoiceSettings({ rate: r }) }} className="w-full" style={{ accentColor: '#5C35BF' }} />
              </div>
              <div className="py-3 border-b border-gray-50">
                <div className="flex justify-between text-sm mb-1"><span className="text-gray-800 font-medium">طبقة الصوت</span><span className="text-gray-400 text-xs">{pitch.toFixed(1)}</span></div>
                <input type="range" min={0.5} max={2} step={0.1} value={pitch} onChange={e => { const p = +e.target.value; setPitch(p); saveVoiceSettings({ pitch: p }) }} className="w-full" style={{ accentColor: '#5C35BF' }} />
              </div>
              <button onClick={preview} className="w-full my-3 py-3 rounded-xl text-white font-bold text-sm btn-press" style={{ background: '#5C35BF' }}>🔊 جرّب الصوت</button>
            </>
          )}
        </Section>

        <Section title="الخصوصية والأمان">
          <Row label="الإشعارات" right={<Toggle value={notifications} onChange={v => { setNotifications(v); save({ notifications: v }) }} />} />
          <Row label="الوضع الآمن للأطفال" sub="يمنع الخروج من التطبيق بدون رمز الوالدين" right={<Toggle value={safeMode} onChange={v => { setSafeMode(v); save({ safeMode: v }) }} />} />
        </Section>

        <Section title="عن التطبيق">
          <Row label="الإصدار" right={<span className="text-gray-400 text-sm">0.2.0</span>} />
          <Row label="سياسة الخصوصية" right={<span className="text-gray-300 text-lg">←</span>} />
          <Row label="شروط الاستخدام" right={<span className="text-gray-300 text-lg">←</span>} />
        </Section>

        <button onClick={signOut} className="w-full bg-white rounded-2xl py-4 text-red-500 font-semibold text-sm shadow-sm btn-press">تسجيل الخروج</button>
      </div>

      <MiniPlayer />
      <BottomNav />
    </div>
  )
}
