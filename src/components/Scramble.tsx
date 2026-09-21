import { useEffect, useRef, useState } from 'react'

const CHARS = '01<>/\[]{}#$%&*ABCDEFXZ'

export default function Scramble({
  text,
  className = '',
  speed = 28,
  delay = 0,
}: {
  text: string
  className?: string
  speed?: number
  delay?: number
}) {
  const [out, setOut] = useState('')
  const frame = useRef(0)

  useEffect(() => {
    let raf = 0
    let tick = 0
    frame.current = 0
    const start = performance.now() + delay

    const run = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(run)
        return
      }
      tick += 1
      if (tick % 2 === 0) frame.current += 1
      const progress = frame.current / 2
      const next = text
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' '
          if (i < progress) return ch
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')
      setOut(next)
      if (progress < text.length) raf = requestAnimationFrame(run)
      else setOut(text)
    }
    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [text, speed, delay])

  return <span className={className}>{out || text.replace(/\S/g, '0')}</span>
}
