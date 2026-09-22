import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Fingerprint } from 'lucide-react'
import Scramble from './Scramble'
import SignOverlay, { type SignState } from './SignOverlay'



export default function TransferSheet({
  mode,
  onClose,
  variant = 'sheet',
}: {
  mode: 'deposit' | 'withdraw'
  onClose: () => void
  variant?: 'sheet' | 'modal'
}) {
  const modal = variant === 'modal'
  const [amount, setAmount] = useState('10000')
  const [state, setState] = useState<'edit' | SignState>('edit')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350)
    return () => clearTimeout(t)
  }, [])

  const timers = useRef<number[]>([])

  const confirm = () => {
    setState('signing')
    timers.current = [
      window.setTimeout(() => setState('done'), 1500),
      window.setTimeout(onClose, 3500),
    ]
  }

  const reject = () => {
    timers.current.forEach(clearTimeout)
    setState('failed')
    window.setTimeout(() => setState('edit'), 2200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={state === 'edit' ? onClose : undefined}
      className={`fixed inset-0 z-40 flex overscroll-contain bg-ink/70 backdrop-blur-md ${
        modal ? 'items-center justify-center p-8' : 'items-end'
      }`}
    >
      <motion.div
        initial={modal ? { y: 24, opacity: 0, scale: 0.98 } : { y: '100%' }}
        animate={modal ? { y: 0, opacity: 1, scale: 1 } : { y: 0 }}
        exit={modal ? { y: 24, opacity: 0, scale: 0.98 } : { y: '100%' }}
        transition={{ type: 'spring', stiffness: 250, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`glass relative w-full overflow-hidden px-5 pb-8 pt-5 ${
          modal ? 'max-w-[440px] rounded-[36px] p-7' : 'rounded-t-[36px]'
        }`}
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
        <div className="glass-soft mt-3 flex items-center gap-4 rounded-2xl px-5 py-4">
          <Fingerprint size={18} className="text-neon" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] text-white/85">Passkey wallet</span>
            <span className="mt-0.5 block font-mono text-[10px] text-white/30">0xA4f2 . . . 91c7</span>
          </span>
          <span className="h-2 w-2 rounded-full bg-neon" />
        </div>

        <div className="mt-4 space-y-2 px-1 font-mono text-[11px]">
          {[
            ['Network', 'Monad'],
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
            <SignOverlay
              state={state}
              doneLabel={mode === 'deposit' ? 'deposit queued' : 'withdrawal queued'}
              onCancel={reject}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
