import type { ReactNode } from 'react'

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-ink noise">

      <div className="pointer-events-none absolute left-10 top-1/2 hidden -translate-y-1/2 -rotate-90 font-mono text-[11px] uppercase tracking-[0.5em] text-neon/15 lg:block">
        Nexum Private Access
      </div>
      <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 rotate-90 font-mono text-[11px] uppercase tracking-[0.5em] text-neon/15 lg:block">
        v0.1.0 Terminal
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-[440px] flex-col lg:h-[calc(100dvh-3rem)] lg:my-6 lg:rounded-[40px] lg:border lg:border-white/10 lg:shadow-glass">
        <div className="scanlines relative flex min-h-0 flex-1 flex-col overflow-hidden lg:rounded-[40px]">
          {children}
        </div>
      </div>
    </div>
  )
}
