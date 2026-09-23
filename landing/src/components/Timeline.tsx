import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import StepVisual, { type VisualKind } from './StepVisual'

export type TimelineStep = {
  title: string
  chain?: string
  body: string
  visual: VisualKind
}

/** One card, alternating sides, lit while it is the step in view. */
function Row({ step, index }: { step: TimelineStep; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' })
  const [hover, setHover] = useState(false)
  const left = index % 2 === 0
  const on = inView || hover

  return (
    <li
      ref={ref}
      className={`relative flex flex-col md:flex-row md:items-center ${left ? '' : 'md:flex-row-reverse'}`}
    >
      {/* node on the spine */}
      <span
        className={`absolute left-[26px] top-10 z-10 h-3 w-3 -translate-x-1/2 rounded-full transition-all duration-500 md:left-1/2 ${
          on ? 'scale-[1.6] bg-neon shadow-[0_0_0_6px_rgba(49,196,126,0.12)]' : 'bg-white/20'
        }`}
      />

      {/* connector from the spine to the card */}
      <span
        className={`absolute left-[26px] top-10 hidden h-px transition-colors duration-500 md:block md:left-1/2 md:w-[calc(50%-320px)] ${
          left ? 'md:-translate-x-full' : ''
        } ${on ? 'bg-neon/30' : 'bg-white/10'}`}
      />

      <div className="w-full pl-14 md:w-1/2 md:pl-0 md:pr-16 md:[&:nth-child(n)]:pr-16">
        <motion.article
          onPointerEnter={() => setHover(true)}
          onPointerLeave={() => setHover(false)}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`rounded-2xl border p-5 transition-all duration-500 md:p-6 ${
            on
              ? 'border-neon/25 bg-[#0c1712] shadow-[0_30px_80px_-50px_rgba(49,196,126,0.8)]'
              : 'border-white/[0.07] bg-ink-card'
          }`}
        >
          <StepVisual kind={step.visual} on={on} />

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h3 className="text-[21px] font-semibold tracking-tight">{step.title}</h3>
            {step.chain && (
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors duration-500 ${
                  on ? 'border-neon/30 text-neon' : 'border-white/10 text-white/45'
                }`}
              >
                {step.chain}
              </span>
            )}
          </div>
          <p className="mt-2.5 max-w-[46ch] text-[14.5px] leading-relaxed text-white/45">
            {step.body}
          </p>
        </motion.article>
      </div>

      <div className="hidden md:block md:w-1/2" />
    </li>
  )
}

export default function Timeline({ steps }: { steps: TimelineStep[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.offsetHeight))
    ro.observe(el)
    setHeight(el.offsetHeight)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* the spine and the light that travels down it */}
      <div className="pointer-events-none absolute left-[26px] top-0 h-full w-px bg-white/[0.08] md:left-1/2" />
      {height > 0 && (
        <svg
          className="pointer-events-none absolute left-[26px] top-0 h-full w-px overflow-visible md:left-1/2"
          viewBox={`0 0 2 ${height}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <g mask="url(#spine-mask)">
            <circle className="spine-light" cx="0" cy="0" r="90" fill="url(#spine-grad)" />
          </g>
          <defs>
            <mask id="spine-mask">
              <path d={`M1 0 V ${height}`} stroke="white" strokeWidth="4" />
            </mask>
            <radialGradient id="spine-grad">
              <stop offset="0%" stopColor="#31c47e" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <style>{`
            .spine-light {
              offset-path: path("M1 0 V ${height}");
              animation: spine-run 9s linear infinite;
            }
            @keyframes spine-run {
              0% { offset-distance: 0%; }
              100% { offset-distance: 100%; }
            }
            @media (prefers-reduced-motion: reduce) {
              .spine-light { animation: none; opacity: 0; }
            }
          `}</style>
        </svg>
      )}

      <ol className="relative space-y-10 md:space-y-16">
        {steps.map((step, i) => (
          <Row key={step.title} step={step} index={i} />
        ))}
      </ol>
    </div>
  )
}
