import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Fingerprint, ChevronLeft, ShieldCheck, Check } from 'lucide-react'
import GlitchText from './GlitchText'
import Scramble from './Scramble'
import ParticleDotOrb from './ParticleDotOrb'

export default function Auth({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [mode, setMode] = useState<'idle' | 'passkey'>('idle')
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (mode !== 'passkey') return
    setStep(0)
    const t1 = setTimeout(() => setStep(1), 1400)
    const t2 = setTimeout(() => setStep(2), 2600)
    const t3 = setTimeout(onDone, 3600)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [mode, onDone])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-6 pb-10 pt-14">
      <button
        onClick={onBack}
        className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="mt-10">
        <img src="/gizulogo.svg" alt="" className="mb-6 h-8 w-auto" />
        <h2 className="text-[34px] font-semibold leading-tight tracking-tight">
          <GlitchText className="text-white">Create</GlitchText>{' '}
          <span className="text-neon">access</span>
        </h2>
        <p className="mt-3 max-w-[290px] text-[15px] leading-relaxed text-white/45">
          A passkey wallet lives in your device secure enclave. No seed phrase, no extension.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setMode('passkey')}
        className="glass mt-10 flex w-full items-center gap-5 rounded-3xl p-6 text-left"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neon/10 text-neon">
          <Fingerprint size={26} strokeWidth={1.6} />
        </span>
        <span className="min-w-0">
          <span className="block text-[17px] font-medium leading-tight">Create passkey wallet</span>
          <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-widest text-neon/60">
            Face ID or fingerprint
          </span>
        </span>
      </motion.button>

      <div className="mt-auto flex items-center justify-center gap-2 pt-10 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
        <ShieldCheck size={13} />
        <Scramble text="non custodial" />
      </div>

      <AnimatePresence>
        {mode === 'passkey' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-ink/95 px-8 backdrop-blur-xl"
          >
            <ParticleDotOrb
              className="pointer-events-none absolute inset-0 h-full w-full"
              speed={1.4}
              distance={9.5}
              spread={9}
              dotScale={2.8}
              burst={step === 2}
            />
            {step === 2 && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.55, type: 'spring', stiffness: 220, damping: 18 }}
                >
                  <Check size={56} strokeWidth={2} className="text-neon" />
                </motion.span>
              </div>
            )}

            <div className="absolute inset-x-0 bottom-24 flex flex-col items-center">
              <div className="text-center font-mono text-[11px] uppercase tracking-[0.3em] text-neon/80">
                {step === 0 && <Scramble text="scanning biometrics" />}
                {step === 1 && <Scramble text="deriving keypair" />}
                {step === 2 && <Scramble text="wallet ready" />}
              </div>
              <div className="mt-3 font-mono text-[10px] text-white/25">0xA4f2 . . . 91c7</div>
            </div>
          </motion.div>
        )}


      </AnimatePresence>
    </div>
  )
}
