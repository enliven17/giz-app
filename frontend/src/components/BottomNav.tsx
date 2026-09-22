import { Home, PieChart, ArrowLeftRight, Settings } from 'lucide-react'
import { motion } from 'framer-motion'

const items = [
  { id: 'home', icon: Home },
  { id: 'vaults', icon: PieChart },
  { id: 'swap', icon: ArrowLeftRight },
  { id: 'settings', icon: Settings },
] as const

export default function BottomNav({
  active,
  onChange,
}: {
  active: string
  onChange: (id: string) => void
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center pb-5">
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="glass pointer-events-auto flex items-center gap-1 rounded-full px-2 py-2"
      >
        {items.map(({ id, icon: Icon }) => {
          const on = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="relative flex h-12 w-14 items-center justify-center rounded-full"
            >
              {on && (
                <motion.span
                  layoutId="navPill"
                  className="absolute inset-0 rounded-full neon-btn"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={19}
                strokeWidth={on ? 2.4 : 1.8}
                className={`relative ${on ? 'text-ink' : 'text-white/45'}`}
              />
            </button>
          )
        })}
      </motion.nav>
    </div>
  )
}
