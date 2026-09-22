import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { LayoutGrid, PieChart, ArrowLeftRight, Settings as Cog, Bell, LogOut } from 'lucide-react'

const NAV = [
  { id: 'home', label: 'Overview', icon: LayoutGrid },
  { id: 'vaults', label: 'Vaults', icon: PieChart },
  { id: 'swap', label: 'Exchange', icon: ArrowLeftRight },
  { id: 'settings', label: 'Settings', icon: Cog },
] as const

export default function DesktopShell({
  tab,
  onTab,
  onNotifications,
  onDisconnect,
  children,
}: {
  tab: string
  onTab: (id: string) => void
  onNotifications: () => void
  onDisconnect: () => void
  children: ReactNode
}) {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-ink">
      <div className="scanlines noise relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 shrink-0 border-b border-white/[0.05] bg-ink/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1520px] items-center gap-4 px-14 py-4">
            <div className="flex items-center gap-3">
              <span className="text-[18px] font-medium tracking-tight">Gizu</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                onClick={onNotifications}
                className="glass-soft relative flex h-11 w-11 items-center justify-center rounded-2xl text-white/55"
              >
                <Bell size={17} />
                <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-neon/70" />
              </button>

              <div className="glass flex items-center gap-3 rounded-2xl py-2 pl-2 pr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neon/10 font-mono text-[11px] text-neon">
                  CP
                </div>
                <div className="leading-tight">
                  <div className="text-[13px] font-medium">Cankat Polat</div>
                  <div className="font-mono text-[10px] text-white/30">0xA4f2 . . . 91c7</div>
                </div>
              </div>

              <button
                onClick={onDisconnect}
                className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-rose-300/60"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </div>

      <div className="z-40 flex shrink-0 justify-center pb-7 pt-4">
        <motion.nav
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="glass flex items-center gap-1 rounded-full p-2"
        >
          {NAV.map(({ id, label, icon: Icon }) => {
            const on = tab === id
            return (
              <button
                key={id}
                onClick={() => onTab(id)}
                className="relative flex h-12 items-center gap-2.5 rounded-full px-6"
              >
                {on && (
                  <motion.span
                    layoutId="deskNavPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full neon-btn"
                  />
                )}
                <Icon
                  size={17}
                  strokeWidth={on ? 2.3 : 1.8}
                  className={`relative ${on ? 'text-ink' : 'text-white/45'}`}
                />
                <span className={`relative text-[13px] ${on ? 'text-ink font-medium' : 'text-white/45'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </motion.nav>
      </div>
    </div>
  )
}
