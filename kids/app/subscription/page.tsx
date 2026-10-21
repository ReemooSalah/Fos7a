'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSubscription, getUser, setSubscription, type PlanId, type Subscription } from '@/lib/store'

const PLANS: { id: PlanId; name: string; price: string; period: string; color: string; emoji: string; popular?: boolean; features: string[]; disabled: string[] }[] = [
  { id: 'free', name: 'مجاني', price: '0', period: '', color: '#6b7280', emoji: '🎧',
    features: ['كل الحروف الـ28 مع الكتابة', '6 ألعاب تعليمية', 'قصص الأنبياء الأساسية', 'قراءة آلية بصوت تختاره'],
    disabled: ['القصص المميزة 👑', 'تحميل بدون إنترنت', 'حساب عائلي'] },
  { id: 'premium', name: 'مميز', price: '29', period: '/شهر', color: '#5C35BF', emoji: '👑', popular: true,
    features: ['كل مزايا المجاني', 'كل قصص الأنبياء كاملة', 'تحميل بدون إنترنت', 'بدون إعلانات', 'تقارير أسبوعية للوالدين', '7 أيام تجربة مجانية'],
    disabled: ['حساب عائلي (4 أطفال)'] },
  { id: 'family', name: 'عائلي', price: '49', period: '/شهر', color: '#F5A623', emoji: '👨‍👩‍👧‍👦',
    features: ['4 حسابات أطفال', 'كل مزايا المميز', 'لوحة تحكم الوالدين', 'تحليلات مفصلة', 'دعم أولوية', '7 أيام تجربة مجانية'], disabled: [] },
]

type Step = 'plans' | 'email' | 'code' | 'done'

