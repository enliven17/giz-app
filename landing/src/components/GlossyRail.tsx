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

/** Hourglass outline: the further a card sits from the middle, the more its
 *  vertical edges pinch inward, so the strip reads as one curved surface. */
function pinch(w: number, h: number, amount: number) {
  const k = w * 0.34 * amount
  const c = h * 0.3
  return (
    `M0,0 C${k},${c} ${k},${h - c} 0,${h} ` +
    `L${w},${h} C${w - k},${h - c} ${w - k},${c} ${w},0 Z`
  )
}

/**
 * Horizontal rail of glossy cards. The middle card is flat and readable, the
 * ones beside it tilt, pinch and let their gradient bloom out of focus.
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
        const card = node as HTMLElement
        const r = card.getBoundingClientRect()
        const d = Math.max(-1.5, Math.min(1.5, (r.left + r.width / 2 - center) / reach))
        const abs = Math.min(1, Math.abs(d))
        const ease = abs * abs

        card.style.transform = `perspective(1700px) rotateY(${d * -20}deg) translateZ(${-ease * 130}px) scale(${1 - ease * 0.06})`
        card.style.zIndex = String(100 - Math.round(abs * 100))
        card.style.clipPath = `path('${pinch(r.width, r.height, ease)}')`

        const skin = card.querySelector<HTMLElement>('[data-skin]')
        const body = card.querySelector<HTMLElement>('[data-body]')
        if (skin) {
          // the gradient blooms and smears as the card turns away
          skin.style.filter = `blur(${ease * 26}px) saturate(${1 + ease * 0.9})`
          skin.style.transform = `scale(${1 + ease * 0.5})`
          skin.style.opacity = String(1 - ease * 0.15)
        }
        if (body) {
          body.style.opacity = String(Math.max(0, 1 - abs * 1.5))
          body.style.filter = `blur(${ease * 5}px)`
        }
      })
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }

    update()
    rail.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      cancelAnimationFrame(raf)
      rail.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [items.length])

  return (
    <div
      ref={railRef}
      className="no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto px-[max(24px,calc(50vw-230px))] py-12 [perspective:1700px]"
    >
      {items.map((item) => {
        const Icon = item.icon
        return (
          <article
            key={item.title}
            className="relative aspect-[3/4] w-[min(74vw,460px)] shrink-0 snap-center overflow-hidden rounded-[30px] bg-[#080c0a] will-change-transform"
          >
            <div
              data-skin
              className="absolute inset-0 will-change-[filter,transform]"
              style={{
                background: `radial-gradient(120% 100% at 22% 12%, ${item.from} 0%, transparent 62%), radial-gradient(120% 110% at 82% 88%, ${item.to} 0%, transparent 66%), radial-gradient(90% 70% at 50% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)`,
              }}
            />

            {/* gloss: sheen across the top, bright top edge, soft inner border */}
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(158deg,rgba(255,255,255,0.18),rgba(255,255,255,0.03)_36%,transparent_58%)]" />
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            <div className="pointer-events-none absolute inset-0 rounded-[30px] ring-1 ring-inset ring-white/10" />

            <div data-body className="relative flex h-full flex-col p-8">
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
            </div>
          </article>
        )
      })}
    </div>
  )
}
