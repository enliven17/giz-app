import { useEffect, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import Reveal from './Reveal'

export type TimelineStep = {
  title: string
  chain?: string
  body: string
  icon: LucideIcon
}

const STEP_MS = 1600

/**
 * Vertical timeline with a light travelling down the spine. The node the light
 * is passing lifts toward the viewer, so the eye follows the same order the
 * money does.
 */
export default function Timeline({ steps }: { steps: TimelineStep[] }) {
  const [live, setLive] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setLive((v) => (v + 1) % steps.length), STEP_MS)
    return () => window.clearInterval(t)
  }, [steps.length])

  const rows = steps.length
  const spine = `M 12 0 V ${rows * 100}`

  return (
    <div className="relative grid grid-cols-[56px_1fr] gap-x-6 md:grid-cols-[72px_1fr] md:gap-x-10">
      {/* the spine and the light that runs down it */}
      <div className="relative">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox={`0 0 24 ${rows * 100}`}
          preserveAspectRatio="none"
          fill="none"
          aria-hidden
        >
          <path d={spine} stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
          <g mask="url(#spine-mask)">
            <circle className="spine-light" cx="0" cy="0" r="36" fill="url(#spine-grad)" />
          </g>
          <defs>
            <mask id="spine-mask">
              <path d={spine} stroke="white" strokeWidth="3" />
            </mask>
            <radialGradient id="spine-grad">
              <stop offset="0%" stopColor="#31c47e" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        <style>{`
          .spine-light {
            offset-path: path("${spine}");
            offset-anchor: 0 0;
            animation: spine-run ${rows * STEP_MS}ms cubic-bezier(0.7, 0.2, 0.3, 0.9) infinite;
          }
          @keyframes spine-run {
            0% { offset-distance: 0%; }
            92% { offset-distance: 100%; }
            100% { offset-distance: 100%; }
          }
          @media (prefers-reduced-motion: reduce) {
            .spine-light { animation: none; opacity: 0.4; }
          }
        `}</style>
      </div>

      <ol className="space-y-4">
        {steps.map((step, i) => {
          const Icon = step.icon
          const on = i === live
          return (
            <Reveal key={step.title} delay={i * 0.06}>
              <li
                className={`relative flex items-start gap-5 rounded-2xl border p-6 transition-all duration-700 ease-out md:p-7 ${
                  on
                    ? 'border-neon/30 bg-[#0c1712] -translate-y-1 shadow-[0_24px_60px_-40px_rgba(49,196,126,0.8)]'
                    : 'border-white/[0.07] bg-ink-card'
                }`}
              >
                {/* node that meets the spine */}
                <span
                  className={`absolute -left-[38px] top-9 h-2.5 w-2.5 rounded-full transition-all duration-500 md:-left-[54px] ${
                    on ? 'scale-150 bg-neon' : 'bg-white/20'
                  }`}
                />

                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-500 ${
                    on ? 'border-neon/30 bg-neon/10 text-neon' : 'border-white/10 bg-white/[0.03] text-white/60'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-[19px] font-semibold tracking-tight">{step.title}</h3>
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
                  <p className="mt-2 max-w-[52ch] text-[14.5px] leading-relaxed text-white/45">
                    {step.body}
                  </p>
                </div>
              </li>
            </Reveal>
          )
        })}
      </ol>
    </div>
  )
}
