import { motion } from 'framer-motion'
import { ArrowDownLeft, ArrowUpRight, MoreHorizontal, Bell } from 'lucide-react'
import Chart from './Chart'
import VaultCard from './VaultCard'
import Scramble from './Scramble'
import { holdings, portfolioSeries, vaults, type Vault } from '../data'

const fade = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.45 } }),
}

export default function Home({ onOpenVault }: { onOpenVault: (v: Vault) => void }) {
  const total = holdings.reduce((a, h) => a + h.value, 0)
  const [whole, cents] = total.toFixed(2).split('.')

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-14">
      <motion.header custom={0} variants={fade} initial="hidden" animate="show" className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="glass flex h-11 w-11 items-center justify-center rounded-2xl font-mono text-sm text-neon">
            CP
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/35">
              <Scramble text="member 0417" />
            </div>
            <div className="text-[15px] font-medium">Good evening</div>
          </div>
        </div>
        <button className="glass-soft relative flex h-11 w-11 items-center justify-center rounded-2xl text-white/60">
          <Bell size={17} />
          <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-neon/70" />
        </button>
      </motion.header>

      <motion.section custom={1} variants={fade} initial="hidden" animate="show" className="mt-9">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">Portfolio value</div>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-[46px] font-normal leading-none tracking-tight">
            ${Number(whole).toLocaleString('en-US')}
          </span>
          <span className="pb-1 text-[26px] font-normal text-white/35">.{cents}</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-full bg-neon/10 px-2.5 py-1 font-mono text-[11px] text-neon">+ 3.84%</span>
          <span className="font-mono text-[11px] text-white/30">+$30,412.09 today</span>
        </div>
      </motion.section>

      <motion.section custom={2} variants={fade} initial="hidden" animate="show" className="mt-5">
        <Chart series={portfolioSeries} height={140} up />
        <div className="mt-3 flex gap-2 font-mono text-[10px] uppercase tracking-widest">
          {['1D', '1W', '1M', '1Y', 'All'].map((t, i) => (
            <button
              key={t}
              className={`rounded-full px-3 py-1.5 ${i === 2 ? 'bg-neon/15 text-neon' : 'text-white/30'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section custom={3} variants={fade} initial="hidden" animate="show" className="mt-6 flex gap-3">
        <button className="glass flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-medium">
          <ArrowDownLeft size={17} className="text-neon" /> Deposit
        </button>
        <button className="glass flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-[14px] font-medium">
          <ArrowUpRight size={17} className="text-neon" /> Withdraw
        </button>
        <button className="glass-soft flex w-14 items-center justify-center rounded-2xl text-white/50">
          <MoreHorizontal size={18} />
        </button>
      </motion.section>

      <motion.section custom={4} variants={fade} initial="hidden" animate="show" className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-medium">Private vaults</h3>
          <button className="font-mono text-[10px] uppercase tracking-widest text-neon/70">see all</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {vaults.map((v, i) => (
            <VaultCard key={v.id} vault={v} delay={0.3 + 0.05 * i} onClick={() => onOpenVault(v)} />
          ))}
        </div>
      </motion.section>

      <motion.section custom={10} variants={fade} initial="hidden" animate="show" className="mt-9">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-medium">Holdings</h3>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/25">3 positions</span>
        </div>
        <div className="glass divide-y divide-white/5 rounded-3xl">
          {holdings.map((h) => (
            <div key={h.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-[14px] font-medium">{h.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-white/30">{h.units} units</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[14px] font-normal">${h.value.toLocaleString('en-US')}</div>
                <div className={`font-mono text-[10px] ${h.change >= 0 ? 'text-neon/70' : 'text-rose-400/80'}`}>
                  {h.change >= 0 ? '+' : ''}
                  {h.change}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
