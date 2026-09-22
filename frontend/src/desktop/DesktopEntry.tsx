import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Fingerprint, ShieldCheck, Check, ChevronLeft } from 'lucide-react'
import GradientWaves from '../components/GradientWaves'
import GlitchText from '../components/GlitchText'
import BubbleUpButton from '../components/BubbleUpButton'
import Scramble from '../components/Scramble'
import ParticleDotOrb from '../components/ParticleDotOrb'
import RequestAccess from '../components/RequestAccess'

export default function DesktopEntry({ onDone }: { onDone: () => void }) {
  const [view, setView] = useState<'hero' | 'auth'>('hero')
  const [mode, setMode] = useState<'idle' | 'passkey'>('idle')
  const [requesting, setRequesting] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (mode !== 'passkey') return
    setStep(0)
    const t1 = setTimeout(() => setStep(1), 1400)
    const t2 = setTimeout(() => setStep(2), 2600)
    const t3 = setTimeout(onDone, 3800)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [mode, onDone])

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-ink">
      {/* sol: dalga ve slogan */}
      <div className="relative hidden min-w-0 flex-1 flex-col justify-between p-14 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <GradientWaves
            horizonColor="#070d0a"
            waveColor="#2aa471"
            crestColor="#5fe0a6"
            speed={0.22}
            amplitude={1.9}
            waveScale={0.45}
            waveRatio={0.9}
            swell={26}
            turbulence={11}
            tilt={1.11}
            zoom={1}
            height={5.5}
            fogDepth={18}
            detail="high"
            brightness={1}
            opacity={1}
            mouseInteraction={false}
            grain
            grainIntensity={0.03}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-ink/20 to-ink" />
        </div>

        <div className="relative flex items-center gap-3">
          <img src="/gizulogo.svg" alt="" className="h-8 w-auto" />
          <span className="text-[18px] font-medium tracking-tight">Gizu</span>
        </div>

        <div className="relative max-w-[620px]">
          <h1 className="text-[68px] font-semibold leading-[0.98] tracking-tighter">
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="block"
            >
              <GlitchText className="text-neon">DeFi</GlitchText>{' '}
              <span className="text-white/55">in</span>
            </motion.span>
            <span className="block">
              {[
                { word: 'Stealth', accent: true },
                { word: 'Mode', accent: false },
              ].map(({ word, accent }, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.85 + i * 0.3, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="mr-[0.25em] inline-block"
                >
                  {accent ? (
                    <GlitchText className="text-neon">{word}</GlitchText>
                  ) : (
                    <span className="text-white/55">{word}</span>
                  )}
                </motion.span>
              ))}
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-7 max-w-[440px] text-[16px] leading-relaxed text-white/45"
          >
            Curated confidential vaults, settlement in minutes. Your keys stay on your device.
          </motion.p>
        </div>

        <div className="relative font-mono text-[10px] uppercase tracking-[0.35em] text-white/25">
          <Scramble text="invite only" />
        </div>
      </div>

      {/* sag: giris paneli */}
      <div className="relative flex w-full shrink-0 items-center justify-center px-10 lg:w-[520px] lg:border-l lg:border-white/[0.06]">
        <div className="w-full max-w-[380px]">
          <AnimatePresence mode="wait">
            {view === 'hero' ? (
              <motion.div
                key="hero"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <h2 className="text-[28px] font-medium tracking-tight">Enter Gizu</h2>
                <p className="mt-3 text-[14px] leading-relaxed text-white/45">
                  Access is passkey based. No seed phrase, no extension required.
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.7 }}
                  className="mt-8"
                >
                  <BubbleUpButton onClick={() => setView('auth')}>
                    Get started
                    <ArrowRight size={18} strokeWidth={2.6} />
                  </BubbleUpButton>
                </motion.div>
                <button
                  onClick={() => setRequesting(true)}
                  className="mt-5 w-full text-center font-mono text-xs uppercase tracking-[0.3em] text-white/35"
                >
                  Request access
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
              >
                <button
                  onClick={() => setView('hero')}
                  className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60"
                >
                  <ChevronLeft size={18} />
                </button>

                <h2 className="mt-8 text-[28px] font-medium tracking-tight">
                  <GlitchText className="text-white">Create</GlitchText>{' '}
                  <span className="text-neon">access</span>
                </h2>
                <p className="mt-3 text-[14px] leading-relaxed text-white/45">
                  A passkey wallet lives in your device secure enclave.
                </p>

                <button
                  onClick={() => setMode('passkey')}
                  className="glass mt-8 flex w-full items-center gap-5 rounded-3xl p-6 text-left"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-neon/10 text-neon">
                    <Fingerprint size={26} strokeWidth={1.6} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[17px] font-medium leading-tight">
                      Create passkey wallet
                    </span>
                    <span className="mt-1.5 block font-mono text-[10px] uppercase tracking-widest text-neon/60">
                      Touch ID or Windows Hello
                    </span>
                  </span>
                </button>

                <div className="mt-8 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
                  <ShieldCheck size={13} /> non custodial
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {requesting && <RequestAccess variant="modal" onClose={() => setRequesting(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {mode === 'passkey' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/95 backdrop-blur-xl"
          >
            <ParticleDotOrb
              className="pointer-events-none absolute inset-0 h-full w-full"
              speed={1.4}
              distance={6.5}
              spread={14}
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
              <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon/80">
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