export default function SubscriptionPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<PlanId>('premium')
  const [step, setStep] = useState<Step>('plans')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sentCode, setSentCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [existing, setExisting] = useState<Subscription | null>(null)

  useEffect(() => {
    setExisting(getSubscription())
    const u = getUser(); if (u?.email) setEmail(u.email)
  }, [])

  const plan = PLANS.find(p => p.id === selected)!

  const sendCode = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('أدخل بريداً إلكترونياً صحيحاً'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 900))
    // في النسخة التجريبية يُولَّد الرمز محلياً ويُعرض على الشاشة.
    // عند ربط خادم بريد (مثل Resend أو SendGrid) يُرسَل الرمز إلى البريد بدلاً من عرضه.
    const c = String(Math.floor(1000 + Math.random() * 9000))
    setSentCode(c); setLoading(false); setStep('code')
  }

  const verify = async () => {
    if (code !== sentCode) { setError('الرمز غير صحيح، حاول مرة أخرى'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    const until = new Date(); until.setDate(until.getDate() + (selected === 'free' ? 36500 : 7))
    setSubscription({ plan: selected, email, verified: true, since: new Date().toISOString(), until: until.toISOString() })
    const u = getUser(); if (u) localStorage.setItem('fos7a_user', JSON.stringify({ ...u, email, isPremium: selected !== 'free' }))
    setLoading(false); setStep('done')
    setTimeout(() => router.push('/home'), 2200)
  }

  const cancel = () => { setSubscription(null); setExisting(null) }

  if (step === 'done') return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white px-8 text-center" style={{ background: '#1E0A4A' }}>
      <div className="text-7xl mb-4 bounce-in">🎉</div>
      <h1 className="text-2xl font-bold mb-2">مرحباً بك في فسحة {plan.name}!</h1>
      <p className="text-white/60 text-sm">{selected === 'free' ? 'تم تفعيل حسابك' : 'بدأت تجربتك المجانية لمدة 7 أيام'}</p>
      <p className="text-white/40 text-xs mt-1">{email}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="px-5 pt-12 pb-8 text-white text-center relative" style={{ background: 'linear-gradient(180deg, #5C35BF, #2D1B69)' }}>
        <button onClick={() => (step === 'plans' ? router.back() : setStep(step === 'code' ? 'email' : 'plans'))} className="absolute top-12 right-5 text-white/70 text-xl btn-press">{step === 'plans' ? '✕' : '→'}</button>
        <div className="text-5xl mb-3">👑</div>
        <h1 className="text-2xl font-bold mb-1">{step === 'plans' ? 'اشترك في فسحة' : step === 'email' ? 'بريدك الإلكتروني' : 'تأكيد البريد'}</h1>
        <p className="text-white/70 text-sm">{step === 'plans' ? 'محتوى تعليمي آمن لأطفالك' : step === 'email' ? 'سنرسل لك رمز تحقق' : `أرسلنا رمزاً إلى ${email}`}</p>
      </div>

      {existing?.verified && existing.plan !== 'free' && step === 'plans' && (
        <div className="px-5 -mt-4 mb-2">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div className="flex-1"><p className="font-bold text-green-800 text-sm">اشتراكك {existing.plan === 'family' ? 'العائلي' : 'المميز'} مفعّل</p><p className="text-green-600 text-xs">{existing.email} · حتى {new Date(existing.until).toLocaleDateString('ar-EG')}</p></div>
            <button onClick={cancel} className="text-xs text-red-500 font-semibold btn-press">إلغاء</button>
          </div>
        </div>
      )}

      {step === 'plans' && (
        <>
          <div className="px-5 -mt-4">
            <div className="flex gap-2">
              {PLANS.map(p => (
                <button key={p.id} onClick={() => setSelected(p.id)} className="flex-1 py-3 rounded-2xl text-sm font-bold border-2 transition-all relative btn-press"
                  style={{ borderColor: selected === p.id ? '#5C35BF' : '#E5E7EB', background: selected === p.id ? '#5C35BF' : 'white', color: selected === p.id ? 'white' : '#4B5563' }}>
                  {p.emoji} {p.name}
                  {p.popular && <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: '#F5A623', color: '#1E0A4A' }}>الأشهر</span>}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 mt-5">
            <div className="bg-white rounded-3xl p-5 shadow-sm">
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold" style={{ color: plan.color }}>{plan.price}</span>
                <span className="text-gray-400 text-sm">{plan.price === '0' ? 'مجاناً للأبد' : `ريال${plan.period}`}</span>
              </div>
              <div className="space-y-2">
                {plan.features.map(f => <div key={f} className="flex items-center gap-2 text-sm text-gray-700"><span className="text-green-400">✓</span>{f}</div>)}
                {plan.disabled.map(f => <div key={f} className="flex items-center gap-2 text-sm text-gray-300"><span>✗</span>{f}</div>)}
              </div>
            </div>
          </div>
          <div className="px-5 mt-5">
            <button onClick={() => setStep('email')} className="btn-press w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg" style={{ background: `linear-gradient(135deg, ${plan.color}, #1E0A4A)` }}>
              {plan.price === '0' ? 'تفعيل بالبريد الإلكتروني' : `ابدأ التجربة المجانية — ثم ${plan.price} ريال${plan.period}`}
            </button>
            <p className="text-center text-gray-400 text-xs mt-3">الاشتراك عبر البريد الإلكتروني · يمكنك الإلغاء في أي وقت</p>
          </div>
        </>
      )}

      {step === 'email' && (
        <div className="px-5 mt-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <label className="block text-sm font-semibold text-gray-600 mb-2">البريد الإلكتروني لولي الأمر</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="parent@email.com" dir="ltr"
              className="w-full bg-gray-50 rounded-xl px-4 py-3.5 text-gray-800 border border-gray-200 focus:outline-none focus:border-purple-400 text-sm text-left" />
            <p className="text-xs text-gray-400 mt-2">سنستخدم بريدك لتأكيد الاشتراك وإرسال التقارير الأسبوعية.</p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <button onClick={sendCode} disabled={loading} className="btn-press w-full mt-5 py-4 rounded-2xl text-white font-bold shadow-lg" style={{ background: loading ? '#9CA3AF' : '#5C35BF' }}>
            {loading ? '⏳ جاري الإرسال...' : 'إرسال رمز التحقق 📧'}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="px-5 mt-6">
          <div className="bg-white rounded-3xl p-5 shadow-sm text-center">
            <p className="text-sm text-gray-600 mb-4">أدخل الرمز المكوّن من 4 أرقام</p>
            <input type="text" inputMode="numeric" maxLength={4} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} dir="ltr"
              className="w-48 mx-auto block text-center text-4xl font-black tracking-[12px] border-2 border-gray-200 rounded-2xl py-3 focus:outline-none focus:border-purple-400" placeholder="• • • •" />
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-right">
              <p className="text-amber-800 text-xs font-bold">🧪 وضع التجربة</p>
              <p className="text-amber-700 text-xs">لم يُربط خادم البريد بعد، لذا الرمز هو: <b className="text-base tracking-widest" dir="ltr">{sentCode}</b></p>
            </div>
            <button onClick={sendCode} className="text-xs mt-3 font-semibold btn-press" style={{ color: '#5C35BF' }}>إعادة إرسال الرمز</button>
          </div>
          <button onClick={verify} disabled={loading || code.length < 4} className="btn-press w-full mt-5 py-4 rounded-2xl text-white font-bold shadow-lg" style={{ background: loading || code.length < 4 ? '#9CA3AF' : '#5C35BF' }}>
            {loading ? '⏳ جاري التفعيل...' : 'تأكيد وتفعيل ✓'}
          </button>
        </div>
      )}
    </div>
  )
}
