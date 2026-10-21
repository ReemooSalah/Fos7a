'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { setUser } from '@/lib/store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const finish = (name: string, mail: string) => {
    setUser({ id: '1', name, email: mail, joinDate: new Date().toISOString() })
    router.push(localStorage.getItem('fos7a_child_profile') ? '/home' : '/setup')
  }

  const handleLogin = async () => {
    if (!email || !password) { setError('يرجى إدخال جميع البيانات'); return }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('البريد الإلكتروني غير صحيح'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    finish('ولي الأمر', email)
  }

  const handleGoogle = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    setLoading(false)
    finish('المستخدم', 'user@gmail.com')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #2D1B69 0%, #5C35BF 50%, #f3f4f6 50%)' }}>
      <div className="pt-14 pb-8 px-6 text-center">
        <div className="text-5xl mb-3">🎧</div>
        <h1 className="text-3xl font-black text-white">فُسحة</h1>
        <p className="text-white/70 text-sm mt-1">أهلاً بعودتك!</p>
      </div>

      <div className="flex-1 bg-gray-100 rounded-t-3xl px-6 pt-8 pb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">تسجيل الدخول</h2>

        <button onClick={handleGoogle} className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 flex items-center justify-center gap-3 mb-6 btn-press shadow-sm">
          <span className="text-xl">🔵</span>
          <span className="font-semibold text-gray-700">الدخول بحساب Google</span>
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" /><span className="text-gray-400 text-sm">أو</span><div className="flex-1 h-px bg-gray-200" />
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">البريد الإلكتروني</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com" dir="ltr"
              className="w-full bg-white rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-purple-400 text-sm text-left" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">كلمة المرور</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
              className="w-full bg-white rounded-xl px-4 py-3.5 text-gray-800 placeholder-gray-400 border border-gray-200 focus:outline-none focus:border-purple-400 text-sm" />
          </div>
        </div>

        <div className="text-left mt-2">
          <button className="text-sm font-medium" style={{ color: '#5C35BF' }}>نسيت كلمة المرور؟</button>
        </div>

        {error && <div className="mt-3 bg-red-50 text-red-600 rounded-xl px-4 py-2.5 text-sm font-medium">{error}</div>}

        <button onClick={handleLogin} disabled={loading}
          className="w-full mt-6 py-4 rounded-2xl font-bold text-white text-lg btn-press shadow-lg"
          style={{ background: loading ? '#9CA3AF' : 'linear-gradient(135deg, #5C35BF, #2D1B69)' }}>
          {loading ? '⏳ جاري الدخول...' : 'دخول'}
        </button>

        <div className="text-center mt-6">
          <span className="text-gray-500 text-sm">ليس لديك حساب؟ </span>
          <Link href="/auth/register" className="font-bold text-sm" style={{ color: '#5C35BF' }}>سجّل الآن</Link>
        </div>
      </div>
    </div>
  )
}
