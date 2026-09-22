import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import Scramble from './Scramble'

const AMOUNTS = [
  'Under $500',
  '$500 to $2,000',
  '$2,000 to $10,000',
  '$10,000 to $50,000',
  '$50,000+',
  'Just exploring',
]

const PLATFORMS = ['Aave', 'Morpho', 'Pendle', 'Yearn', 'Binance or Coinbase', 'New to DeFi']

export default function RequestAccess({
  onClose,
  variant = 'sheet',
}: {
  onClose: () => void
  variant?: 'sheet' | 'modal'
}) {
  const modal = variant === 'modal'
  const [email, setEmail] = useState('')
  const [amount, setAmount] = useState('')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [other, setOther] = useState('')
  const [sent, setSent] = useState(false)

  const toggle = (p: string) =>
    setPlatforms((list) => (list.includes(p) ? list.filter((x) => x !== p) : [...list, p]))

  const submit = () => {
    setSent(true)
    window.setTimeout(onClose, 2400)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className={`fixed inset-0 z-50 flex overscroll-contain bg-ink/80 backdrop-blur-md ${
        modal ? 'items-center justify-center p-8' : 'items-end'
      }`}
    >
      <motion.div
        initial={modal ? { y: 24, opacity: 0, scale: 0.98 } : { y: '100%' }}
        animate={modal ? { y: 0, opacity: 1, scale: 1 } : { y: 0 }}
        exit={modal ? { y: 24, opacity: 0, scale: 0.98 } : { y: '100%' }}
        transition={{ type: 'spring', stiffness: 250, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`glass relative flex max-h-[88dvh] w-full flex-col overflow-hidden ${
          modal ? 'max-w-[520px] rounded-[32px] p-8' : 'rounded-t-[36px] px-5 pb-8 pt-5'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between">
          <div>
            <h2 className="text-[24px] font-medium tracking-tight">Request early access</h2>
            <p className="mt-2 max-w-[360px] text-[13px] leading-relaxed text-white/45">
              Help us shape Gizu. Answer three quick questions to join the early access list.
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-soft flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="mt-6 min-h-0 flex-1 space-y-7 overflow-y-auto pr-1">
          <section>
            <div className="text-[14px] font-medium">Where should we send your invitation?</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email address"
              className="glass-soft mt-3 h-13 w-full rounded-2xl px-5 py-4 text-[14px] caret-neon outline-none placeholder:text-white/25"
            />
          </section>

          <section>
            <div className="text-[14px] font-medium">
              How much would you consider investing through Gizu?
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              Select one, not a commitment
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {AMOUNTS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(a)}
                  className={`rounded-2xl px-4 py-3 text-left text-[13px] ${
                    amount === a ? 'bg-neon/10 text-neon' : 'glass-soft text-white/60'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="text-[14px] font-medium">
              Which platforms do you use to invest or earn yield?
            </div>
            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/30">
              Select all that apply
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => toggle(p)}
                  className={`rounded-full px-4 py-2.5 text-[13px] ${
                    platforms.includes(p) ? 'bg-neon/10 text-neon' : 'glass-soft text-white/60'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <input
              value={other}
              onChange={(e) => setOther(e.target.value)}
              placeholder="Other"
              className="glass-soft mt-3 w-full rounded-2xl px-5 py-3.5 text-[13px] caret-neon outline-none placeholder:text-white/25"
            />
          </section>
        </div>

        <button
          onClick={submit}
          className="neon-btn mt-6 flex h-15 w-full shrink-0 items-center justify-center rounded-3xl py-5 text-[15px] font-semibold"
        >
          Request access
        </button>

        <AnimatePresence>
          {sent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink/95 backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                className="glass flex h-20 w-20 items-center justify-center rounded-[28px]"
              >
                <Check size={38} strokeWidth={2.2} className="text-neon" />
              </motion.div>
              <div className="mt-7 font-mono text-[11px] uppercase tracking-[0.3em] text-neon/80">
                <Scramble text="you are on the list" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
