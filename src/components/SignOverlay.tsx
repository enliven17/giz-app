import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import Scramble from './Scramble'
import ParticleDotOrb from './ParticleDotOrb'

export type SignState = 'signing' | 'done' | 'failed'

export default function SignOverlay({
  state,
  doneLabel,
  detail,
  onCancel,
}: {
  state: SignState
  doneLabel: string
  detail?: string
  onCancel?: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 backdrop-blur-xl"
    >
      <div className="relative flex h-48 w-48 items-center justify-center">
        <ParticleDotOrb className="h-48 w-48" size={192} speed={1.4} burst={state !== 'signing'} />

        {state !== 'signing' && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 220, damping: 18 }}
            className="absolute"
          >
            {state === 'done' ? (
              <Check size={56} strokeWidth={2} className="text-neon" />
            ) : (
              <X size={56} strokeWidth={2} className="text-rose-400" />
            )}
          </motion.span>
        )}
      </div>

      <div
        className={`mt-6 font-mono text-[11px] uppercase tracking-[0.3em] ${
          state === 'failed' ? 'text-rose-400/80' : 'text-neon/80'
        }`}
      >
        {state === 'signing' && <Scramble text="signing with passkey" />}
        {state === 'done' && <Scramble text={doneLabel} />}
        {state === 'failed' && <Scramble text="signature rejected" />}
      </div>

      {state === 'done' && detail && (
        <div className="mt-3 font-mono text-[10px] text-white/25">{detail}</div>
      )}

      {state === 'signing' && onCancel && (
        <button
          onClick={onCancel}
          className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-white/35"
        >
          cancel
        </button>
      )}
    </motion.div>
  )
}
