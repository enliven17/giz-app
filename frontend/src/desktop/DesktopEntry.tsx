import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Fingerprint, Wallet, ShieldCheck, Check, ChevronLeft } from 'lucide-react'
import GradientWaves from '../components/GradientWaves'
import GlitchText from '../components/GlitchText'
import BubbleUpButton from '../components/BubbleUpButton'
import Scramble from '../components/Scramble'
import ParticleDotOrb from '../components/ParticleDotOrb'

const WALLETS = ['MetaMask', 'Rainbow', 'Ledger', 'WalletConnect']

export default function DesktopEntry({ onDone }: { onDone: () => void }) {
  const [view, setView] = useState<'hero' | 'auth'>('hero')
  const [mode, setMode] = useState<'idle' | 'passkey' | 'connect'>('idle')
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
          <div className="glass flex h-10 w-10 items-center justify-center rounded-2xl font-mono text-[15px] font-bold text-neon">
            N
          </div>
          <span className="text-[17px] font-medium tracking-tight">Nexum</span>
        </div>

        <div className="relative max-w-[620px]">
          <h1 className="text-[68px] font-semibold leading-[0.98] tracking-tighter">
            <motion.span
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="block"
            >
              <GlitchText className="text-white">Private</GlitchText>{' '}
              <GlitchText className="text-neon">capital</GlitchText>
            </motion.span>
            <span className="block text-white/55">
              {['without', 'the gate'].map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ delay: 0.85 + i * 0.3, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="mr-[0.25em] inline-block"
                >
                  {word}
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
            Curated private vaults, verified managers, settlement in minutes. Your keys stay on your
            device.
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
                <h2 className="text-[28px] font-medium tracking-tight">Enter Nexum</h2>
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
                  onClick={() => setView('auth')}
                  className="mt-5 w-full text-center font-mono text-xs uppercase tracking-[0.3em] text-white/35"
                >
                  I have access
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

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMode('passkey')}
                    className="glass flex aspect-square flex-col justify-between rounded-3xl p-5 text-left"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10 text-neon">
                      <Fingerprint size={24} strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="block text-[16px] font-medium leading-tight">
                        Create passkey wallet
                      </span>
                      <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-neon/60">
                        Touch ID
                      </span>
                    </span>
                  </button>

                  <button
                    onClick={() => setMode('connect')}
                    className="glass-soft flex aspect-square flex-col justify-between rounded-3xl p-5 text-left"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
                      <Wallet size={22} strokeWidth={1.6} />
                    </span>
                    <span>
                      <span className="block text-[16px] font-medium leading-tight text-white/85">
                        Connect wallet
                      </span>
                      <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-white/35">
                        External signer
                      </span>
                    </span>
                  </button>
                </div>

                <AnimatePresence>
                  {mode === 'connect' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 space-y-2">
                        {WALLETS.map((w, i) => (
                          <motion.button
                            key={w}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            onClick={onDone}
                            className="glass-soft flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left"
                          >
                            <span className="text-[15px] text-white/85">{w}</span>
                            <span className="font-mono text-[10px] uppercase tracking-widest text-neon/60">
                              connect
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-8 flex items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-white/25">
                  <ShieldCheck size={13} /> non custodial
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

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
              distance={11}
              spread={9}
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
