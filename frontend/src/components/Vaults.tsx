import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import VaultCard from './VaultCard'
import { vaults, type Vault } from '../data'

const FILTERS = ['All', 'Low', 'Medium', 'High'] as const

export default function Vaults({ onOpenVault }: { onOpenVault: (v: Vault) => void }) {
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState<(typeof FILTERS)[number]>('All')

  const list = vaults.filter(
    (v) =>
      (risk === 'All' || v.risk === risk) &&
      (v.name + v.ticker + v.strategy).toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-14">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-[30px] font-medium tracking-tight">Private vaults</h2>
      </motion.div>

      <div className="mt-6 flex gap-2">
        <div className="glass-soft flex flex-1 items-center gap-3 rounded-2xl px-4">
          <Search size={15} className="shrink-0 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strategy or manager"
            className="h-12 w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-white/25"
          />
        </div>
        <button className="glass-soft flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white/50">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="mt-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setRisk(f)}
            className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-widest ${
              risk === f ? 'bg-neon/15 text-neon' : 'glass-soft text-white/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {list.map((v, i) => (
          <VaultCard key={v.id} vault={v} delay={0.05 * i} onClick={() => onOpenVault(v)} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="mt-16 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/25">
          No vault matches
        </div>
      )}
    </div>
  )
}
