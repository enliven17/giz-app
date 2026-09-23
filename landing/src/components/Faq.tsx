import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import Reveal from './Reveal'

const ITEMS = [
  {
    q: 'How do you make my investments private?',
    a: 'Your funding account sits on Monad. Aurora confidentially routes funds to a separate Ethereum investing account. Zama encrypts your balances and investment amounts. Deposits enter Morpho vaults in batches, and you receive encrypted shares.',
  },
  {
    q: 'What can other people see?',
    a: 'Some activity remains public: an account joining a vault, batch totals, and amounts entering or leaving encryption. Small batches and funding patterns can make individual amounts easier to infer.',
  },
  {
    q: 'Who controls my money?',
    a: 'Your passkey controls your account. You authorize investments and withdrawals.',
  },
  {
    q: 'Where do returns come from?',
    a: 'The underlying curated Morpho strategies. Returns vary and are not guaranteed.',
  },
  {
    q: 'How long does it take?',
    a: 'Deposits and private withdrawals settle in batches. The app shows the expected timing for your chosen investment.',
  },
  {
    q: 'Can I lose money?',
    a: 'Yes. Encryption protects financial information; it does not remove investment risk.',
  },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="faq" className="shell scroll-mt-28 py-24 md:py-32">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <p className="eyebrow">Answers</p>
          <h2 className="mt-5 text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.025em]">
            FAQ
          </h2>
        </Reveal>

        <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={i * 0.04}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-start gap-6 py-7 text-left"
                >
                  <span className="flex-1 text-[19px] font-medium leading-snug">{item.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                      isOpen ? 'border-neon/40 text-neon' : 'border-white/10 text-white/40'
                    }`}
                  >
                    <Plus size={16} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-8 pr-14 text-[16px] leading-relaxed text-white/45">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
