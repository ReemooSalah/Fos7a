'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { setUser } from '@/lib/store'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) { setError('يرجى إدخال جميع البيانات'); return }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('البريد الإلكتروني غير صحيح'); return }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    setUser({ id: Date.now().toString(), name, email, joinDate: new Date().toISOString() })
    setLoading(false)
    router.push('/setup')
  }

  const Field = ({ label, type, value, set, placeholder, ltr }: { label: string; type: string; value: string; set: (v: string) => void; placeholder: string; ltr?: boolean }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-600 mb-2">{label}</label>
      <input type={type} value={value} onChange={e => set(e.target.value)} placeholder={placeholder} dir={ltr ? 'ltr' : 'rtl'}
        className={`w-full bg-white rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-purple-400 text-sm ${ltr ? 'text-left' : ''}`} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #5C35BF 40%, #f3f4f6 40%)' }}>
      <div className="pt-10 pb-6 px-6 flex items-center gap-3">
        <Link href="/auth/login" className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center btn-press">
          <span className="text-white text-lg">→</span>
        </Link>
        <div>
          <h1 className="text-xl font-black text-white">إنشاء حساب جديد</h1>
          <p className="text-white/60 text-xs">انضم إلى عائلة فسحة</p>
        </div>
      </div>

      <div className="flex-1 bg-gray-100 rounded-t-3xl px-6 pt-8 pb-6">
        <div className="space-y-4">
          <Field label="اسم ولي الأمر" type="text" value={name} set={setName} placeholder="أحمد محمد" />
          <Field label="البريد الإلكتروني" type="email" value={email} set={setEmail} placeholder="example@email.com" ltr />
          <Field label="كلمة المرور" type="password" value={password} set={setPassword} placeholder="6 أحرف على الأقل" />
          <Field label="تأكيد كلمة المرور" type="password" value={confirm} set={setConfirm} placeholder="••••••••" />
        </div>

        {error && <div className="mt-3 bg-red-50 text-red-600 rounded-xl px-4 py-2.5 text-sm font-medium">{error}</div>}

        <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
          بالتسجيل أنت توافق على <span className="font-semibold" style={{ color: '#5C35BF' }}>شروط الاستخدام</span> و <span className="font-semibold" style={{ color: '#5C35BF' }}>سياسة الخصوصية</span>
        </p>

        <button onClick={handleRegister} disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg btn-press shadow-lg"
          style={{ background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #5C35BF, #2D1B69)' }}>
          {loading ? '⏳ جاري إنشاء الحساب...' : 'إنشاء الحساب 🎉'}
        </button>

        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">لديك حساب بالفعل؟ </span>
          <Link href="/auth/login" className="font-bold text-sm" style={{ color: '#5C35BF' }}>سجّل دخولك</Link>
        </div>
      </div>
    </div>
  )
}
