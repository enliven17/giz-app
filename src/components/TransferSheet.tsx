import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check, Fingerprint, Wallet } from 'lucide-react'
import Scramble from './Scramble'

const WALLETS = [
  { id: 'passkey', icon: Fingerprint, label: 'Passkey wallet', note: '0xA4f2 . . . 91c7' },
  { id: 'metamask', icon: Wallet, label: 'MetaMask', note: '0x7c19 . . . 4d02' },
  { id: 'ledger', icon: Wallet, label: 'Ledger', note: '0x91be . . . e8a5' },
]

const NETWORKS = ['Ethereum', 'Base', 'Arbitrum']

export default function TransferSheet({
  mode,
  onClose,
}: {
  mode: 'deposit' | 'withdraw'
  onClose: () => void
}) {
  const [amount, setAmount] = useState('10000')
  const [wallet, setWallet] = useState('metamask')
  const [network, setNetwork] = useState('Base')
  const [state, setState] = useState<'edit' | 'signing' | 'done'>('edit')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350)
    return () => clearTimeout(t)
  }, [])

  const confirm = () => {
    setState('signing')
    setTimeout(() => setState('done'), 1500)
    setTimeout(onClose, 3100)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={state === 'edit' ? onClose : undefined}
      className="absolute inset-0 z-40 flex items-end overscroll-contain bg-ink/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 250, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="glass relative w-full overflow-hidden rounded-t-[36px] px-5 pb-8 pt-5"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon/70">
            <Scramble text={mode === 'deposit' ? 'add funds' : 'withdraw funds'} />
          </div>
          <button
            onClick={onClose}
            className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-white/50"
          >
            <X size={15} />
          </button>
        </div>

        <div className="glass-soft rounded-3xl px-5 py-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/30">
            <span>Amount</span>
            <span>{mode === 'deposit' ? 'Wallet 42,180.00' : 'Available 184,204.00'}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <input
              ref={inputRef}
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              className="w-full min-w-0 bg-transparent font-mono text-[30px] font-normal caret-neon outline-none placeholder:text-white/25"
            />
            <span className="glass shrink-0 rounded-full px-3 py-2 font-mono text-[12px]">USDC</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {['25%', '50%', '75%', 'Max'].map((p) => (
            <button
              key={p}
              className="glass-soft flex-1 rounded-xl py-2.5 font-mono text-[11px] text-white/50"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="mt-5 px-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
          {mode === 'deposit' ? 'From wallet' : 'To wallet'}
        </div>
        <div className="mt-3 space-y-2">
          {WALLETS.map(({ id, icon: Icon, label, note }) => (
            <button
              key={id}
              onClick={() => setWallet(id)}
              className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left ${
                wallet === id ? 'bg-neon/10' : 'glass-soft'
              }`}
            >
              <Icon size={18} className={wallet === id ? 'text-neon' : 'text-white/40'} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] text-white/85">{label}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-white/30">{note}</span>
              </span>
              {wallet === id && <span className="h-2 w-2 rounded-full bg-neon" />}
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          {NETWORKS.map((n) => (
            <button
              key={n}
              onClick={() => setNetwork(n)}
              className={`flex-1 rounded-xl py-2.5 font-mono text-[11px] ${
                network === n ? 'bg-neon/10 text-neon' : 'glass-soft text-white/45'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2 px-1 font-mono text-[11px]">
          {[
            ['Network', network],
            ['Settlement', 'Instant on chain'],
            ['Network fee', '$0.42'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between">
              <span className="text-white/30">{k}</span>
              <span className="text-white/60">{v}</span>
            </div>
          ))}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={confirm}
          className="neon-btn mt-5 flex h-16 w-full items-center justify-center rounded-3xl text-[15px] font-semibold"
        >
          {mode === 'deposit' ? 'Confirm deposit' : 'Confirm withdrawal'}
        </motion.button>

        <AnimatePresence>
          {state !== 'edit' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 backdrop-blur-xl"
            >
              {state === 'signing' ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
                    className="h-16 w-16 rounded-full border-2 border-neon/20 border-t-neon"
                  />
                  <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-neon/80">
                    <Scramble text="signing with passkey" />
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="glass flex h-20 w-20 items-center justify-center rounded-[28px]"
                  >
                    <Check size={38} className="text-neon" strokeWidth={2.4} />
                  </motion.div>
                  <div className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-neon/80">
                    <Scramble text={mode === 'deposit' ? 'deposit queued' : 'withdrawal queued'} />
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
