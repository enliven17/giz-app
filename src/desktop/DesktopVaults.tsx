import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal } from 'lucide-react'
import VaultCard from '../components/VaultCard'
import { vaults, type Vault } from '../data'

const FILTERS = ['All', 'Low', 'Medium', 'High'] as const

export default function DesktopVaults({ onOpenVault }: { onOpenVault: (v: Vault) => void }) {
  const [query, setQuery] = useState('')
  const [risk, setRisk] = useState<(typeof FILTERS)[number]>('All')

  const list = vaults.filter(
    (v) =>
      (risk === 'All' || v.risk === risk) &&
      (v.name + v.ticker + v.strategy).toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <div className="mx-auto max-w-[1520px] px-14 py-10">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-[34px] font-medium tracking-tight">Private vaults</h1>
        <p className="mt-2 text-[14px] text-white/40">
          Curated strategies from verified managers, settlement on Monad.
        </p>
      </motion.div>

      <div className="mt-8 flex items-center gap-3">
        <div className="glass-soft flex flex-1 items-center gap-3 rounded-2xl px-5 py-3.5">
          <Search size={16} className="shrink-0 text-white/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search strategy or manager"
            className="h-7 w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-white/25"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setRisk(f)}
              className={`rounded-2xl px-5 py-3.5 font-mono text-[11px] uppercase tracking-widest ${
                risk === f ? 'bg-neon/10 text-neon' : 'glass-soft text-white/40'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="glass-soft flex h-[50px] w-[50px] items-center justify-center rounded-2xl text-white/45">
          <SlidersHorizontal size={16} />
        </button>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-6 xl:grid-cols-5">
        {list.map((v, i) => (
          <VaultCard key={v.id} vault={v} delay={0.04 * i} onClick={() => onOpenVault(v)} />
        ))}
      </div>

      {list.length === 0 && (
        <div className="mt-20 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/25">
          No vault matches
        </div>
      )}
    </div>
  )
}
