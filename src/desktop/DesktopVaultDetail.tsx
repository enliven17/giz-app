import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Lock, Share2 } from 'lucide-react'
import Chart from '../components/Chart'
import SpotlightCard from '../components/SpotlightCard'
import GlitchText from '../components/GlitchText'
import SignOverlay, { type SignState } from '../components/SignOverlay'
import type { Vault } from '../data'

export default function DesktopVaultDetail({ vault, onBack }: { vault: Vault; onBack: () => void }) {
  const up = vault.change24h >= 0
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('25000')
  const [state, setState] = useState<'edit' | SignState>('edit')

  const value = Number(amount || 0)
  const units = side === 'buy' ? value / vault.price : value * vault.price
  const getToken = side === 'buy' ? vault.ticker : 'USDC'

  const confirm = () => {
    setState('signing')
    window.setTimeout(() => setState('done'), 1600)
    window.setTimeout(() => setState('edit'), 3800)
  }

  return (
    <div className="mx-auto max-w-[1520px] px-14 pb-10 pt-9">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="glass-soft flex h-11 items-center gap-2 rounded-2xl px-4 text-[13px] text-white/60"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60">
          <Share2 size={16} />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4">
              <div className="glass flex h-16 w-16 items-center justify-center rounded-2xl font-mono text-[16px] font-bold text-neon">
                {vault.ticker}
              </div>
              <div className="min-w-0">
                <h1 className="text-[34px] font-medium leading-tight tracking-tight">
                  <GlitchText>{vault.name}</GlitchText>
                </h1>
                <div className="mt-1 flex items-center gap-2 truncate font-mono text-[11px] uppercase tracking-wider text-white/30">
                  <Lock size={11} /> {vault.managers} · {vault.strategy}
                </div>
              </div>
              <div className="ml-auto shrink-0 text-right">
                <div className="font-mono text-[34px] font-normal leading-none tracking-tight">
                  ${vault.price.toFixed(4)}
                </div>
                <div className={`mt-2 font-mono text-[13px] ${up ? 'text-neon' : 'text-rose-400'}`}>
                  {up ? '+' : ''}
                  {vault.change24h}% today
                </div>
              </div>
            </div>
          </motion.div>

          <SpotlightCard className="rounded-[28px] p-8">
            <Chart series={vault.series} height={340} up={up} />
            <div className="mt-5 flex gap-2 font-mono text-[10px] uppercase tracking-widest">
              {['1D', '1W', '1M', '1Y', 'All'].map((t, i) => (
                <button
                  key={t}
                  className={`rounded-full px-3 py-1.5 ${
                    i === 2 ? 'bg-neon/15 text-neon' : 'text-white/30'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </SpotlightCard>

          <div className="grid grid-cols-3 gap-5">
            {[
              { label: 'Net APY', value: `${vault.apy}%`, accent: true },
              { label: 'TVL', value: vault.tvl },
              { label: 'Lockup', value: vault.lockup },
            ].map((m) => (
              <SpotlightCard key={m.label} className="rounded-[24px] px-6 py-6">
                <div
                  className={`font-mono text-[24px] font-normal leading-none tracking-tight ${
                    m.accent ? 'text-neon' : 'text-white/90'
                  }`}
                >
                  {m.value}
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/30">
                  {m.label}
                </div>
              </SpotlightCard>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <h3 className="mb-4 text-[20px] font-medium tracking-tight">Allocation</h3>
              <div className="glass rounded-3xl p-6">
                <div className="flex h-2.5 overflow-hidden rounded-full bg-white/5">
                  {vault.allocation.map((a, i) => (
                    <motion.div
                      key={a.label}
                      initial={{ width: 0 }}
                      animate={{ width: `${a.pct}%` }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                      style={{ opacity: 1 - i * 0.28 }}
                      className="h-full bg-neon"
                    />
                  ))}
                </div>
                <div className="mt-5 space-y-3">
                  {vault.allocation.map((a, i) => (
                    <div key={a.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-2 w-2 rounded-full bg-neon"
                          style={{ opacity: 1 - i * 0.28 }}
                        />
                        <span className="text-[14px] text-white/70">{a.label}</span>
                      </div>
                      <span className="font-mono text-[13px] text-white/50">{a.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-[20px] font-medium tracking-tight">Terms</h3>
              <div className="glass divide-y divide-white/5 rounded-3xl">
                {[
                  ['Strategy', vault.strategy],
                  ['Risk band', vault.risk],
                  ['Minimum', vault.minimum],
                  ['Redemption', vault.lockup],
                  ['Management fee', '2.0% / 20%'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between px-6 py-4">
                    <span className="text-[13px] text-white/40">{k}</span>
                    <span className="font-mono text-[13px] text-white/80">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-28">
            <SpotlightCard className="rounded-[28px] p-7">
              <div className="flex gap-1 rounded-2xl bg-white/[0.04] p-1">
                {(['buy', 'sell'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSide(s)}
                    className="relative flex-1 rounded-xl py-3 text-[14px] font-medium capitalize"
                  >
                    {side === s && (
                      <motion.span
                        layoutId="deskSide"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="absolute inset-0 rounded-xl bg-neon"
                      />
                    )}
                    <span className={`relative ${side === s ? 'text-ink' : 'text-white/50'}`}>{s}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white/[0.03] px-5 py-5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/30">
                  <span>You pay</span>
                  <span>{side === 'buy' ? 'USDC 184,204' : `${vault.ticker} 148,204`}</span>
                </div>
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                  inputMode="decimal"
                  placeholder="0"
                  className="mt-3 w-full bg-transparent font-mono text-[34px] font-normal leading-none tracking-tight caret-neon outline-none placeholder:text-white/20"
                />
              </div>

              <div className="mt-2 flex gap-2">
                {['25%', '50%', '75%', 'Max'].map((p) => (
                  <button
                    key={p}
                    className="glass-soft flex-1 rounded-xl py-2.5 font-mono text-[11px] text-white/45"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-white/[0.03] px-5 py-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                  You receive
                </div>
                <div className="mt-3 truncate font-mono text-[28px] font-normal leading-none tracking-tight text-white/85">
                  {units.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                  <span className="text-[16px] text-neon">{getToken}</span>
                </div>
              </div>

              <div className="mt-5 space-y-2 font-mono text-[12px]">
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

              <button
                onClick={confirm}
                className="neon-btn mt-6 flex h-14 w-full items-center justify-center rounded-2xl text-[15px] font-semibold capitalize"
              >
                Confirm {side}
              </button>
            </SpotlightCard>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {state !== 'edit' && (
          <SignOverlay
            state={state}
            doneLabel="order filled"
            detail={`${units.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${getToken}`}
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
