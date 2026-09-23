import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Lock, Share2 } from 'lucide-react'
import Chart from '../components/Chart'
import SpotlightCard from '../components/SpotlightCard'
import GlitchText from '../components/GlitchText'
import SignOverlay, { type SignState } from '../components/SignOverlay'
import useSize from '../useSize'
import type { Vault } from '../data'

export default function DesktopVaultDetail({ vault, onBack }: { vault: Vault; onBack: () => void }) {
  const up = vault.change24h >= 0
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState('25000')
  const [state, setState] = useState<'edit' | SignState>('edit')
  const chart = useSize<HTMLDivElement>()

  const value = Number(amount || 0)
  const units = side === 'buy' ? value / vault.price : value * vault.price
  const getToken = side === 'buy' ? vault.ticker : 'USDC'

  const confirm = () => {
    setState('signing')
    window.setTimeout(() => setState('done'), 1600)
    window.setTimeout(() => setState('edit'), 3800)
  }

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1520px] flex-1 flex-col px-14 pb-6 pt-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex shrink-0 items-center gap-4"
      >
        <button
          onClick={onBack}
          className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60"
        >
          <ChevronLeft size={17} />
        </button>
        <div className="glass flex h-12 w-12 items-center justify-center rounded-2xl font-mono text-[13px] font-bold text-neon">
          {vault.ticker}
        </div>
        <div className="min-w-0">
          <h1 className="text-[26px] font-medium leading-tight tracking-tight">
            <GlitchText>{vault.name}</GlitchText>
          </h1>
          <div className="mt-0.5 flex items-center gap-2 truncate font-mono text-[10px] uppercase tracking-wider text-white/30">
            <Lock size={10} /> {vault.managers} · {vault.strategy}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-5">
          <div className="text-right">
            <div className="font-mono text-[28px] font-normal leading-none tracking-tight">
              ${vault.price.toFixed(4)}
            </div>
            <div className={`mt-1.5 font-mono text-[12px] ${up ? 'text-neon' : 'text-rose-400'}`}>
              {up ? '+' : ''}
              {vault.change24h}% today
            </div>
          </div>
          <button className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60">
            <Share2 size={16} />
          </button>
        </div>
      </motion.div>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-3 gap-5">
        <div className="col-span-2 flex min-h-0 flex-col gap-5">
          <SpotlightCard
            className="flex min-h-0 flex-1 flex-col rounded-[28px] p-7"
            contentClassName="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex shrink-0 justify-end gap-2 font-mono text-[10px] uppercase tracking-widest">
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
            <div ref={chart.ref} className="mt-3 min-h-0 flex-1">
              {chart.height > 20 && <Chart series={vault.series} height={chart.height} up={up} />}
            </div>
          </SpotlightCard>

          <div className="grid shrink-0 grid-cols-4 gap-5">
            {[
              { label: 'Net APY', value: `${vault.apy}%`, accent: true },
              { label: 'TVL', value: vault.tvl },
              { label: 'Lockup', value: vault.lockup },
              { label: 'Minimum', value: vault.minimum },
            ].map((m) => (
              <SpotlightCard key={m.label} className="rounded-[22px] px-5 py-4">
                <div
                  className={`font-mono text-[20px] font-normal leading-none tracking-tight ${
                    m.accent ? 'text-neon' : 'text-white/90'
                  }`}
                >
                  {m.value}
                </div>
                <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">
                  {m.label}
                </div>
              </SpotlightCard>
            ))}
          </div>

          <SpotlightCard className="shrink-0 rounded-[24px] p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-medium tracking-tight">Allocation</h3>
              <span className="font-mono text-[11px] text-white/30">{vault.risk} risk band</span>
            </div>
            <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-white/5">
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
            <div className="mt-4 flex gap-8">
              {vault.allocation.map((a, i) => (
                <div key={a.label} className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-neon" style={{ opacity: 1 - i * 0.28 }} />
                  <span className="text-[13px] text-white/70">{a.label}</span>
                  <span className="font-mono text-[12px] text-white/40">{a.pct}%</span>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </div>

        <div className="flex min-h-0">
          <SpotlightCard
            className="flex min-h-0 w-full flex-col rounded-[28px] p-6"
            contentClassName="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex shrink-0 gap-1 rounded-2xl bg-white/[0.04] p-1">
              {(['buy', 'sell'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSide(s)}
                  className="relative flex-1 rounded-xl py-2.5 text-[14px] font-medium capitalize"
                >
                  {side === s && (
                    <motion.span
                      layoutId="deskSide"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      className={`absolute inset-0 rounded-xl ${
                        s === 'sell' ? 'bg-[#c4576a]' : 'bg-neon'
                      }`}
                    />
                  )}
                  <span className={`relative ${side === s ? 'text-ink' : 'text-white/50'}`}>{s}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 shrink-0 rounded-2xl bg-white/[0.03] px-5 py-4">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-white/30">
                <span>You pay</span>
                <span>{side === 'buy' ? 'USDC 184,204' : `${vault.ticker} 148,204`}</span>
              </div>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                inputMode="decimal"
                placeholder="0"
                className="mt-2 w-full bg-transparent font-mono text-[30px] font-normal leading-none tracking-tight caret-neon outline-none placeholder:text-white/20"
              />
            </div>

            <div className="mt-2 flex shrink-0 gap-2">
              {['25%', '50%', '75%', 'Max'].map((p) => (
                <button
                  key={p}
                  className="glass-soft flex-1 rounded-xl py-2 font-mono text-[11px] text-white/45"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="mt-2 shrink-0 rounded-2xl bg-white/[0.03] px-5 py-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-white/30">
                You receive
              </div>
              <div className="mt-2 truncate font-mono text-[26px] font-normal leading-none tracking-tight text-white/85">
                {units.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
                <span className="text-[15px] text-neon">{getToken}</span>
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto font-mono text-[12px]">
              {[
                ['Rate', `1 ${vault.ticker} = $${vault.price.toFixed(4)}`],
                ['Settlement', 'T+0 instant'],
                ['Redemption', vault.lockup],
                ['Management fee', '2.0% / 20%'],
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
              className={`mt-4 flex h-14 w-full shrink-0 items-center justify-center rounded-2xl text-[15px] font-semibold capitalize ${
                side === 'sell' ? 'sell-btn' : 'neon-btn'
              }`}
            >
              Confirm {side}
            </button>
          </SpotlightCard>
        </div>
      </div>

      <AnimatePresence>
        {state !== 'edit' && (
          <SignOverlay
            state={state}
            tone={side === 'sell' ? 'negative' : 'positive'}
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
