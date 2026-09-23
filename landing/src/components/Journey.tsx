import { motion } from 'framer-motion'
import { Wallet, Landmark, Shuffle, Lock, Layers, Vault, KeyRound } from 'lucide-react'
import Reveal from './Reveal'

type Step = {
  label: string
  chain?: string
  icon: typeof Wallet
  private?: boolean
}

const MONEY: Step[] = [
  { label: 'Your wallet', icon: Wallet },
  { label: 'Funding account', chain: 'Monad', icon: Landmark },
  { label: 'Confidential transfer', chain: 'Aurora', icon: Shuffle, private: true },
  { label: 'Private investing account', chain: 'Ethereum', icon: KeyRound, private: true },
]

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
  return <Track id="money" title="Your money’s journey" steps={MONEY} media="Transfer animation" />
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
