import Reveal from './Reveal'
import Timeline, { type TimelineStep } from './Timeline'

const STEPS: TimelineStep[] = [
  {
    title: 'Your wallet',
    body: 'Connect the wallet you already use. Nothing about it changes and nothing leaves it yet.',
    visual: 'wallet',
  },
  {
    title: 'Funding account',
    chain: 'Monad',
    body: 'Your balance lands on a funding account that only your passkey controls.',
    visual: 'funding',
  },
  {
    title: 'Confidential transfer',
    chain: 'Aurora',
    body: 'Value is routed privately, unlinked from the wallet it came from.',
    visual: 'route',
  },
  {
    title: 'Private investing account',
    chain: 'Ethereum',
    body: 'A separate account holds your positions, derived from the same passkey.',
    visual: 'keys',
  },
  {
    title: 'Your deposit',
    body: 'You choose an amount. Nothing else about you is attached to it.',
    visual: 'deposit',
  },
  {
    title: 'Encryption',
    chain: 'Zama',
    body: 'The amount is encrypted before it touches a vault, and stays encrypted on chain.',
    visual: 'encrypt',
  },
  {
    title: 'Combined with other deposits',
    body: 'Your deposit joins a batch, so no single entry traces back to one account.',
    visual: 'batch',
  },
  {
    title: 'Curated vault',
    chain: 'Morpho',
    body: 'The batch enters a curated strategy with a named curator and a published mandate.',
    visual: 'vault',
  },
  {
    title: 'Your encrypted position',
    body: 'You hold encrypted shares. Only you can read the balance, the yield and the exit.',
    visual: 'shield',
  },
]

export default function HowItWorks() {
  return (
    <section id="money" className="shell scroll-mt-28 py-24 md:py-32">
      <Reveal>
        <p className="eyebrow">How it works</p>
        <h2 className="mt-5 max-w-[18ch] text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.025em]">
          From your wallet to an encrypted position
        </h2>
        <p className="mt-6 max-w-[52ch] text-[17px] leading-relaxed text-white/45">
          One passkey, four accounts and a batch of encrypted deposits. Follow the path down.
        </p>
      </Reveal>

      <div className="mt-16">
        <Timeline steps={STEPS} />
      </div>
    </section>
  )
}
