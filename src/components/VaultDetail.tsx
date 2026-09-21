import { motion } from 'framer-motion'
import { ChevronLeft, Share2, Lock } from 'lucide-react'
import Chart from './Chart'
import SpotlightCard from './SpotlightCard'
import Scramble from './Scramble'
import GlitchText from './GlitchText'
import type { Vault } from '../data'

export default function VaultDetail({
  vault,
  onBack,
  onTrade,
}: {
  vault: Vault
  onBack: () => void
  onTrade: (side: 'buy' | 'sell') => void
}) {
  const up = vault.change24h >= 0

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-40 pt-14">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
            <Scramble text={vault.ticker + ' vault'} />
          </div>
          <button className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60">
            <Share2 size={16} />
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <div className="flex items-center gap-3">
            <div className="glass flex h-14 w-14 items-center justify-center rounded-2xl font-mono text-[15px] font-bold text-neon">
              {vault.ticker}
            </div>
            <div>
              <h2 className="text-[24px] font-semibold leading-tight">
                <GlitchText>{vault.name}</GlitchText>
              </h2>
              <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/30">
                <Lock size={10} /> {vault.managers}
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <span className="font-mono text-[40px] font-normal leading-none tracking-tight">
              ${vault.price.toFixed(4)}
            </span>
            <span
              className={`mb-1 rounded-full px-2.5 py-1 font-mono text-[11px] ${
                up ? 'bg-neon/10 text-neon' : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {up ? '+' : ''}
              {vault.change24h}%
            </span>
          </div>
        </motion.div>

        <div className="mt-6">
          <Chart series={vault.series} height={190} up={up} />
          <div className="mt-4 flex gap-2 font-mono text-[10px] uppercase tracking-widest">
            {['1D', '1W', '1M', '1Y', 'All'].map((t, i) => (
              <button
                key={t}
                className={`rounded-full px-3 py-1.5 ${i === 2 ? 'bg-neon/15 text-neon' : 'text-white/30'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-2">
          {[
            { label: 'Net APY', value: `${vault.apy}%`, accent: true },
            { label: 'TVL', value: vault.tvl },
            { label: 'Lockup', value: vault.lockup },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06 * i }}
            >
              <SpotlightCard className="h-full px-4 py-5">
                <div
                  className={`font-mono text-[19px] font-normal leading-none tracking-tight ${
                    m.accent ? 'text-neon' : 'text-white/90'
                  }`}
                >
                  {m.value}
                </div>
                <div className="mt-2.5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/30">
                  {m.label}
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-7">
          <h3 className="mb-3 text-[16px] font-medium">Allocation</h3>
          <div className="glass rounded-3xl p-5">
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

        <div className="mt-7">
          <h3 className="mb-3 text-[16px] font-medium">Terms</h3>
          <div className="glass divide-y divide-white/5 rounded-3xl">
            {[
              ['Strategy', vault.strategy],
              ['Risk band', vault.risk],
              ['Minimum', vault.minimum],
              ['Redemption', vault.lockup],
              ['Management fee', '2.0% / 20%'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between px-5 py-4">
                <span className="text-[13px] text-white/40">{k}</span>
                <span className="font-mono text-[13px] text-white/80">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 flex gap-3 bg-gradient-to-t from-ink via-ink/90 to-transparent px-5 pb-8 pt-10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onTrade('buy')}
          className="neon-btn relative flex h-15 flex-1 items-center justify-center overflow-hidden rounded-2xl py-5 text-[15px] font-semibold"
        >
          <span className="relative">Buy</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => onTrade('sell')}
          className="glass flex flex-1 items-center justify-center rounded-2xl py-5 text-[15px] font-semibold text-white/85"
        >
          Sell
        </motion.button>
      </div>
    </div>
  )
}
