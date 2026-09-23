import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, PieChart, ArrowLeftRight, Settings as Cog, Bell, LogOut } from 'lucide-react'
import { notifications } from '../content'

const NAV = [
  { id: 'home', label: 'Overview', icon: LayoutGrid },
  { id: 'vaults', label: 'Earn', icon: PieChart },
  { id: 'swap', label: 'Swap', icon: ArrowLeftRight },
  { id: 'settings', label: 'Settings', icon: Cog },
] as const

export default function DesktopShell({
  tab,
  onTab,
  onDisconnect,
  children,
}: {
  tab: string
  onTab: (id: string) => void
  onDisconnect: () => void
  children: ReactNode
}) {
  const [bell, setBell] = useState(false)
  const [read, setRead] = useState<string[]>([])
  const unread = notifications.filter((n) => n.unread && !read.includes(n.id)).length

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-ink">
      <div className="scanlines noise relative flex min-h-0 flex-1 flex-col overflow-hidden pb-28">
        <header className="z-30 shrink-0">
          <div className="mx-auto flex max-w-[1520px] items-center gap-4 px-14 py-4">
            <div className="flex items-center gap-3">
              <img src="/gizulogo.svg" alt="" className="h-7 w-auto" />
              <span className="text-[18px] font-medium tracking-tight">Gizu</span>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setBell((b) => !b)}
                  className="glass-soft relative flex h-11 w-11 items-center justify-center rounded-2xl text-white/55"
                >
                  <Bell size={17} />
                  {unread > 0 && (
                    <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-neon/70" />
                  )}
                </button>

                <AnimatePresence>
                  {bell && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setBell(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                        className="glass absolute right-0 top-14 z-50 w-[380px] overflow-hidden rounded-3xl"
                      >
                        <div className="flex items-center justify-between px-5 py-4">
                          <span className="text-[15px] font-medium">Notifications</span>
                          <button
                            onClick={() => setRead(notifications.map((n) => n.id))}
                            className="font-mono text-[10px] uppercase tracking-widest text-neon/70"
                          >
                            mark all
                          </button>
                        </div>
                        <div className="max-h-[380px] divide-y divide-white/5 overflow-y-auto">
                          {notifications.map((n) => {
                            const isUnread = n.unread && !read.includes(n.id)
                            return (
                              <button
                                key={n.id}
                                onClick={() => setRead((r) => (r.includes(n.id) ? r : [...r, n.id]))}
                                className="flex w-full items-start gap-3 px-5 py-4 text-left hover:bg-white/[0.02]"
                              >
                                <span
                                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                                    isUnread ? 'bg-neon' : 'bg-white/15'
                                  }`}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-baseline justify-between gap-3">
                                    <span className="truncate text-[14px] font-medium">{n.title}</span>
                                    <span className="shrink-0 font-mono text-[10px] text-white/30">
                                      {n.time}
                                    </span>
                                  </span>
                                  <span className="mt-1 block truncate text-[12px] text-white/45">
                                    {n.body}
                                  </span>
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

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

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex justify-center pb-7">
        <motion.nav
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          className="glass pointer-events-auto flex items-center gap-1 rounded-full p-2"
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
