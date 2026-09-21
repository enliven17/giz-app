import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Fingerprint,
  Bell,
  Globe,
  ShieldCheck,
  FileText,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Copy,
} from 'lucide-react'

const groups = [
  {
    title: 'Security',
    rows: [
      { id: 'passkey-wallet', icon: Fingerprint, label: 'Passkey wallet', value: 'Active', toggle: false },
      { id: 'transaction-signing', icon: ShieldCheck, label: 'Transaction signing', value: 'Biometric', toggle: false },
      { id: 'alerts', icon: Bell, label: 'Push alerts', toggle: true },
    ],
  },
  {
    title: 'Preferences',
    rows: [
      { id: 'currency', icon: Globe, label: 'Currency', value: 'USD', toggle: false },
      { id: 'statements', icon: FileText, label: 'Statements', value: 'Monthly', toggle: false },
    ],
  },
  {
    title: 'Support',
    rows: [
      { id: 'contact-desk', icon: LifeBuoy, label: 'Contact desk', toggle: false },
      { id: 'terms', icon: FileText, label: 'Terms and disclosures', toggle: false },
    ],
  },
] as const

export default function Settings({
  onDisconnect,
  onOpen,
}: {
  onDisconnect: () => void
  onOpen: (id: string) => void
}) {
  const [alerts, setAlerts] = useState(true)

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-[30px] font-medium tracking-tight">Account</h2>
      </motion.div>

      <div className="glass mt-6 flex items-center gap-4 rounded-3xl p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neon/10 font-mono text-[15px] text-neon">
          CP
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[16px] font-medium">Cankat Polat</div>
          <div className="mt-1 truncate font-mono text-[11px] text-white/30">0xA4f2 . . . 91c7</div>
        </div>
        <button className="glass-soft flex h-10 w-10 items-center justify-center rounded-xl text-white/45">
          <Copy size={14} />
        </button>
      </div>

      {groups.map((g, gi) => (
        <motion.section
          key={g.title}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * gi }}
          className="mt-7"
        >
          <div className="mb-3 px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
            {g.title}
          </div>
          <div className="glass divide-y divide-white/5 rounded-3xl">
            {g.rows.map((r) => {
              const Icon = r.icon
              return (
                <div
                  key={r.label}
                  role={r.toggle ? undefined : 'button'}
                  onClick={() => !r.toggle && onOpen(r.id)}
                  className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-white/[0.03]"
                >
                  <Icon size={16} className="shrink-0 text-white/40" />
                  <span className="flex-1 truncate text-[14px] text-white/85">{r.label}</span>
                  {r.toggle ? (
                    <button
                      onClick={() => setAlerts((a) => !a)}
                      className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-colors ${
                        alerts ? 'bg-neon' : 'bg-white/10'
                      }`}
                    >
                      <motion.span
                        layout
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className={`h-5 w-5 rounded-full bg-ink ${alerts ? 'ml-auto' : ''}`}
                      />
                    </button>
                  ) : (
                    <>
                      {'value' in r && r.value && (
                        <span className="font-mono text-[12px] text-white/45">{r.value}</span>
                      )}
                      <ChevronRight size={15} className="text-white/25" />
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </motion.section>
      ))}

      <button
        onClick={onDisconnect}
        className="glass-soft mt-8 flex w-full items-center justify-center gap-2 rounded-3xl py-4 text-[14px] font-medium text-rose-300/80"
      >
        <LogOut size={16} /> Disconnect wallet
      </button>

      <div className="mt-8 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-white/20">
        Nexum v0.1.0
      </div>
    </div>
  )
}
