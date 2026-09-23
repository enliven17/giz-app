import { useEffect, useRef } from 'react'

// ASCII whales drifting under the footer. Text art, drawn on a canvas so the
// school can move without touching layout.
const WHALE = [
  '       .-\'',
  "    '--./ /     _.---.",
  "    '-,  (__..-`       \\",
  '       \\          .     |',
  "        `,.__.   ,__.--/",
  "          '._/_.'___.-'",
]

const SMALL = [
  '   .-\'',
  " '-. \\   _.-.",
  "    \\(__.'   \\",
  "     `._  _.-'",
  "        `'",
]

type Whale = {
  art: string[]
  x: number
  y: number
  speed: number
  scale: number
  alpha: number
  bob: number
}

export default function AsciiWhales({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0
    let H = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const school: Whale[] = [
      { art: WHALE, x: -260, y: 0.24, speed: 0.22, scale: 15, alpha: 0.5, bob: 0 },
      { art: SMALL, x: -900, y: 0.58, speed: 0.34, scale: 11, alpha: 0.32, bob: 1.6 },
      { art: WHALE, x: -1700, y: 0.72, speed: 0.15, scale: 19, alpha: 0.22, bob: 3.1 },
    ]

    let frame = 0
    let raf = 0
    let running = true

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      school.forEach((w) => {
        const fs = w.scale
        ctx.font = `${fs}px ui-monospace, SFMono-Regular, Menlo, monospace`
        const lineH = fs * 1.02
        const artW = Math.max(...w.art.map((l) => l.length)) * fs * 0.6

        w.x += w.speed
        if (w.x > W + artW) w.x = -artW - Math.random() * 600

        const baseY = H * w.y + Math.sin(frame * 0.012 + w.bob) * 7

        w.art.forEach((line, i) => {
          ctx.fillStyle = `rgba(49, 196, 126, ${w.alpha * (0.55 + (i / w.art.length) * 0.6)})`
          ctx.fillText(line, w.x, baseY + i * lineH)
        })
      })

      // the swell they move through
      ctx.font = '13px ui-monospace, SFMono-Regular, Menlo, monospace'
      const cols = Math.ceil(W / (13 * 0.6)) + 2
      for (let row = 0; row < 2; row++) {
        let line = ''
        for (let c = 0; c < cols; c++) {
          const v = Math.sin(c * 0.22 + frame * 0.02 + row * 1.7)
          line += v > 0.35 ? '^' : v < -0.35 ? '~' : '-'
        }
        ctx.fillStyle = `rgba(49, 196, 126, ${row === 0 ? 0.12 : 0.07})`
        ctx.fillText(line, 0, H - 26 + row * 15)
      }

      frame += 1
      if (running) raf = requestAnimationFrame(draw)
    }

    draw()

    const io = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting
        if (running && !raf) raf = requestAnimationFrame(draw)
        if (!running && raf) {
          cancelAnimationFrame(raf)
          raf = 0
        }
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none h-full w-full ${className}`}
    />
  )
}
