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
    <div className="flex h-[100dvh] w-full overflow-hidden bg-ink">
      <aside className="flex w-[264px] shrink-0 flex-col border-r border-white/[0.06] px-6 py-8">
        <div className="flex items-center gap-3 px-2">
          <div className="glass flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-[15px] font-bold text-neon">
            N
          </div>
          <span className="text-[17px] font-medium tracking-tight">Nexum</span>
        </div>

        <nav className="mt-10 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => {
            const on = tab === id
            return (
              <button
                key={id}
                onClick={() => onTab(id)}
                className="relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
              >
                {on && (
                  <motion.span
                    layoutId="deskNav"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-2xl bg-neon/10"
                  />
                )}
                <Icon size={17} className={`relative ${on ? 'text-neon' : 'text-white/40'}`} />
                <span className={`relative text-[14px] ${on ? 'text-white' : 'text-white/50'}`}>
                  {label}
                </span>
              </button>
            )
          })}
        </nav>

        <button
          onClick={onNotifications}
          className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
        >
          <Bell size={17} className="text-white/40" />
          <span className="text-[14px] text-white/50">Notifications</span>
          <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon/70" />
        </button>

        <div className="mt-auto">
          <div className="glass flex items-center gap-3 rounded-2xl p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 font-mono text-[12px] text-neon">
              CP
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">Cankat Polat</div>
              <div className="truncate font-mono text-[10px] text-white/30">0xA4f2 . . . 91c7</div>
            </div>
          </div>
          <button
            onClick={onDisconnect}
            className="mt-2 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[13px] text-rose-300/70"
          >
            <LogOut size={15} /> Disconnect
          </button>
        </div>
      </aside>

      <main className="scanlines noise relative min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
