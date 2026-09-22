import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import Chart from '../components/Chart'
import VaultCard from '../components/VaultCard'
import SpotlightCard from '../components/SpotlightCard'
import { holdings, portfolioSeries, vaults, type Vault } from '../data'

export default function DesktopHome({
  onOpenVault,
  onTransfer,
  onActivity,
  onSeeAllVaults,
}: {
  onOpenVault: (v: Vault) => void
  onTransfer: (mode: 'deposit' | 'withdraw') => void
  onActivity: () => void
  onSeeAllVaults: () => void
}) {
  const total = holdings.reduce((a, h) => a + h.value, 0)
  const [whole, cents] = total.toFixed(2).split('.')

  return (
    <div className="mx-auto max-w-[1520px] px-14 py-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-[34px] font-medium tracking-tight">Good evening, Cankat</h1>
          <p className="mt-2 text-[14px] text-white/40">
            Three vaults active, next redemption window opens in 6 days.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onTransfer('deposit')}
            className="neon-btn flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-semibold"
          >
            <ArrowDownLeft size={16} /> Deposit
          </button>
          <button
            onClick={() => onTransfer('withdraw')}
            className="glass flex h-12 items-center gap-2 rounded-2xl px-6 text-[14px] font-medium"
          >
            <ArrowUpRight size={16} className="text-neon" /> Withdraw
          </button>
        </div>
      </motion.div>

      <div className="mt-9 grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-2"
        >
          <SpotlightCard className="rounded-[28px] p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
                  Portfolio value
                </div>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-[58px] font-normal leading-none tracking-tight">
                    ${Number(whole).toLocaleString('en-US')}
                  </span>
                  <span className="pb-1 text-[26px] text-white/35">.{cents}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="rounded-full bg-neon/10 px-3 py-1 font-mono text-[12px] text-neon">
                    + 3.84%
                  </span>
                  <span className="font-mono text-[12px] text-white/30">+$30,412.09 today</span>
                </div>
              </div>
              <div className="flex gap-2 font-mono text-[10px] uppercase tracking-widest">
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
            </div>
            <div className="mt-8">
              <Chart series={portfolioSeries} height={300} up />
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          <SpotlightCard className="flex-1 rounded-[28px] p-7">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-medium tracking-tight">Holdings</h3>
              <button
                onClick={onActivity}
                className="font-mono text-[10px] uppercase tracking-widest text-neon/70"
              >
                activity
              </button>
            </div>
            <div className="mt-5 divide-y divide-white/5">
              {holdings.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-4">
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-medium">{h.name}</div>
                    <div className="mt-0.5 font-mono text-[10px] text-white/30">{h.units} units</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[14px] font-normal">
                      ${h.value.toLocaleString('en-US')}
                    </div>
                    <div
                      className={`font-mono text-[10px] ${
                        h.change >= 0 ? 'text-neon/70' : 'text-rose-400/80'
                      }`}
                    >
                      {h.change >= 0 ? '+' : ''}
                      {h.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>

          <SpotlightCard className="rounded-[28px] p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/30">
              Available to invest
            </div>
            <div className="mt-3 font-mono text-[30px] font-normal tracking-tight">$184,204.00</div>
            <div className="mt-2 font-mono text-[11px] text-white/30">USDC on Monad</div>
          </SpotlightCard>
        </motion.div>
      </div>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[22px] font-medium tracking-tight">Private vaults</h2>
          <button
            onClick={onSeeAllVaults}
            className="font-mono text-[10px] uppercase tracking-widest text-neon/70"
          >
            see all
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6 xl:grid-cols-5">
          {vaults.map((v, i) => (
            <VaultCard key={v.id} vault={v} delay={0.05 * i} onClick={() => onOpenVault(v)} />
          ))}
        </div>
      </section>
    </div>
  )
}
