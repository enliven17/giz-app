import { useRef, useState } from 'react'
import { motion, useInView, useScroll, useSpring } from 'framer-motion'
import StepVisual, { type VisualKind } from './StepVisual'

export type TimelineStep = {
  title: string
  chain?: string
  body: string
  visual: VisualKind
}

/**
 * One row of the timeline. The grid is symmetric, so both sides sit the same
 * distance from the spine and every node meets the line at the card's centre.
 */
function Row({ step, index }: { step: TimelineStep; index: number }) {
  const ref = useRef<HTMLLIElement>(null)
  const inView = useInView(ref, { margin: '-40% 0px -40% 0px' })
  const [hover, setHover] = useState(false)
  const left = index % 2 === 0
  const on = inView || hover

  const card = (
    <motion.article
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border p-5 transition-colors duration-500 md:p-6 ${
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
      <p className="mt-2.5 text-[14.5px] leading-relaxed text-white/45">{step.body}</p>
    </motion.article>
  )

  return (
    <li
      ref={ref}
      className="relative grid items-center gap-y-0 pl-16 md:grid-cols-[1fr_2px_1fr] md:gap-x-0 md:pl-0"
    >
      {/* left column */}
      <div className="md:pr-14">{left ? card : null}</div>

      {/* the node, always centred on the row */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 md:static md:flex md:h-full md:items-center md:justify-center">
        <span className="relative block">
          <span
            className={`block h-3 w-3 -translate-x-1/2 rounded-full transition-all duration-500 md:translate-x-0 ${
              on ? 'scale-[1.7] bg-neon shadow-[0_0_0_7px_rgba(49,196,126,0.1)]' : 'bg-white/20'
            }`}
          />
          {/* connector from the node to the card, same length on both sides */}
          <span
            className={`absolute top-1/2 hidden h-px w-14 -translate-y-1/2 transition-colors duration-500 md:block ${
              left ? 'right-full' : 'left-full'
            } ${on ? 'bg-neon/30' : 'bg-white/10'}`}
          />
        </span>
      </div>

      {/* right column */}
      <div className="md:pl-14">{left ? null : card}</div>
    </li>
  )
}

export default function Timeline({ steps }: { steps: TimelineStep[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 65%', 'end 55%'],
  })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  return (
    <div ref={ref} className="relative">
      {/* the spine, filling as the page scrolls */}
      <div className="pointer-events-none absolute left-6 top-0 h-full w-px bg-white/[0.08] md:left-1/2 md:-translate-x-1/2" />
      <motion.div
        style={{ scaleY: progress }}
        className="pointer-events-none absolute left-6 top-0 h-full w-px origin-top bg-gradient-to-b from-neon/70 via-neon to-neon/70 md:left-1/2 md:-translate-x-1/2"
      />

      <ol className="relative space-y-12 md:space-y-20">
        {steps.map((step, i) => (
          <Row key={step.title} step={step} index={i} />
        ))}
      </ol>
    </div>
  )
}
