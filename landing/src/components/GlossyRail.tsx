import { Fragment, useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export type RailItem = {
  step: string
  title: string
  chain?: string
  body: string
  icon: LucideIcon
  /** two stops that paint the card's gloss */
  from: string
  to: string
}

const INTERVAL = 4200

/** Hourglass outline in bounding box units: the further from the middle, the
 *  more both vertical edges pinch inward. */
function pinch(amount: number) {
  const k = 0.13 * amount
  return `M0,0 C${k},0.3 ${k},0.7 0,1 L1,1 C${1 - k},0.7 ${1 - k},0.3 1,0 Z`
}

export default function GlossyRail({ items }: { items: RailItem[] }) {
  const n = items.length
  const uid = useId().replace(/:/g, '')
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), INTERVAL)
    return () => window.clearInterval(t)
  }, [paused, n])

  const offsetOf = (i: number) => ((i - active + n + n / 2) % n) - n / 2

  return (
    <div
      className="relative h-[560px] select-none md:h-[640px]"
      style={{ perspective: 1800 }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* one clip per card, in bounding box units so it scales with the card */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          {items.map((item, i) => (
            <clipPath key={item.title} id={`${uid}-${i}`} clipPathUnits="objectBoundingBox">
              <motion.path
                animate={{ d: pinch(Math.min(1, Math.abs(offsetOf(i)))) }}
                transition={{ type: 'spring', stiffness: 120, damping: 24 }}
                d={pinch(Math.min(1, Math.abs(offsetOf(i))))}
              />
            </clipPath>
          ))}
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
        {items.map((item, i) => {
          const offset = offsetOf(i)
          const abs = Math.abs(offset)
          const hidden = abs > 1.05
          const Icon = item.icon

          return (
            <Fragment key={item.title}>
            <motion.div
              initial={false}
              animate={{
                x: `${offset * 96}%`,
                opacity: hidden ? 0 : 0.55 - abs * 0.3,
                scale: 1 - abs * 0.1,
              }}
              transition={{ type: 'spring', stiffness: 110, damping: 23, mass: 0.7 }}
              aria-hidden
              style={{
                zIndex: 1,
                background: `radial-gradient(60% 50% at 30% 25%, ${item.from} 0%, transparent 70%), radial-gradient(60% 55% at 72% 78%, ${item.to} 0%, transparent 72%)`,
              }}
              className="absolute aspect-[3/4] w-[min(72vw,400px)] rounded-[30px] blur-[70px]"
            />

            <motion.article
              onClick={() => setActive(i)}
              initial={false}
              animate={{
                x: `${offset * 96}%`,
                rotateY: offset * -30,
                z: -abs * 260,
                scale: 1 - abs * 0.06,
                opacity: hidden ? 0 : 1 - abs * 0.2,
              }}
              transition={{ type: 'spring', stiffness: 110, damping: 23, mass: 0.7 }}
              style={{
                zIndex: 100 - Math.round(abs * 10),
                clipPath: `url(#${uid}-${i})`,
                pointerEvents: hidden ? 'none' : 'auto',
              }}
              className="absolute aspect-[3/4] w-[min(72vw,400px)] cursor-pointer overflow-hidden rounded-[30px] bg-[#080c0a] will-change-transform"
            >
              <motion.div
                className="absolute inset-0"
                initial={false}
                animate={{
                  scale: 1 + abs * 0.4,
                  filter: `blur(${abs * 18}px) saturate(${1 + abs * 0.8})`,
                }}
                transition={{ type: 'spring', stiffness: 110, damping: 23 }}
                style={{
                  background: `radial-gradient(120% 100% at 22% 12%, ${item.from} 0%, transparent 62%), radial-gradient(120% 110% at 82% 88%, ${item.to} 0%, transparent 66%), radial-gradient(90% 70% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)`,
                }}
              />

              {/* gloss */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(158deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_36%,transparent_58%)]" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
              <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/10" />

              <motion.div
                initial={false}
                animate={{ opacity: abs >= 0.9 ? 0 : 1 - abs * 0.8 }}
                transition={{ duration: 0.4 }}
                className="relative flex h-full flex-col p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/55">
                    {item.step}
                  </span>
                  {item.chain && (
                    <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[12px] font-medium backdrop-blur-md">
                      {item.chain}
                    </span>
                  )}
                </div>

                <div className="mt-auto">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-6 text-[26px] font-semibold leading-tight tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-white/65">
                    {item.body}
                  </p>
                </div>
              </motion.div>
            </motion.article>
            </Fragment>
          )
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2.5">
        {items.map((item, i) => (
          <button
            key={item.title}
            onClick={() => setActive(i)}
            aria-label={`Show ${item.title}`}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === active ? 'w-8 bg-neon' : 'w-1.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
