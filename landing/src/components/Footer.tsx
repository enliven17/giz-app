import { ArrowUpRight } from 'lucide-react'
import AsciiField from './AsciiField'
import AsciiWhales from './AsciiWhales'
import Reveal from './Reveal'

const COLUMNS = [
  {
    title: 'Product',
    links: ['How it works', 'Strategies', 'Security', 'Roadmap'],
  },
  {
    title: 'Company',
    links: ['About', 'Careers', 'Brand kit', 'Press'],
  },
  {
    title: 'Resources',
    links: ['Docs', 'Diagrams', 'Status', 'Support'],
  },
]

const SOCIAL = ['X', 'Farcaster', 'GitHub', 'Mirror']

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07]">
      {/* the call to action opens the footer, on the same background */}
      <div className="relative py-32 md:py-40">
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
      </div>

      <div className="shell relative pb-20">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/gizulogo.svg" alt="" className="h-6 w-auto" />
              <span className="text-[17px] font-medium tracking-tight">Gizu</span>
            </div>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-white/45">
              Confidential investing for everyone. Your balances, positions and returns stay
              encrypted end to end.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex max-w-[380px] items-center gap-2 rounded-full border border-white/10 p-1.5 pl-5"
            >
              <input
                type="email"
                placeholder="Email address"
                className="h-10 w-full min-w-0 bg-transparent text-[14px] outline-none placeholder:text-white/30"
              />
              <button className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-neon px-5 text-[13px] font-semibold text-ink">
                Join
                <ArrowUpRight size={15} strokeWidth={2.6} />
              </button>
            </form>
          </div>

          <div className="grid gap-10 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <nav key={col.title}>
                <div className="eyebrow">{col.title}</div>
                <ul className="mt-5 space-y-3.5">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="text-[14px] text-white/50 hover:text-white">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <nav>
              <div className="eyebrow">Social</div>
              <ul className="mt-5 space-y-3.5">
                {SOCIAL.map((s) => (
                  <li key={s}>
                    <a
                      href="#top"
                      className="group inline-flex items-center gap-1.5 text-[14px] text-white/50 hover:text-white"
                    >
                      {s}
                      <ArrowUpRight
                        size={13}
                        className="text-white/20 transition-colors group-hover:text-neon"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[70ch] text-[12.5px] leading-relaxed text-white/30">
            Encryption protects financial information, it does not remove investment risk. Yields
            are indicative and not guaranteed.
          </p>
          <div className="flex shrink-0 items-center gap-7">
            {['Privacy policy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#top" className="text-[12.5px] text-white/35 hover:text-white/70">
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* a school of ascii whales drifts along the bottom */}
      <div className="relative h-[180px] md:h-[220px]">
        <AsciiWhales />
      </div>
    </footer>
  )
}
