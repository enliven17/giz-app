import { motion } from 'framer-motion'

export type VisualKind = 'wallet' | 'route' | 'keys' | 'deposit' | 'encrypt' | 'batch' | 'vault' | 'shield'

const EASE = [0.22, 1, 0.36, 1] as const

/** Shared frame so every step visual has the same optical weight. */
function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-44 overflow-hidden rounded-xl border border-white/[0.06] bg-[#080c0a] md:h-52">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(49,196,126,0.12),transparent_70%)]" />
      {children}
    </div>
  )
}

function Wallet({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex items-end justify-center pb-10">
        <div className="relative h-20 w-32 rounded-xl border border-white/12 bg-white/[0.04]">
          <div className="absolute inset-x-3 top-3 h-px bg-white/10" />
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute left-1/2 top-2 h-7 w-7 -translate-x-1/2 rounded-full border border-neon/40 bg-neon/15"
              animate={on ? { y: [-4, -46, -46], opacity: [0, 1, 0] } : { opacity: 0 }}
              transition={{ duration: 1.8, delay: i * 0.45, repeat: on ? Infinity : 0, ease: EASE }}
            />
          ))}
        </div>
      </div>
    </Frame>
  )
}

function Route({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center px-8">
        <div className="relative h-px w-full bg-white/10">
          <div className="absolute left-1/2 top-1/2 h-12 w-24 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-ink/80 backdrop-blur-sm" />
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-neon"
              animate={on ? { left: ['0%', '100%'], opacity: [0, 1, 1, 0] } : { opacity: 0 }}
              transition={{ duration: 2.4, delay: i * 0.6, repeat: on ? Infinity : 0, ease: 'linear' }}
            />
          ))}
        </div>
      </div>
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
        private
      </span>
    </Frame>
  )
}

function Keys({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.span
          className="rounded-xl border border-neon/30 bg-neon/10 px-4 py-2 font-mono text-[13px] font-semibold text-neon"
          animate={on ? { scale: [1, 1.06, 1] } : {}}
          transition={{ duration: 1.6, repeat: on ? Infinity : 0, ease: EASE }}
        >
          M
        </motion.span>
        <div className="flex gap-2.5">
          {['P1', 'P2', 'P3', 'P4'].map((k, i) => (
            <motion.span
              key={k}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[11px] text-white/60"
              animate={on ? { y: [6, 0], opacity: [0, 1] } : { opacity: 0.4 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.12, repeat: on ? Infinity : 0, repeatDelay: 1.8 }}
            >
              {k}
            </motion.span>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function Deposit({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="rounded-xl border border-white/10 bg-white/[0.04] px-7 py-5 font-mono text-[28px] tracking-tight"
          animate={on ? { opacity: [0.5, 1], y: [8, 0] } : {}}
          transition={{ duration: 0.6, repeat: on ? Infinity : 0, repeatDelay: 1.6, ease: EASE }}
        >
          $25,000
          <motion.span
            className="ml-0.5 text-neon"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }}
          >
            |
          </motion.span>
        </motion.div>
      </div>
    </Frame>
  )
}

const CIPHER = '8F2A9C41D7B3E5'

function Encrypt({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
        <span className="font-mono text-[22px] text-white/30 line-through decoration-white/20">
          $25,000
        </span>
        <div className="flex gap-1">
          {CIPHER.split('').map((c, i) => (
            <motion.span
              key={i}
              className="font-mono text-[18px] text-neon"
              animate={on ? { opacity: [0, 1], filter: ['blur(6px)', 'blur(0px)'] } : { opacity: 0.35 }}
              transition={{ duration: 0.4, delay: i * 0.06, repeat: on ? Infinity : 0, repeatDelay: 2 }}
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    </Frame>
  )
}

function Batch({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center gap-6">
        <div className="flex flex-col gap-2">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="block h-3 w-10 rounded-full bg-white/15"
              animate={on ? { x: [0, 26], opacity: [1, 0] } : {}}
              transition={{ duration: 1.2, delay: i * 0.18, repeat: on ? Infinity : 0, ease: EASE }}
            />
          ))}
        </div>
        <motion.div
          className="h-24 w-24 rounded-2xl border border-neon/30 bg-neon/10"
          animate={on ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 1.2, repeat: on ? Infinity : 0, ease: EASE }}
        />
      </div>
    </Frame>
  )
}

/** Vault door that unlocks, adapted from the forge ui vault lock. */
function VaultDoor({ on }: { on: boolean }) {
  return (
    <Frame>
      <motion.div
        initial={false}
        animate={on ? 'open' : 'close'}
        className="absolute inset-0 flex flex-col items-center justify-center"
      >
        <motion.div
          variants={{ open: { y: -10 }, close: { y: 0 } }}
          transition={{ duration: 0.4, ease: EASE }}
          className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[repeating-radial-gradient(rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.02)_5px)]"
        >
          <motion.span
            variants={{
              open: { x: '0%', opacity: 0.6 },
              close: { x: '-160%', opacity: 0 },
            }}
            transition={{ duration: 0.7, delay: on ? 0.5 : 0, ease: EASE }}
            className="absolute inset-y-0 left-1/2 w-10 -translate-x-1/2 rotate-45 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]"
          />
          <motion.span
            variants={{ open: { rotate: 90 }, close: { rotate: 0 } }}
            transition={{ duration: 0.6, delay: on ? 0.35 : 0, ease: EASE }}
            className="relative block h-9 w-1.5 rounded-full bg-neon"
          />
          <motion.span
            variants={{ open: { rotate: 90 }, close: { rotate: 0 } }}
            transition={{ duration: 0.6, delay: on ? 0.35 : 0, ease: EASE }}
            className="absolute block h-1.5 w-9 rounded-full bg-neon/50"
          />
        </motion.div>

        <motion.div
          variants={{ open: { y: -6 }, close: { y: 0 } }}
          transition={{ duration: 0.4, ease: EASE }}
          className="mt-6 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2"
        >
          {'••••••••'.split('').map((c, i) => (
            <motion.span
              key={i}
              className="text-[13px] text-neon"
              variants={{
                open: { opacity: 1, filter: 'blur(0px)' },
                close: { opacity: 0.25, filter: 'blur(3px)' },
              }}
              transition={{ duration: 0.4, delay: on ? i * 0.07 : 0 }}
            >
              {c}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </Frame>
  )
}

function Shield({ on }: { on: boolean }) {
  return (
    <Frame>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-neon/25 bg-neon/10"
          animate={on ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 2, repeat: on ? Infinity : 0, ease: EASE }}
        >
          <motion.span
            className="absolute inset-0 rounded-3xl border border-neon/40"
            animate={on ? { scale: [1, 1.35], opacity: [0.6, 0] } : { opacity: 0 }}
            transition={{ duration: 2, repeat: on ? Infinity : 0, ease: 'easeOut' }}
          />
          <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-neon">yours</span>
        </motion.div>
      </div>
    </Frame>
  )
}

const MAP = {
  wallet: Wallet,
  route: Route,
  keys: Keys,
  deposit: Deposit,
  encrypt: Encrypt,
  batch: Batch,
  vault: VaultDoor,
  shield: Shield,
}

export default function StepVisual({ kind, on }: { kind: VisualKind; on: boolean }) {
  const Comp = MAP[kind]
  return <Comp on={on} />
}
