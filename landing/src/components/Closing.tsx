import { ArrowUpRight } from 'lucide-react'
import AsciiField from './AsciiField'
import Reveal from './Reveal'

export default function Closing() {
  return (
    <section className="relative overflow-hidden py-32 md:py-44">
      <div className="pointer-events-none absolute inset-0">
        <AsciiField fontSize={16} speed={0.4} opacity={0.8} />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />
      </div>

      <div className="shell relative text-center">
        <Reveal>
          <h2 className="mx-auto max-w-[14ch] text-[clamp(38px,6vw,76px)] font-semibold leading-[0.98] tracking-[-0.03em]">
            Your DeFi investments.
            <span className="block text-neon">Now private.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <a href="#top" className="btn-neon mt-12">
            Explore the app
            <ArrowUpRight size={17} strokeWidth={2.4} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
