import { useEffect, useRef } from 'react'
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

/**
 * Horizontal rail of glossy cards. The card in the middle sits flat and the
 * ones beside it tilt away toward the edges, so the strip reads as one curved
 * surface rather than a list.
 */
export default function GlossyRail({ items }: { items: RailItem[] }) {
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    let raf = 0

    const update = () => {
      raf = 0
      const rect = rail.getBoundingClientRect()
      const center = rect.left + rect.width / 2
      const reach = rect.width / 2

      Array.from(rail.children).forEach((node) => {
        const el = node as HTMLElement
        const r = el.getBoundingClientRect()
        const d = Math.max(-1.6, Math.min(1.6, (r.left + r.width / 2 - center) / reach))
        const abs = Math.min(1, Math.abs(d))
        el.style.transform = `perspective(1600px) rotateY(${d * -24}deg) translateZ(${-abs * 140}px) scale(${1 - abs * 0.1})`
        el.style.opacity = String(1 - abs * 0.42)
        el.style.zIndex = String(100 - Math.round(abs * 100))
      })
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    rail.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // start centred on the first card
    rail.scrollLeft = 0

    return () => {
      cancelAnimationFrame(raf)
      rail.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items.length])

  return (
    <div
      ref={railRef}
      className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-[max(24px,calc(50vw-220px))] py-10 [perspective:1600px]"
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <article
            key={item.title}
            className="group relative aspect-[3/4] w-[min(72vw,440px)] shrink-0 snap-center overflow-hidden rounded-[28px] border border-white/10 transition-[transform,opacity] duration-200 ease-out will-change-transform"
            style={{
              background: `radial-gradient(130% 110% at 18% 8%, ${item.from} 0%, transparent 58%), radial-gradient(120% 120% at 88% 92%, ${item.to} 0%, transparent 62%), #0a0f0d`,
            }}
          >
            {/* gloss: a soft sheen across the top and a bright top edge */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.16),rgba(255,255,255,0.02)_38%,transparent_60%)]" />
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

            <div className="relative flex h-full flex-col p-8">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-white/50">
                  {item.step}
                </span>
                {item.chain && (
                  <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[12px] font-medium backdrop-blur-md">
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
                <p className="mt-3 max-w-[30ch] text-[14px] leading-relaxed text-white/60">
                  {item.body}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
