import { Fragment, useEffect, useId, useState } from 'react'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export type RailItem = {
  step: string
  title: string
  chain?: string
  body: string
  icon: LucideIcon
  /** mesh stops that paint the card */
  from: string
  via: string
  to: string
}

const INTERVAL = 4200

/** Hourglass outline in bounding box units. Side cards pinch hard through the
 *  middle and flare at top and bottom, the centre card stays a rectangle. */
function pinch(amount: number) {
  const k = 0.3 * amount
  return `M0,0 C${k},0.28 ${k},0.72 0,1 L1,1 C${1 - k},0.72 ${1 - k},0.28 1,0 Z`
}

function mesh(item: RailItem) {
  return (
    `radial-gradient(75% 60% at 18% 10%, ${item.from} 0%, transparent 62%),` +
    `radial-gradient(70% 65% at 82% 22%, ${item.via} 0%, transparent 64%),` +
    `radial-gradient(90% 80% at 62% 92%, ${item.to} 0%, transparent 70%),` +
    `radial-gradient(60% 45% at 45% 55%, rgba(255,255,255,0.2) 0%, transparent 70%),` +
    `linear-gradient(150deg, ${item.from}, ${item.to})`
  )
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
      className="relative h-[620px] select-none overflow-hidden md:h-[720px]"
      style={{ perspective: 2000 }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          {items.map((item, i) => (
            <clipPath key={item.title} id={`${uid}-${i}`} clipPathUnits="objectBoundingBox">
              <motion.path
                animate={{ d: pinch(Math.min(1, Math.abs(offsetOf(i)))) }}
                transition={{ type: 'spring', stiffness: 110, damping: 22 }}
                d={pinch(Math.min(1, Math.abs(offsetOf(i))))}
              />
            </clipPath>
          ))}
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center [transform-style:preserve-3d]">
        {items.map((item, i) => {
          const offset = offsetOf(i)
          const abs = Math.min(1, Math.abs(offset))
          const hidden = Math.abs(offset) > 1.05
          const side = abs > 0.5
          const Icon = item.icon

          return (
            <Fragment key={item.title}>
              {/* the glow the card sits in */}
              <motion.div
                aria-hidden
                initial={false}
                animate={{
                  x: `${offset * 132}%`,
                  opacity: hidden ? 0 : side ? 0.5 : 0.7,
                  scaleY: 1 + abs * 0.35,
                }}
                transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.7 }}
                style={{ background: mesh(item), zIndex: 1 }}
                className="absolute aspect-[3/4] w-[min(76vw,420px)] rounded-[36px] blur-[90px]"
              />

              <motion.article
                onClick={() => setActive(i)}
                initial={false}
                animate={{
                  // side cards ride out to the edges and grow past the frame
                  x: `${offset * 132}%`,
                  rotateY: offset * -34,
                  z: -abs * 200,
                  scaleY: 1 + abs * 0.32,
                  scaleX: 1 - abs * 0.04,
                  opacity: hidden ? 0 : 1,
                }}
                transition={{ type: 'spring', stiffness: 110, damping: 22, mass: 0.7 }}
                style={{
                  zIndex: side ? 10 : 20,
                  clipPath: `url(#${uid}-${i})`,
                  pointerEvents: hidden ? 'none' : 'auto',
                }}
                className="absolute aspect-[3/4] w-[min(76vw,420px)] cursor-pointer overflow-hidden rounded-[36px] will-change-transform"
              >
                <motion.div
                  className="absolute inset-0"
                  initial={false}
                  animate={{
                    scale: 1 + abs * 0.25,
                    filter: `blur(${abs * 14}px) saturate(${1 + abs * 0.5})`,
                  }}
                  transition={{ type: 'spring', stiffness: 110, damping: 22 }}
                  style={{ background: mesh(item) }}
                />

                {/* gloss: sheen band and a lit top edge */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(158deg,rgba(255,255,255,0.28),rgba(255,255,255,0.05)_34%,transparent_56%)]" />
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                <div className="pointer-events-none absolute inset-0 rounded-[36px] ring-1 ring-inset ring-white/15" />

                {/* side cards read as the back of a flipped card, so their
                    content mirrors and softens */}
                <motion.div
                  initial={false}
                  animate={{ opacity: side ? 0.35 : 1, scaleX: side ? -1 : 1 }}
                  transition={{ type: 'spring', stiffness: 110, damping: 22 }}
                  className="relative flex h-full flex-col p-9"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/70">
                      {item.step}
                    </span>
                    {item.chain && (
                      <span className="rounded-full border border-white/25 bg-black/20 px-3 py-1.5 text-[12px] font-medium backdrop-blur-md">
                        {item.chain}
                      </span>
                    )}
                  </div>

                  <div className="mt-auto">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/25 bg-white/15 backdrop-blur-md">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <h3 className="mt-6 text-[28px] font-semibold leading-tight tracking-[-0.02em] text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 max-w-[30ch] text-[14.5px] leading-relaxed text-white/75">
                      {item.body}
                    </p>
                  </div>
                </motion.div>
              </motion.article>
            </Fragment>
          )
        })}
      </div>

      <div className="absolute inset-x-0 bottom-4 z-30 flex items-center justify-center gap-2.5">
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
