'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/home', emoji: '🏠', label: 'الرئيسية' },
  { href: '/letters', emoji: '🔤', label: 'الحروف' },
  { href: '/explore', emoji: '🔍', label: 'اكتشف' },
  { href: '/games', emoji: '🎮', label: 'ألعاب' },
  { href: '/rewards', emoji: '⭐', label: 'حسابي' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] bg-white border-t border-gray-100 z-40"
      style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.08)' }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-2xl transition-all btn-press min-w-[56px]"
              style={{ background: isActive ? 'rgba(92,53,191,0.1)' : 'transparent' }}
            >
              <span className="text-xl leading-none">{item.emoji}</span>
              <span className="text-xs font-semibold" style={{ color: isActive ? '#5C35BF' : '#9CA3AF' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
