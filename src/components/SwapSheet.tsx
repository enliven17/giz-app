import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, ChevronDown, X, Check } from 'lucide-react'
import Scramble from './Scramble'
import type { Vault } from '../data'

export default function SwapSheet({
  vault,
  side,
  onClose,
}: {
  vault: Vault
  side: 'buy' | 'sell'
  onClose: () => void
}) {
  const [amount, setAmount] = useState('2500')
  const [state, setState] = useState<'edit' | 'signing' | 'done'>('edit')
  const inputRef = useRef<HTMLInputElement>(null)

  // ponytail: autoFocus arkadaki sayfayi kaydiriyordu, preventScroll ile odaklan
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 350)
    return () => clearTimeout(t)
  }, [])

  const value = Number(amount || 0)
  const units = side === 'buy' ? value / vault.price : value * vault.price
  const payToken = side === 'buy' ? 'USDC' : vault.ticker
  const getToken = side === 'buy' ? vault.ticker : 'USDC'

  const confirm = () => {
    setState('signing')
    setTimeout(() => setState('done'), 1600)
    setTimeout(onClose, 3200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex items-end overscroll-contain bg-ink/70 backdrop-blur-md"
      onClick={state === 'edit' ? onClose : undefined}
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
            <Scramble text={side === 'buy' ? 'buy order' : 'sell order'} />
          </div>
          <button onClick={onClose} className="glass-soft flex h-9 w-9 items-center justify-center rounded-xl text-white/50">
            <X size={15} />
          </button>
        </div>

        <div className="relative space-y-2">
          <div className="glass-soft rounded-3xl px-5 py-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/30">
              <span>From</span>
              <span>Balance 184,204.00</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                ref={inputRef}
                inputMode="decimal"
                placeholder="0"
                className="w-full min-w-0 bg-transparent font-mono text-[30px] font-normal caret-neon outline-none placeholder:text-white/25"
              />
              <button className="glass flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-[12px]">
                {payToken} <ChevronDown size={13} className="text-neon" />
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <motion.button
              whileTap={{ rotate: 180 }}
              className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-neon"
            >
              <ArrowDown size={16} />
            </motion.button>
          </div>

          <div className="glass-soft rounded-3xl px-5 py-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/30">
              <span>Receive</span>
              <span>Fee 0.05%</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="font-mono text-[30px] font-normal text-white/85">
                {units.toLocaleString('en-US', { maximumFractionDigits: 2 })}
              </div>
              <button className="glass flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-[12px]">
                {getToken} <ChevronDown size={13} className="text-neon" />
              </button>
            </div>
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

        <div className="mt-4 space-y-2 px-1 font-mono text-[11px]">
          {[
            ['Rate', `1 ${vault.ticker} = $${vault.price.toFixed(4)}`],
            ['Settlement', 'T+0 instant'],
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
          className="neon-btn relative mt-5 flex h-16 w-full items-center justify-center overflow-hidden rounded-3xl text-[15px] font-semibold"
        >
          <span className="relative">Confirm swap</span>
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
                    <Scramble text="order filled" />
                  </div>
                  <div className="mt-3 font-mono text-[10px] text-white/25">
                    {units.toLocaleString('en-US', { maximumFractionDigits: 2 })} {getToken}
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
