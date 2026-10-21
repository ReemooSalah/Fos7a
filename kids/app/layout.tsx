import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'فسحة - تعلم وترفيه للأطفال',
  description: 'منصة صوتية تعليمية ترفيهية للأطفال باللغة العربية: حروف، قصص الأنبياء، أناشيد، قرآن وألعاب',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gray-100 min-h-screen" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <div className="max-w-[390px] mx-auto relative min-h-screen bg-gray-100">{children}</div>
      </body>
    </html>
  )
}
