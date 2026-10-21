'use client'

import { useRouter } from 'next/navigation'

export default function Paywall({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 bg-black/60 flex items-end z-50" onClick={onClose}>
      <div
        className="w-full max-w-[390px] mx-auto bg-white rounded-t-3xl p-6 slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-6xl mb-3">👑</div>
          <h3 className="text-xl font-black text-gray-800 mb-1">محتوى مميز</h3>
          <p className="text-gray-500 text-sm mb-5">
            هذا المحتوى متاح للمشتركين. اشترك بالبريد الإلكتروني واحصل على 7 أيام تجربة مجانية.
          </p>
          <button
            onClick={() => router.push('/subscription')}
            className="w-full py-4 rounded-2xl text-white font-bold btn-press shadow-lg mb-2"
            style={{ background: 'linear-gradient(135deg, #F5A623, #E8890B)' }}
          >
            اشترك الآن 🎉
          </button>
          <button onClick={onClose} className="w-full py-3 text-gray-400 text-sm font-semibold btn-press">
            لاحقاً
          </button>
        </div>
      </div>
    </div>
  )
}
