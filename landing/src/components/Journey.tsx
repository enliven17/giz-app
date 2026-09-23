import { motion } from 'framer-motion'
import { Wallet, Landmark, Shuffle, Lock, Layers, Vault, KeyRound } from 'lucide-react'
import Reveal from './Reveal'
import GlossyRail, { type RailItem } from './GlossyRail'

const MONEY_CARDS: RailItem[] = [
  {
    step: 'Step 01',
    title: 'Your wallet',
    body: 'Connect the wallet you already use. Nothing about it changes.',
    icon: Wallet,
    from: '#1f6f52',
    via: '#3ddc97',
    to: '#0c3c2c',
  },
  {
    step: 'Step 02',
    title: 'Funding account',
    chain: 'Monad',
    body: 'Your balance lands on a funding account that only you control.',
    icon: Landmark,
    from: '#2bd88a',
    via: '#8af0c4',
    to: '#0f6b8c',
  },
  {
    step: 'Step 03',
    title: 'Confidential transfer',
    chain: 'Aurora',
    body: 'Value is routed privately, unlinked from the wallet it came from.',
    icon: Shuffle,
    from: '#19c7a0',
    via: '#39a0ff',
    to: '#3f2c9c',
  },
  {
    step: 'Step 04',
    title: 'Private investing account',
    chain: 'Ethereum',
    body: 'A separate account holds your positions, encrypted end to end.',
    icon: KeyRound,
    from: '#5ce6a8',
    via: '#2f8bff',
    to: '#6d3bd6',
  },
]

type Step = {
  label: string
  chain?: string
  icon: typeof Wallet
  private?: boolean
}

const INVESTMENT: Step[] = [
  { label: 'Your deposit', icon: Wallet },
  { label: 'Encryption', chain: 'Zama', icon: Lock, private: true },
  { label: 'Combined with other deposits', icon: Layers },
  { label: 'Curated vault', chain: 'Morpho', icon: Vault },
  { label: 'Your encrypted position', icon: Lock, private: true },
]

function Track({ steps, id, title, media }: { steps: Step[]; id: string; title: string; media: string }) {
  return (
    <section id={id} className="shell scroll-mt-28 py-24 md:py-32">
      <Reveal>
        <p className="eyebrow">{id === 'money' ? 'Step one' : 'Step two'}</p>
        <h2 className="mt-5 max-w-[16ch] text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.025em]">
          {title}
        </h2>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <ol className="relative">
          <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gradient-to-b from-white/10 via-neon/25 to-white/10" />
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.li
                key={s.label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex items-center gap-5 py-4"
              >
                <span
                  className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${
                    s.private
                      ? 'border-neon/25 bg-[#0c1712] text-neon'
                      : 'border-white/10 bg-ink-card text-white/70'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[17px] font-medium">{s.label}</span>
                  {s.chain && (
                    <span className="mt-1 block text-[13px] font-medium text-neon">{s.chain}</span>
                  )}
                </span>
              </motion.li>
            )
          })}
        </ol>

        <Reveal delay={0.1}>
          <div className="card relative aspect-[4/3] overflow-hidden">
            <div className="flex h-full w-full items-center justify-center">
              {/* section clip goes here */}
              <span className="eyebrow">{media}</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

export function MoneyJourney() {
  return (
    <section id="money" className="scroll-mt-28 overflow-hidden py-24 md:py-32">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Step one</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            Your money’s journey
          </h2>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-white/45">
            From the wallet you already use to an investing account nobody can trace back to you.
          </p>
        </Reveal>
      </div>

      <Reveal delay={0.1} y={40}>
        <GlossyRail items={MONEY_CARDS} />
      </Reveal>
    </section>
  )
}

export function InvestmentJourney() {
  return (
    <Track
      id="investment"
      title="Your investment’s journey"
      steps={INVESTMENT}
      media="Encryption animation"
    />
  )
}
