import { ArrowUpRight } from 'lucide-react'
import Reveal from './Reveal'
import Auralis from './Auralis'

const STRATEGIES = [
  {
    asset: 'USDC',
    curator: 'Steakhouse',
    yield: '8.4%',
    note: 'Stable, conservative allocation',
    colors: ['#1f6f52', '#3ddc97', '#0c3c2c'],
  },
  {
    asset: 'USDC',
    curator: 'Gauntlet',
    yield: '11.2%',
    note: 'Balanced lending markets',
    colors: ['#2bd88a', '#8af0c4', '#0f6b8c'],
  },
  {
    asset: 'ETH',
    curator: 'Block Analitica',
    yield: '6.1%',
    note: 'Blue chip collateral only',
    colors: ['#19c7a0', '#39a0ff', '#123a6b'],
  },
  {
    asset: 'USDT',
    curator: 'Re7 Labs',
    yield: '13.7%',
    note: 'Higher yield, higher risk band',
    colors: ['#5ce6a8', '#2f8bff', '#4a2ba0'],
  },
]

export default function Strategies() {
  return (
    <section id="strategies" className="shell scroll-mt-28 py-24 md:py-32">
      <Reveal>
        <p className="eyebrow">Choose</p>
        <h2 className="mt-5 max-w-[16ch] text-[clamp(32px,4.4vw,52px)] font-semibold leading-[1.02] tracking-[-0.025em]">
          Choose where your money works
        </h2>
        <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-white/45">
          Curated vaults with a named curator and an indicative yield. Your amount stays encrypted.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STRATEGIES.map((s, i) => (
          <Reveal key={s.curator} delay={i * 0.07}>
            <article className="card group flex h-full flex-col p-7 transition-colors hover:border-neon/25">
              <div className="flex items-start justify-between">
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-[12px] font-medium text-white/70">
                  {s.asset}
                </span>
                <ArrowUpRight
                  size={18}
                  className="text-white/25 transition-colors group-hover:text-neon"
                />
              </div>

              <div className="relative mt-6 h-28 overflow-hidden rounded-xl border border-white/[0.06]">
                <Auralis colors={s.colors} speed={0.24} grain={0.35} />
              </div>

              <div className="mt-6">
                <div className="text-[13px] text-white/40">{s.curator}</div>
                <div className="mt-2 text-[30px] font-semibold tracking-tight text-neon">
                  {s.yield}
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-white/40">{s.note}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1}>
        <p className="mt-8 text-[13px] text-white/30">
          Indicative yields, not guaranteed. Returns come from the underlying curated strategies.
        </p>
      </Reveal>
    </section>
  )
}
