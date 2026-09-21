import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Fingerprint, Wallet, ChevronLeft, ShieldCheck, Check } from 'lucide-react'
import GlitchText from './GlitchText'
import Scramble from './Scramble'

const WALLETS = ['MetaMask', 'Rainbow', 'Ledger', 'WalletConnect']

export default function Auth({ onBack, onDone }: { onBack: () => void; onDone: () => void }) {
  const [mode, setMode] = useState<'idle' | 'passkey' | 'connect'>('idle')
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
        <h2 className="text-[34px] font-semibold leading-tight tracking-tight">
          <GlitchText className="text-white">Create</GlitchText>{' '}
          <span className="text-neon">access</span>
        </h2>
        <p className="mt-3 max-w-[290px] text-[15px] leading-relaxed text-white/45">
          A passkey wallet lives in your device secure enclave. No seed phrase, no extension.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setMode('passkey')}
          className="glass relative flex aspect-square flex-col justify-between overflow-hidden rounded-3xl p-5 text-left"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-neon/10 text-neon">
            <Fingerprint size={24} strokeWidth={1.6} />
          </span>
          <span className="relative">
            <span className="block text-[16px] font-medium leading-tight">Create passkey wallet</span>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-neon/60">
              Face ID
            </span>
          </span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setMode('connect')}
          className="glass-soft flex aspect-square flex-col justify-between rounded-3xl p-5 text-left"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-white/70">
            <Wallet size={22} strokeWidth={1.6} />
          </span>
          <span>
            <span className="block text-[16px] font-medium leading-tight text-white/85">Connect wallet</span>
            <span className="mt-2 block font-mono text-[10px] uppercase tracking-widest text-white/35">
              External signer
            </span>
          </span>
        </motion.button>
      </div>

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
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-ink/85 px-8 backdrop-blur-xl"
          >
            <div className="relative flex h-40 w-40 items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border border-neon/40"
              />
              <div className="glass flex h-28 w-28 items-center justify-center rounded-[36px]">
                {step < 2 ? (
                  <Fingerprint size={52} strokeWidth={1.2} className="text-neon" />
                ) : (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check size={52} strokeWidth={2} className="text-neon" />
                  </motion.span>
                )}
              </div>
              {step < 2 && (
                <motion.div
                  animate={{ y: [-52, 52, -52] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute h-[2px] w-28 bg-neon/60"
                />
              )}
            </div>

            <div className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-neon/80">
              {step === 0 && <Scramble text="scanning biometrics" />}
              {step === 1 && <Scramble text="deriving keypair" />}
              {step === 2 && <Scramble text="wallet ready" />}
            </div>
            <div className="mt-3 font-mono text-[10px] text-white/25">0xA4f2 . . . 91c7</div>
          </motion.div>
        )}

        {mode === 'connect' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMode('idle')}
            className="absolute inset-0 z-40 flex items-end bg-ink/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 320 }}
              animate={{ y: 0 }}
              exit={{ y: 320 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full rounded-t-[36px] p-6 pb-10"
            >
              <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-white/20" />
              <div className="mb-4 font-mono text-[11px] uppercase tracking-[0.3em] text-white/40">
                Select signer
              </div>
              <div className="space-y-2">
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
