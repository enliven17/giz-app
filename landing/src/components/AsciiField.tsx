import { useEffect, useRef } from 'react'

// ASCII wave field, ported from mimir/HeroAscii and tuned for Gizu.
// Drawing is batched: colours are quantised into a small palette and runs of
// neighbouring cells sharing a level are written with one fillText, which keeps
// a full screen field cheap enough to stay smooth.
const BASE: [number, number, number] = [176, 206, 192]
const PEAK: [number, number, number] = [49, 196, 126]
const LEVELS = 7
const CHARS = ' .:-=+*#%@'

type Props = {
  className?: string
  /** smaller means a denser grid */
  fontSize?: number
  speed?: number
  opacity?: number
  /** how far the pointer ripple reaches, 0 disables it */
  pointer?: number
}

export default function AsciiField({
  className = '',
  fontSize = 13,
  speed = 0.55,
  opacity = 1,
  pointer = 0.4,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const cellW = fontSize * 0.6

    // one colour per level, so fillStyle changes at most LEVELS times per row
    const palette = Array.from({ length: LEVELS }, (_, i) => {
      const t = i / (LEVELS - 1)
      const mix = Math.max(0, t - 0.45) * 1.9
      const r = Math.round(BASE[0] * (1 - mix) + PEAK[0] * mix)
      const g = Math.round(BASE[1] * (1 - mix) + PEAK[1] * mix)
      const b = Math.round(BASE[2] * (1 - mix) + PEAK[2] * mix)
      const a = (0.08 + t * 0.55) * opacity
      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`
    })

    let W = 0
    let H = 0
    let cols = 0
    let rows = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      W = rect.width
      H = rect.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
      ctx.textBaseline = 'top'
      cols = Math.ceil(W / cellW)
      rows = Math.ceil(H / fontSize)
    }

    resize()

    let resizeTimer = 0
    const onResize = () => {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 120)
    }
    window.addEventListener('resize', onResize)

    const target = { x: 0.5, y: 0.5, on: 0 }
    const cur = { x: 0.5, y: 0.5, on: 0 }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      target.x = (e.clientX - rect.left) / rect.width
      target.y = (e.clientY - rect.top) / rect.height
      target.on = 1
    }
    const onLeave = () => {
      target.on = 0
    }

    if (pointer > 0) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('pointerleave', onLeave)
    }

    let frame = 0
    let raf = 0
    let running = true
    let last = 0
    const step = 1000 / 30
    const reach2 = pointer * pointer

    const draw = (now: number) => {
      if (running) raf = requestAnimationFrame(draw)
      if (now - last < step) return
      last = now

      cur.x += (target.x - cur.x) * 0.1
      cur.y += (target.y - cur.y) * 0.1
      cur.on += (target.on - cur.on) * 0.07

      ctx.clearRect(0, 0, W, H)
      const aspect = cols / Math.max(rows, 1)
      const t = frame * 0.03
      const nT1 = frame * 0.012
      const nT2 = frame * 0.02
      const live = cur.on > 0.02

      for (let y = 0; y < rows; y++) {
        const cy = y / rows - 0.5
        const py = y / rows - cur.y
        const rowY = y * fontSize
        let run = ''
        let runLevel = -1
        let runStart = 0

        for (let x = 0; x < cols; x++) {
          const cx = x / cols - 0.5
          const dist = Math.sqrt(cx * cx + cy * cy)
          const wave = Math.sin(dist * 14 - t) * 0.5 + 0.5
          const noise = Math.sin(x * 0.28 + nT1) * Math.cos(y * 0.32 + nT2)

          let ripple = 0
          if (live) {
            const dx = (x / cols - cur.x) * aspect
            const d2 = dx * dx + py * py
            if (d2 < reach2) {
              const pd = Math.sqrt(d2)
              const falloff = 1 - pd / pointer
              ripple = Math.sin(pd * 26 - frame * 0.1) * falloff * falloff * cur.on
            }
          }

          const val = wave * 0.62 + noise * 0.24 + ripple * 0.7
          const clamped = val < 0 ? 0 : val > 1 ? 1 : val
          const ch = CHARS[Math.floor(clamped * (CHARS.length - 1))]
          const level = ch === ' ' ? -1 : Math.round(clamped * (LEVELS - 1))

          if (level !== runLevel) {
            if (run && runLevel > 0) {
              ctx.fillStyle = palette[runLevel]
              ctx.fillText(run, runStart * cellW, rowY)
            }
            run = ''
            runStart = x
            runLevel = level
          }
          if (level >= 0) run += ch
        }

        if (run && runLevel > 0) {
          ctx.fillStyle = palette[runLevel]
          ctx.fillText(run, runStart * cellW, rowY)
        }
      }

      frame += speed
    }

    raf = requestAnimationFrame(draw)

    // decoration only, so it stops while off screen
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
      window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
    }
  }, [fontSize, speed, opacity, pointer])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none h-full w-full ${className}`}
    />
  )
}
