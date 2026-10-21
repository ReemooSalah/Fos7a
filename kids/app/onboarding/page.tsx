'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const slides = [
  { emoji: '🔤', title: 'تعلّم الحروف', description: 'كل الحروف العربية من الألف إلى الياء: استمع، اكتب بإصبعك، ورتّب الكلمات', from: '#7C3AED', to: '#4F46E5', dots: ['أ', 'ب', 'ت'] },
  { emoji: '🌟', title: 'قصص الأنبياء', description: 'قصص الأنبياء كاملة من آدم إلى محمد ﷺ بأسلوب مبسّط وصوت تختاره بنفسك', from: '#F59E0B', to: '#EA580C', dots: ['⛵', '🐋', '🔥'] },
  { emoji: '🎮', title: 'العب واكسب النجوم', description: 'ألعاب تعليمية ممتعة ونظام مكافآت وشارات يحفّز طفلك على التعلم كل يوم', from: '#EC4899', to: '#BE185D', dots: ['🏆', '⭐', '🎯'] },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const router = useRouter()

  const finish = () => {
    localStorage.setItem('fos7a_onboarding_done', 'true')
    router.push('/auth/login')
  }

  const slide = slides[current]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(135deg, ${slide.from}, ${slide.to})`, transition: 'background 0.4s' }}>
      <div className="flex justify-between items-center p-4 pt-12">
        <div />
        <button onClick={finish} className="text-white/70 text-sm font-medium btn-press">تخطي</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="relative mb-8">
          {slide.dots.map((dot, i) => (
            <span
              key={i}
              className="absolute text-2xl font-black text-white/90"
              style={{
                top: i === 0 ? '-30px' : i === 1 ? '-20px' : '-35px',
                left: i === 0 ? '-30px' : i === 2 ? '30px' : undefined,
                right: i === 1 ? '-25px' : undefined,
                animation: `float ${1.5 + i * 0.3}s ease-in-out infinite alternate`,
              }}
            >
              {dot}
            </span>
          ))}
          <div className="w-40 h-40 rounded-full flex items-center justify-center bounce-in" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
            <span className="text-8xl">{slide.emoji}</span>
          </div>
        </div>
        <h2 className="text-3xl font-black text-white mb-4">{slide.title}</h2>
        <p className="text-white/80 text-base leading-relaxed font-medium">{slide.description}</p>
      </div>

      <div className="p-8 pb-12">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-300"
              style={{ width: i === current ? '24px' : '8px', height: '8px', background: i === current ? 'white' : 'rgba(255,255,255,0.4)' }}
            />
          ))}
        </div>
        <button
          onClick={() => (current < slides.length - 1 ? setCurrent(current + 1) : finish())}
          className="w-full py-4 rounded-2xl font-bold text-lg btn-press shadow-lg"
          style={{ background: 'white', color: slide.from }}
        >
          {current === slides.length - 1 ? 'ابدأ الآن 🚀' : 'التالي ←'}
        </button>
      </div>

      <style jsx>{`
        @keyframes float { from { transform: translateY(0px); } to { transform: translateY(-10px); } }
      `}</style>
    </div>
  )
}
