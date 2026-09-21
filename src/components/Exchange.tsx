import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown, Check } from 'lucide-react'
import Scramble from './Scramble'
import ParticleDotOrb from './ParticleDotOrb'
import SpotlightCard from './SpotlightCard'
import { vaults } from '../data'

const RECENT = [
  { pair: 'USDC to HLX', amount: '25,000.00', date: '19 Sep, 14:02', units: '13,630.1 HLX' },
  { pair: 'OBS to USDC', amount: '8,400.00', date: '17 Sep, 09:41', units: '694.5 OBS' },
  { pair: 'USDC to MRD', amount: '50,000.00', date: '12 Sep, 18:20', units: '48,022.3 MRD' },
]

export default function Exchange() {
  const [vault, setVault] = useState(vaults[0])
  const [amount, setAmount] = useState('5000')
  const [state, setState] = useState<'edit' | 'signing' | 'done'>('edit')

  const units = Number(amount || 0) / vault.price

  const confirm = () => {
    setState('signing')
    setTimeout(() => setState('done'), 1600)
    setTimeout(() => setState('edit'), 3400)
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-[30px] font-medium tracking-tight">Exchange</h2>
      </motion.div>

      <div className="relative mt-7 space-y-2.5">
        <SpotlightCard className="rounded-[28px] px-6 py-7">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
            <span>You pay</span>
            <span>Balance 184,204.00</span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0"
              className="w-full min-w-0 bg-transparent font-mono text-[40px] font-normal leading-none tracking-tight caret-neon outline-none placeholder:text-white/20"
            />
            <span className="glass-soft flex h-11 shrink-0 items-center rounded-full px-4 font-mono text-[13px]">
              USDC
            </span>
          </div>
          <div className="mt-4 flex gap-2">
            {['25%', '50%', '75%', 'Max'].map((p) => (
              <button
                key={p}
                className="glass-soft flex-1 rounded-xl py-2.5 font-mono text-[11px] text-white/45"
              >
                {p}
              </button>
            ))}
          </div>
        </SpotlightCard>

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.button
            whileTap={{ rotate: 180 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-ink text-neon"
          >
            <ArrowDown size={18} />
          </motion.button>
        </div>

        <SpotlightCard className="rounded-[28px] px-6 py-7">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
            <span>You receive</span>
            <span>Fee 0.05%</span>
          </div>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div className="min-w-0 truncate font-mono text-[40px] font-normal leading-none tracking-tight text-white/85">
              {units.toLocaleString('en-US', { maximumFractionDigits: 2 })}
            </div>
            <span className="glass-soft flex h-11 shrink-0 items-center rounded-full px-4 font-mono text-[13px] text-neon">
              {vault.ticker}
            </span>
          </div>
          <div className="mt-4 truncate text-[13px] text-white/35">{vault.name}</div>
        </SpotlightCard>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {vaults.map((v) => (
          <button
            key={v.id}
            onClick={() => setVault(v)}
            className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-3 ${
              v.id === vault.id ? 'bg-neon/10' : 'glass-soft'
            }`}
          >
            <span
              className={`font-mono text-[12px] ${v.id === vault.id ? 'text-neon' : 'text-white/70'}`}
            >
              {v.ticker}
            </span>
            <span className="font-mono text-[11px] text-white/30">{v.apy}%</span>
          </button>
        ))}
      </div>

      <div className="glass mt-5 space-y-3 rounded-3xl px-5 py-5 font-mono text-[12px]">
        {[
          ['Rate', `1 ${vault.ticker} = $${vault.price.toFixed(4)}`],
          ['Settlement', 'T+0 instant'],
          ['Lockup', vault.lockup],
          ['Network fee', '$0.42'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between">
            <span className="text-white/30">{k}</span>
            <span className="text-white/70">{v}</span>
          </div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={confirm}
        className="neon-btn mt-6 flex h-16 w-full items-center justify-center rounded-3xl text-[15px] font-semibold"
      >
        Confirm swap
      </motion.button>

      <div className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[20px] font-medium tracking-tight">Recent</h3>
          <button className="font-mono text-[10px] uppercase tracking-widest text-neon/70">see all</button>
        </div>
        <div className="glass divide-y divide-white/5 rounded-3xl">
          {RECENT.map((r) => (
            <div key={r.pair + r.date} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-[14px] font-medium">{r.pair}</div>
                <div className="mt-0.5 font-mono text-[10px] text-white/30">{r.date}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-normal">${r.amount}</div>
                <div className="mt-0.5 font-mono text-[10px] text-white/30">{r.units}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {state !== 'edit' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 backdrop-blur-xl"
          >
            {state === 'signing' ? (
              <>
                <ParticleDotOrb className="h-40 w-40" size={160} speed={1.6} />
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
                  {units.toLocaleString('en-US', { maximumFractionDigits: 2 })} {vault.ticker}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
