import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import Reveal from './Reveal'

const ROWS = [
  { label: 'Balance', value: '$184,204.00' },
  { label: 'Position', value: '13,630.10 units' },
  { label: 'Returns', value: '+ $30,412.09' },
]

const GLYPHS = '0123456789ABCDEF#*+=%'

/** Scrambles a value into an encrypted looking string once it scrolls in. */
function Encrypt({ value, delay }: { value: string; delay: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [out, setOut] = useState(value)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!inView) return
    let raf = 0
    let tick = 0
    const start = performance.now() + delay

    const run = (now: number) => {
      if (now < start) {
        raf = requestAnimationFrame(run)
        return
      }
      tick += 1
      const progress = tick / 3
      const next = value
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' '
          if (i < value.length - progress) return ch
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        })
        .join('')
      setOut(next)
      if (progress < value.length) raf = requestAnimationFrame(run)
      else setDone(true)
    }

    raf = requestAnimationFrame(run)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, delay])

  return (
    <span
      ref={ref}
      className={`tabular-nums transition-colors duration-500 ${done ? 'text-neon' : 'text-white'}`}
    >
      {out}
    </span>
  )
}

export default function Portfolio() {
  return (
    <section id="portfolio" className="shell scroll-mt-28 py-24 md:py-32">
      <Reveal>
        <p className="eyebrow">Step three</p>
        <h2 className="mt-5 max-w-[14ch] text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.025em]">
          Your portfolio, encrypted
        </h2>
        <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-white/45">
          Only you can read your numbers. Everyone else sees ciphertext.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-stretch">
        <Reveal>
          <div className="card h-full divide-y divide-white/[0.06] p-2">
            {ROWS.map((r, i) => (
              <div key={r.label} className="flex items-center justify-between px-6 py-7">
                <span className="text-[15px] text-white/45">{r.label}</span>
                <motion.span
                  className="font-medium"
                  style={{ fontSize: 18 }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Encrypt value={r.value} delay={i * 220} />
                </motion.span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card relative aspect-[4/3] h-full overflow-hidden lg:aspect-auto">
            <div className="flex h-full w-full items-center justify-center">
              {/* portfolio screen clip goes here */}
              <span className="eyebrow">Your portfolio inside the app</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
