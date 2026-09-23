import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import StepVisual, { type VisualKind } from './StepVisual'

type Step = {
  title: string
  chain?: string
  body: string
  visual: VisualKind
}

const STEPS: Step[] = [
  {
    title: 'Your wallet',
    body: 'Connect the wallet you already use. Nothing about it changes and nothing leaves it yet.',
    visual: 'wallet',
  },
  {
    title: 'Funding account',
    chain: 'Monad',
    body: 'Your balance lands on a funding account that only your passkey controls.',
    visual: 'funding',
  },
  {
    title: 'Confidential transfer',
    chain: 'Aurora',
    body: 'Value is routed privately, unlinked from the wallet it came from.',
    visual: 'route',
  },
  {
    title: 'Private investing account',
    chain: 'Ethereum',
    body: 'A separate account holds your positions, derived from the same passkey.',
    visual: 'keys',
  },
  {
    title: 'Your deposit',
    body: 'You choose an amount. Nothing else about you is attached to it.',
    visual: 'deposit',
  },
  {
    title: 'Encryption',
    chain: 'Zama',
    body: 'The amount is encrypted before it touches a vault, and stays encrypted on chain.',
    visual: 'encrypt',
  },
  {
    title: 'Combined with other deposits',
    body: 'Your deposit joins a batch, so no single entry traces back to one account.',
    visual: 'batch',
  },
  {
    title: 'Curated vault',
    chain: 'Morpho',
    body: 'The batch enters a curated strategy with a named curator and a published mandate.',
    visual: 'vault',
  },
  {
    title: 'Your encrypted position',
    body: 'You hold encrypted shares. Only you can read the balance, the yield and the exit.',
    visual: 'shield',
  },
]

// the line the section runs along, drawn once and measured for the node points
const RAIL =
  'M 18 60 C 130 60 130 14 242 14 S 354 106 466 106 S 578 14 690 14 S 802 106 914 106 S 1026 30 1182 30'

function Rail({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const pathRef = useRef<SVGPathElement>(null)
  const [nodes, setNodes] = useState<{ x: number; y: number }[]>([])
  const dashOffset = useTransform(progress, (v) => 1 - v)

  useEffect(() => {
    const path = pathRef.current
    if (!path) return
    const len = path.getTotalLength()
    setNodes(
      STEPS.map((_, i) => {
        const p = path.getPointAtLength((len * i) / (STEPS.length - 1))
        return { x: p.x, y: p.y }
      }),
    )
  }, [])

  return (
    <svg
      viewBox="0 0 1200 120"
      fill="none"
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <path ref={pathRef} d={RAIL} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
      <motion.path
        d={RAIL}
        stroke="#31c47e"
        strokeWidth="1.5"
        pathLength={1}
        strokeDasharray={1}
        style={{ strokeDashoffset: dashOffset }}
      />
      {nodes.map((n, i) => (
        <g key={i}>
          <motion.circle
            cx={n.x}
            cy={n.y}
            fill={i <= index ? '#31c47e' : 'rgba(255,255,255,0.18)'}
            animate={{ r: i === index ? 7 : 4 }}
            transition={{ duration: 0.3 }}
          />
          {i === index && (
            <motion.circle
              cx={n.x}
              cy={n.y}
              fill="none"
              stroke="#31c47e"
              strokeWidth="1.5"
              animate={{ r: [7, 18], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
        </g>
      ))}
    </svg>
  )
}

/** Mounts the visual at rest, then lets it play, so every step animates.
 *  The shared carrier inside each visual morphs into the next one. */
function Frame({ visual, index }: { visual: VisualKind; index: number }) {
  const [on, setOn] = useState(false)

  // one frame at rest is all the reveals need, so nothing visibly resets
  useEffect(() => {
    const id = requestAnimationFrame(() => setOn(true))
    return () => cancelAnimationFrame(id)
  }, [index])

  return <StepVisual kind={visual} on={on} />
}

export default function HowItWorks() {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const [index, setIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setIndex(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))))
  })

  // the room behind the stage drifts, so it never reads as flat black
  const glowX = useTransform(progress, [0, 1], ['-18%', '18%'])
  const step = STEPS[index]

  return (
    <section
      ref={ref}
      id="money"
      className="relative"
      style={{ height: `${STEPS.length * 75 + 60}vh` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* depth behind everything */}
        <div className="pointer-events-none absolute inset-0 bg-[#070a09]" />
        <motion.div
          style={{ x: glowX }}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_45%,rgba(49,196,126,0.1),transparent_70%)]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.05)_1px,transparent_1px)] opacity-40 [background-size:26px_26px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,transparent,#050706)]" />

        <div className="shell relative pt-24 md:pt-28">
          <p className="eyebrow">How it works</p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(26px,3.4vw,42px)] font-semibold leading-[1.05] tracking-[-0.025em]">
            From your wallet to an encrypted position
          </h2>
        </div>

        <div className="shell relative flex flex-1 items-center py-6">
          <div className="grid w-full items-center gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-14">
            <div key={`text-${index}`} className="order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 font-mono text-[12px] text-white/30">
                  <span className="text-neon">{String(index + 1).padStart(2, '0')}</span>
                  <span className="h-px w-8 bg-white/15" />
                  <span>{String(STEPS.length).padStart(2, '0')}</span>
                  {step.chain && (
                    <span className="rounded-full border border-neon/25 px-2.5 py-1 text-[11px] text-neon">
                      {step.chain}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 text-[clamp(24px,2.6vw,34px)] font-semibold leading-[1.1] tracking-[-0.02em]">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[42ch] text-[15px] leading-relaxed text-white/45 md:text-[16px]">
                  {step.body}
                </p>
              </motion.div>
            </div>

            <div className="order-1 md:order-2">
              <Frame key={index} visual={step.visual} index={index} />
            </div>
          </div>
        </div>

        <div className="relative px-4 pb-8 md:px-10 md:pb-10">
          <Rail progress={progress} index={index} />
        </div>
      </div>
    </section>
  )
}
