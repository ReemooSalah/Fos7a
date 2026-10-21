'use client'

import { useRouter } from 'next/navigation'

export default function PageHeader({
  title, subtitle, right, back = true, gradient = true,
}: { title: string; subtitle?: string; right?: React.ReactNode; back?: boolean; gradient?: boolean }) {
  const router = useRouter()
  return (
    <div
      className="pt-12 pb-5 px-5"
      style={gradient ? { background: 'linear-gradient(135deg, #1E0A4A, #5C35BF)' } : { background: 'white' }}
    >
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center btn-press"
            style={{ background: gradient ? 'rgba(255,255,255,0.2)' : '#F3F4F6' }}
          >
            <span className={gradient ? 'text-white' : 'text-gray-600'}>→</span>
          </button>
        )}
        <div className="flex-1">
          <h1 className={`text-xl font-black ${gradient ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          {subtitle && <p className={`text-xs ${gradient ? 'text-white/60' : 'text-gray-400'}`}>{subtitle}</p>}
        </div>
        {right}
      </div>
    </div>
  )
}
