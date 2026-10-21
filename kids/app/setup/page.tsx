'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setProfile } from '@/lib/store'

const AVATARS = ['🦁', '🐘', '🦊', '🐬', '🐸', '🦋', '🐼', '🦄', '🐯', '🐺', '🦉', '🐧']
const INTERESTS = [
  { id: 'letters', label: 'الحروف', emoji: '🔤' },
  { id: 'prophets', label: 'قصص الأنبياء', emoji: '🌟' },
  { id: 'stories', label: 'القصص', emoji: '📚' },
  { id: 'quran', label: 'القرآن', emoji: '📖' },
  { id: 'nasheeds', label: 'الأناشيد', emoji: '🎵' },
  { id: 'games', label: 'الألعاب', emoji: '🎮' },
  { id: 'science', label: 'العلوم', emoji: '🔬' },
  { id: 'nature', label: 'الطبيعة', emoji: '🌿' },
]

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const [avatar, setAvatar] = useState('🦁')
  const [childName, setChildName] = useState('')
  const [age, setAge] = useState(0)
  const [interests, setInterests] = useState<string[]>([])
  const router = useRouter()

  const toggle = (id: string) => setInterests(p => (p.includes(id) ? p.filter(i => i !== id) : [...p, id]))
  const finish = () => { setProfile({ avatar, childName, age, interests }); router.push('/home') }
  const disabled = (step === 1 && !childName.trim()) || (step === 2 && age === 0)

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <div className="pt-12 pb-6 px-6" style={{ background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' }}>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 h-1.5 rounded-full transition-all duration-300" style={{ background: s <= step ? '#F5A623' : 'rgba(255,255,255,0.3)' }} />
          ))}
        </div>
        <h1 className="text-2xl font-black text-white">
          {step === 1 && '👋 مرحباً! من هو طفلك؟'}
          {step === 2 && '🎂 كم عمره؟'}
          {step === 3 && '❤️ ما الذي يحبه؟'}
        </h1>
        <p className="text-white/60 text-sm mt-1">الخطوة {step} من 3</p>
      </div>

      <div className="flex-1 px-6 py-8">
        {step === 1 && (
          <div>
            <p className="text-gray-600 font-semibold mb-5 text-center">اختر صورة لطفلك</p>
            <div className="grid grid-cols-4 gap-3 mb-8">
              {AVATARS.map(a => (
                <button key={a} onClick={() => setAvatar(a)} className="aspect-square rounded-2xl text-4xl flex items-center justify-center btn-press transition-all"
                  style={{ background: avatar === a ? '#5C35BF' : 'white', transform: avatar === a ? 'scale(1.05)' : 'scale(1)', boxShadow: avatar === a ? '0 4px 20px rgba(92,53,191,0.4)' : '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {a}
                </button>
              ))}
            </div>
            <p className="text-gray-600 font-semibold mb-3">اسم الطفل</p>
            <input type="text" value={childName} onChange={e => setChildName(e.target.value)} placeholder="مثال: سعد، نور، ريم..."
              className="w-full bg-white rounded-2xl px-5 py-4 text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-purple-400 text-base font-medium" />
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="text-8xl mb-6">{age === 0 ? '🤔' : age <= 4 ? '👶' : age <= 7 ? '🧒' : age <= 10 ? '👦' : '🧑'}</div>
            <div className="grid grid-cols-3 gap-3">
              {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(a => (
                <button key={a} onClick={() => setAge(a)} className="py-4 rounded-2xl font-bold text-xl btn-press"
                  style={{ background: age === a ? '#5C35BF' : 'white', color: age === a ? 'white' : '#374151', boxShadow: age === a ? '0 4px 20px rgba(92,53,191,0.4)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                  {a}
                </button>
              ))}
            </div>
            {age > 0 && <p className="mt-4 text-gray-500 font-medium">{age} {age <= 10 ? 'سنوات' : 'سنة'}</p>}
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-gray-500 text-sm mb-5 text-center">اختر اهتماماً واحداً أو أكثر</p>
            <div className="grid grid-cols-2 gap-3">
              {INTERESTS.map(it => {
                const sel = interests.includes(it.id)
                return (
                  <button key={it.id} onClick={() => toggle(it.id)} className="rounded-2xl py-4 px-4 flex items-center gap-3 btn-press transition-all"
                    style={{ background: sel ? '#5C35BF' : 'white', boxShadow: sel ? '0 4px 16px rgba(92,53,191,0.4)' : '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <span className="text-2xl">{it.emoji}</span>
                    <span className="font-semibold text-sm" style={{ color: sel ? 'white' : '#374151' }}>{it.label}</span>
                    {sel && <span className="mr-auto text-white text-sm">✓</span>}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-10 flex gap-3">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="flex-1 py-4 rounded-2xl font-semibold btn-press bg-white text-gray-600 border border-gray-200">→ رجوع</button>
        )}
        <button onClick={() => (step === 3 ? finish() : setStep(step + 1))} disabled={disabled}
          className="flex-1 py-4 rounded-2xl font-bold text-white text-lg btn-press shadow-lg"
          style={{ background: disabled ? '#9CA3AF' : 'linear-gradient(135deg, #5C35BF, #2D1B69)' }}>
          {step === 3 ? '🎉 ابدأ الاستكشاف!' : 'التالي ←'}
        </button>
      </div>
    </div>
  )
}
