import { motion } from 'framer-motion'
import { ArrowLeftRight } from 'lucide-react'
import Scramble from './Scramble'

export default function ComingSoon() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 pb-28">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="glass flex h-20 w-20 items-center justify-center rounded-[28px] text-neon"
      >
        <ArrowLeftRight size={30} strokeWidth={1.6} />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 text-[26px] font-medium tracking-tight"
      >
        Swap is coming soon
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-3 max-w-[300px] text-center text-[14px] leading-relaxed text-white/40"
      >
        In-app swaps are in private testing. Deposits and vault positions work as usual.
      </motion.p>

      <div className="mt-8 rounded-full bg-neon/10 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-neon">
        <Scramble text="soon" />
      </div>
    </div>
  )
}
