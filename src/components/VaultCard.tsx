import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import Sparkline from './Sparkline'
import type { Vault } from '../data'

export default function VaultCard({
  vault: v,
  onClick,
  delay = 0,
}: {
  vault: Vault
  onClick: () => void
  delay?: number
}) {
  const up = v.change24h >= 0
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="glass relative flex aspect-square flex-col justify-between overflow-hidden rounded-3xl p-4 text-left"
    >
      <div className="flex items-start justify-between">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neon/10 font-mono text-[11px] font-bold text-neon">
          {v.ticker}
          <Lock size={8} className="absolute -right-0.5 -top-0.5 rounded-full bg-ink p-[1px] text-neon/70" />
        </div>
        <div className={`font-mono text-[10px] ${up ? 'text-neon/70' : 'text-rose-400/80'}`}>
          {up ? '+' : ''}
          {v.change24h}%
        </div>
      </div>

      <div className="-mx-1 flex justify-center">
        <Sparkline series={v.series} up={up} width={130} height={40} />
      </div>

      <div>
        <div className="truncate text-[14px] font-medium leading-tight">{v.name}</div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="truncate font-mono text-[9px] uppercase tracking-wider text-white/30">
            {v.tvl} tvl
          </span>
          <span className="font-mono text-[13px] text-neon">{v.apy}%</span>
        </div>
      </div>
    </motion.button>
  )
}
