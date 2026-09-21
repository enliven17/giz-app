import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import GlitchText from './GlitchText'
import Scramble from './Scramble'
import GradientWaves from './GradientWaves'
import BubbleUpButton from './BubbleUpButton'

export default function Onboarding({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="pointer-events-none absolute inset-0">
        <GradientWaves
          horizonColor="#070d0a"
          waveColor="#1e7a52"
          crestColor="#31c47e"
          speed={0.35}
          amplitude={2.5}
          waveScale={0.6}
          waveRatio={0.9}
          swell={35}
          turbulence={20}
          tilt={1.11}
          zoom={1}
          height={5.5}
          fogDepth={15}
          detail="medium"
          brightness={0.7}
          opacity={0.75}
          mouseInteraction
          parallaxStrength={0.5}
          grain
          grainIntensity={0.05}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/40 to-ink" />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col px-6 pb-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto glass-soft rounded-full px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.35em] text-neon/80"
        >
          <Scramble text="invite only" />
        </motion.div>

        <div className="mt-auto">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-[60px] font-semibold leading-[0.96] tracking-tighter"
          >
            <GlitchText className="text-white">Private</GlitchText>
            <br />
            <GlitchText className="text-neon">capital</GlitchText>
            <br />
            <span className="text-white/55">without</span>
            <br />
            <span className="text-white/55">the gate</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 max-w-[310px] text-[15px] leading-relaxed text-white/45"
          >
            Curated private vaults, verified managers, settlement in minutes. Your keys stay on your device.
          </motion.p>
        </div>

        <div className="mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <BubbleUpButton onClick={onStart}>
              Get started
              <ArrowRight size={18} strokeWidth={2.6} />
            </BubbleUpButton>
          </motion.div>

          <button className="mt-5 w-full text-center font-mono text-xs uppercase tracking-[0.3em] text-white/35">
            I have access
          </button>
        </div>
      </div>
    </div>
  )
}
