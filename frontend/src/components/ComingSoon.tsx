import { motion } from 'framer-motion'
import GlitchText from './GlitchText'
import Scramble from './Scramble'

export default function ComingSoon() {
  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-8 pb-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center text-[52px] font-semibold leading-[0.95] tracking-tighter lg:text-[86px]"
      >
        <GlitchText className="text-white">Swap</GlitchText>
        <br />
        <motion.span
          initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.45, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
        >
          <GlitchText className="text-neon">coming soon</GlitchText>
        </motion.span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-7 max-w-[380px] text-center text-[15px] leading-relaxed text-white/40 lg:max-w-[460px] lg:text-[16px]"
      >
        In-app swaps are in private testing. Deposits and vault positions work as usual.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 font-mono text-[10px] uppercase tracking-[0.35em] text-white/25"
      >
        <Scramble text="in private testing" />
      </motion.div>
    </div>
  )
}
