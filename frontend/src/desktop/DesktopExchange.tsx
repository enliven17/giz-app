import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'
import SpotlightCard from '../components/SpotlightCard'
import Sparkline from '../components/Sparkline'
import SignOverlay, { type SignState } from '../components/SignOverlay'
import { vaults } from '../data'

const RECENT = [
  { pair: 'USDC to HLX', amount: '25,000.00', date: '19 Sep, 14:02', units: '13,630.1 HLX' },
  { pair: 'OBS to USDC', amount: '8,400.00', date: '17 Sep, 09:41', units: '694.5 OBS' },
  { pair: 'USDC to MRD', amount: '50,000.00', date: '12 Sep, 18:20', units: '48,022.3 MRD' },
  { pair: 'USDC to VTX', amount: '64,000.00', date: '28 Aug, 10:15', units: '14,504.8 VTX' },
]

export default function DesktopExchange() {
  const [vault, setVault] = useState(vaults[0])
  const [amount, setAmount] = useState('5000')
  const [state, setState] = useState<'edit' | SignState>('edit')

  const units = Number(amount || 0) / vault.price

  const confirm = () => {
    setState('signing')
    window.setTimeout(() => setState('done'), 1600)
    window.setTimeout(() => setState('edit'), 3800)
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1520px] flex-1 flex-col px-14 pb-6 pt-7">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="shrink-0">
        <h1 className="text-[28px] font-medium tracking-tight">Exchange</h1>
        <p className="mt-1 text-[13px] text-white/40">
          Swap into any open vault, settled instantly on Monad.
        </p>
      </motion.div>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-3 gap-5">
        <div className="col-span-2 flex min-h-0">
          <SpotlightCard className="flex w-full flex-col rounded-[28px] p-7">
            <div className="relative space-y-3">
              <div className="rounded-3xl bg-white/[0.03] px-6 py-5">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
                  <span>You pay</span>
                  <span>Balance 184,204.00</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-5">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                    inputMode="decimal"
                    placeholder="0"
                    className="w-full min-w-0 bg-transparent font-mono text-[40px] font-normal leading-none tracking-tight caret-neon outline-none placeholder:text-white/20"
                  />
                  <span className="glass-soft flex h-12 shrink-0 items-center rounded-full px-5 font-mono text-[14px]">
                    USDC
                  </span>
                </div>
                <div className="mt-5 flex gap-2">
                  {['25%', '50%', '75%', 'Max'].map((p) => (
                    <button
                      key={p}
                      className="glass-soft flex-1 rounded-xl py-2.5 font-mono text-[11px] text-white/45"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                <motion.button
                  whileTap={{ rotate: 180 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-ink text-neon"
                >
                  <ArrowDown size={18} />
                </motion.button>
              </div>

              <div className="rounded-3xl bg-white/[0.03] px-6 py-5">
                <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-white/30">
                  <span>You receive</span>
                  <span>Fee 0.05%</span>
                </div>
                <div className="mt-4 flex items-end justify-between gap-5">
                  <div className="min-w-0 truncate font-mono text-[40px] font-normal leading-none tracking-tight text-white/85">
                    {units.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </div>
                  <span className="glass-soft flex h-12 shrink-0 items-center rounded-full px-5 font-mono text-[14px] text-neon">
                    {vault.ticker}
                  </span>
                </div>
                <div className="mt-4 text-[13px] text-white/35">{vault.name}</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-4 gap-3">
              {[
                ['Rate', `$${vault.price.toFixed(4)}`],
                ['Settlement', 'T+0'],
                ['Lockup', vault.lockup],
                ['Network fee', '$0.42'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/[0.03] px-4 py-4">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">{k}</div>
                  <div className="mt-2 font-mono text-[14px] text-white/80">{v}</div>
                </div>
              ))}
            </div>

            <button
              onClick={confirm}
              className="neon-btn mt-auto flex h-14 w-full items-center justify-center rounded-2xl text-[15px] font-semibold"
            >
              Confirm swap
            </button>
          </SpotlightCard>
        </div>

        <div className="flex min-h-0 flex-col gap-5">
          <SpotlightCard className="shrink-0 rounded-[28px] p-6">
            <h3 className="text-[17px] font-medium tracking-tight">Destination vault</h3>
            <div className="mt-3 space-y-1.5">
              {vaults.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVault(v)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                    v.id === vault.id ? 'bg-neon/10' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <span
                    className={`font-mono text-[12px] ${
                      v.id === vault.id ? 'text-neon' : 'text-white/60'
                    }`}
                  >
                    {v.ticker}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-white/70">{v.name}</span>
                  <Sparkline series={v.series} up={v.change24h >= 0} width={52} height={22} />
                  <span className="font-mono text-[12px] text-neon">{v.apy}%</span>
                </button>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard className="flex min-h-0 flex-1 flex-col rounded-[28px] p-6">
            <h3 className="shrink-0 text-[17px] font-medium tracking-tight">Recent</h3>
            <div className="mt-2 min-h-0 flex-1 divide-y divide-white/5 overflow-y-auto">
              {RECENT.map((r) => (
                <div key={r.pair + r.date} className="flex items-center justify-between py-3.5">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium">{r.pair}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-white/30">{r.date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[13px]">${r.amount}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-white/30">{r.units}</div>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>
      </div>

      <AnimatePresence>
        {state !== 'edit' && (
          <SignOverlay
            state={state}
            doneLabel="order filled"
            detail={`${units.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${vault.ticker}`}
            onCancel={() => {
              setState('failed')
              window.setTimeout(() => setState('edit'), 2200)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
