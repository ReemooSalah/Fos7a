'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  /** الحرف المراد كتابته */
  char: string
  /** لون القلم */
  color?: string
  /** يُستدعى عند اكتمال التتبع بنسبة كافية */
  onComplete?: () => void
  /** نسبة التغطية المطلوبة للنجاح (0–1) */
  threshold?: number
}

const SIZE = 280

/**
 * لوحة تتبع الحرف: يُرسم الحرف بشكل باهت، ويرسم الطفل فوقه بإصبعه.
 * يُحسب التقدم عبر مقارنة البكسلات المرسومة مع بكسلات الحرف.
 */
export default function TracingCanvas({ char, color = '#5C35BF', onComplete, threshold = 0.55 }: Props) {
  const guideRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const maskRef = useRef<Uint8Array | null>(null)
  const hitRef = useRef<Set<number>>(new Set())
  const totalRef = useRef(1)
  const [coverage, setCoverage] = useState(0)
  const [done, setDone] = useState(false)
  const [strokes, setStrokes] = useState(0)

  // رسم الحرف الإرشادي وحساب القناع
  useEffect(() => {
    const g = guideRef.current
    if (!g) return
    const ctx = g.getContext('2d')!
    ctx.clearRect(0, 0, SIZE, SIZE)
    // خلفية نقاط
    ctx.fillStyle = '#E9E5F5'
    for (let x = 20; x < SIZE; x += 26) for (let y = 20; y < SIZE; y += 26) { ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill() }
    // خط الأساس
    ctx.strokeStyle = '#D8D0F0'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(20, SIZE * 0.68); ctx.lineTo(SIZE - 20, SIZE * 0.68); ctx.stroke(); ctx.setLineDash([])
    // الحرف
    ctx.font = `bold ${SIZE * 0.62}px Cairo, "Noto Naskh Arabic", sans-serif`
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(92,53,191,0.18)'
    ctx.fillText(char, SIZE / 2, SIZE / 2 + 8)
    ctx.strokeStyle = 'rgba(92,53,191,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([5, 5])
    ctx.strokeText(char, SIZE / 2, SIZE / 2 + 8)
    ctx.setLineDash([])

    // قناع البكسلات التي تخص الحرف (نحسب على شبكة 4×4 لتخفيف الحمل)
    const tmp = document.createElement('canvas'); tmp.width = SIZE; tmp.height = SIZE
    const t = tmp.getContext('2d')!
    t.font = ctx.font; t.textAlign = 'center'; t.textBaseline = 'middle'; t.fillStyle = '#000'
    t.fillText(char, SIZE / 2, SIZE / 2 + 8)
    const img = t.getImageData(0, 0, SIZE, SIZE).data
    const cells = SIZE / 4
    const mask = new Uint8Array(cells * cells)
    let total = 0
    for (let cy = 0; cy < cells; cy++) for (let cx = 0; cx < cells; cx++) {
      let filled = false
      for (let dy = 0; dy < 4 && !filled; dy++) for (let dx = 0; dx < 4 && !filled; dx++) {
        const i = ((cy * 4 + dy) * SIZE + (cx * 4 + dx)) * 4 + 3
        if (img[i] > 100) filled = true
      }
      if (filled) { mask[cy * cells + cx] = 1; total++ }
    }
    maskRef.current = mask; totalRef.current = Math.max(total, 1)
    hitRef.current = new Set(); setCoverage(0); setDone(false); setStrokes(0)
    const d = drawRef.current?.getContext('2d'); d?.clearRect(0, 0, SIZE, SIZE)
  }, [char])

  const pos = (e: React.PointerEvent) => {
    const rect = drawRef.current!.getBoundingClientRect()
    const scale = SIZE / rect.width
    return { x: (e.clientX - rect.left) * scale, y: (e.clientY - rect.top) * scale }
  }

  const markHit = (x: number, y: number) => {
    const mask = maskRef.current; if (!mask) return
    const cells = SIZE / 4
    const r = 4 // نصف قطر بالخلايا
    const cx0 = Math.floor(x / 4), cy0 = Math.floor(y / 4)
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const cx = cx0 + dx, cy = cy0 + dy
      if (cx < 0 || cy < 0 || cx >= cells || cy >= cells) continue
      const i = cy * cells + cx
      if (mask[i]) hitRef.current.add(i)
    }
  }

  const start = (e: React.PointerEvent) => {
    if (done) return
    drawing.current = true
    const p = pos(e); last.current = p
    const ctx = drawRef.current!.getContext('2d')!
    ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, 9, 0, Math.PI * 2); ctx.fill()
    markHit(p.x, p.y)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const move = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return
    const p = pos(e)
    const ctx = drawRef.current!.getContext('2d')!
    ctx.strokeStyle = color; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke()
    // نقاط وسيطة للتغطية
    const steps = Math.ceil(Math.hypot(p.x - last.current.x, p.y - last.current.y) / 4)
    for (let i = 1; i <= steps; i++) {
      markHit(last.current.x + ((p.x - last.current.x) * i) / steps, last.current.y + ((p.y - last.current.y) * i) / steps)
    }
    last.current = p
  }

  const end = () => {
    if (!drawing.current) return
    drawing.current = false; last.current = null
    setStrokes(s => s + 1)
    const cov = hitRef.current.size / totalRef.current
    setCoverage(cov)
    if (cov >= threshold && !done) { setDone(true); onComplete?.() }
  }

  const clear = () => {
    drawRef.current?.getContext('2d')?.clearRect(0, 0, SIZE, SIZE)
    hitRef.current = new Set(); setCoverage(0); setDone(false); setStrokes(0)
  }

  const pct = Math.min(100, Math.round((coverage / threshold) * 100))

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative rounded-3xl overflow-hidden shadow-lg bg-white no-select" style={{ width: SIZE, height: SIZE, maxWidth: '100%' }}>
        <canvas ref={guideRef} width={SIZE} height={SIZE} className="absolute inset-0 w-full h-full" />
        <canvas
          ref={drawRef} width={SIZE} height={SIZE}
          className="absolute inset-0 w-full h-full touch-none"
          onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onPointerLeave={end}
        />
        {done && (
          <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center bounce-in">
            <span className="text-7xl">🌟</span>
            <p className="font-black text-xl mt-2" style={{ color }}>أحسنت!</p>
          </div>
        )}
      </div>
      <div className="w-full max-w-[280px]">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>التتبع</span><span>{pct}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: color }} />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={clear} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold btn-press">🧽 امسح</button>
        <span className="px-3 py-2 text-xs text-gray-400">{strokes} خط</span>
      </div>
    </div>
  )
}
