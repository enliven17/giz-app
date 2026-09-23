import { useEffect, useRef, useState } from 'react'
import { motion, type Variants } from 'framer-motion'

export type VisualKind =
  | 'wallet'
  | 'funding'
  | 'route'
  | 'keys'
  | 'deposit'
  | 'encrypt'
  | 'batch'
  | 'vault'
  | 'shield'

const EASE = [0.65, 0, 0.35, 1] as const

const SCRAMBLE = [
  '6*7A0^!HIETD@6XS749%2$4L4RO$SH*8W#6OPLLF%WSKVI^PTT1PJUOS60EQL$*K53*Y#AK5GDM6XIWX79XR^DQOMEJF$F1ZNL*L0Z&#LJ4B$E97Q76VF0U#HY!37J5$GKCI0RMK$2P1F9JJYGVR@IAHYPZALXQMJ!519!GZTQSA$#BEXUYPSZ302Z*&DDWW!NI61S#!MAHJ0Y&3J8*EBIMM$#X%46NJ0*9P3L@UW5A8NCZX&98CQ75NL9XEH11NBB^E&LQ1YPZALMJ3DSUXBS9*DADQ7ND0SCI#HY!37J5$GK',
  'Y4#!I*ZO1QCFU07QJFDVW#6$17$WW^#7MR5Q50I^2FFKJQW1&1%94ABU&$TX$RRTXT3P!4JPK3^A12&DQ15S08%Q^X*GUE761@6S5DA*HACX9@AS3B04YQ5*VD1*$XX9ECF4B9%O^^LGNDKT%FT2Y2SDC0M!GCNSPVWVNBAWEPT3Q2XK6M877&Q838ZWKGW8*SVG241H51EB2SU1QZL56OR44Q$95ZEDFOVS#AL@C%FEYKZEPI*F&EQUT^65O68J3Q9O^YACNTNVMAK4S#MRM!V@GOKPV0HO2IN$3501P^Y9K',
  '4HM5$8&ZBKCL0G$2ZE7OAZHBUDZXDJW81WD7YDH7##HO7VM84J&@&PV^7YACYLRBWI2HDUW9@!I#H@3%HN%AD@!ED0FOPL#4N8X%LO31#T9N1!HWCAP9DY!KQ5AEMFLF6#DK#4AX70^HXSGH2Y1XJCALNF5XYZ0L28%THU@X&83MKC4R%LZ1J8B86NW1Z$Q8^6J6FP&%PXQ7#LUHV21UM^3K%LYDYO2KWZT!3&WB51UJXJ2Y8!$D7G54RUZEI78^G&1MD%8*5NGKU201%G@FY@CE8$4BG!YEBNCR0YLP@D',
  'IZE$@GCC&9OEB%@LLRX%IJ!VILBQ$%K#XALOTXTQD1%J82QSFUS512FRQHSO@#R#MK0C0@686S$XS1EPS0YLQ!%TL374LL#Y@DL4&1G85XA6S59K99DWZ8@LEVWAK94Y99VDSXS^V$71J092U2V#AB*@*45AZXIGVM^08V1&F1#!ST5PP7WBR*RE1SZ%UCJNMHP#^DJ0O1JAZIGPB7%V7DBQ^CKZ^6B^Q510BMK8Y3TA&@HZAHYCMG1J9Y1FOQ2TS3M$A@R%5^X$71W@N@%&W100&7768Q3!8V2F6K8#R',
]

/** Character stream that keeps reshuffling behind a visual. */
function Scrambler({ on }: { on: boolean }) {
  const [text, setText] = useState(SCRAMBLE[0])
  const index = useRef(0)

  useEffect(() => {
    if (!on) return
    const id = window.setInterval(() => {
      index.current = (index.current + 1) % SCRAMBLE.length
      setText(SCRAMBLE[index.current])
    }, 500)
    return () => window.clearInterval(id)
  }, [on])

  return (
    <p className="pointer-events-none absolute inset-x-0 top-4 select-none px-4 font-mono text-[11px] leading-4 text-white/25 opacity-40">
      {text}
    </p>
  )
}

/** Fades the stream into the card edges. */
function EdgeMask() {
  return (
    <>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-[linear-gradient(to_right,#0a0e0c_20%,transparent)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-[linear-gradient(to_left,#0a0e0c_20%,transparent)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[linear-gradient(to_bottom,#0a0e0c_28%,transparent)]" />
    </>
  )
}

/** The verification tick from the security card. */
function CheckCircle({ delay = 2.3 }: { delay?: number }) {
  return (
    <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay }}
        className="absolute h-3 w-3 rounded-full bg-neon drop-shadow-[0_0_3px_rgba(49,196,126,0.9)]"
      />
      <motion.svg
        width="8"
        height="8"
        viewBox="0 0 12 12"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: delay + 0.1 }}
        className="relative"
      >
        <path
          d="M2 6.4 4.6 9 10 3.4"
          stroke="#05140d"
          strokeWidth="1.8"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </span>
  )
}

/** Shared stage so every step visual has the same optical weight. */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0e0c]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(49,196,126,0.1),transparent_70%)]" />
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ vault */
/* Adapted from the forge ui vault lock, same beats and delays. */

const vaultVariant: Variants = {
  open: { y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
  close: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
}

const inputVariant: Variants = {
  open: { y: -12, transition: { duration: 0.3, ease: 'easeInOut' } },
  close: { y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
}

const shineVariant: Variants = {
  open: {
    transform: 'translateX(-50%) translateY(0%) rotate(45deg)',
    scale: 1.2,
    transition: { duration: 0.6, ease: EASE, delay: 2.1 },
  },
  close: {
    transform: 'translateX(-125%) translateY(-60%) rotate(45deg)',
    scale: 1,
    transition: { duration: 0.4, ease: EASE },
  },
}

const lockVariant: Variants = {
  open: { rotate: 90, transition: { duration: 0.6, ease: EASE, delay: 2 } },
  close: { rotate: 0, transition: { duration: 0.4, ease: EASE } },
}

const codeVariant: Variants = {
  open: (index: number) => ({
    opacity: 1,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.5, delay: 0.3 + index * 0.15, ease: 'easeInOut' },
  }),
  close: {
    opacity: 0,
    filter: 'blur(10px)',
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeInOut' },
  },
}

function Vault({ on }: { on: boolean }) {
  return (
    <motion.div
      initial="close"
      animate={on ? 'open' : 'close'}
      className="group relative h-56 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0e0c]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(49,196,126,0.1),transparent_70%)]" />

      {/* the safe body, corners cut like a deposit box */}
      <motion.div
        variants={vaultVariant}
        className="absolute inset-x-0 top-[72px] mx-auto h-32 w-[90%] max-w-[300px] border-t border-white/10 bg-gradient-to-b from-[#141a17] to-[#0b100e] p-6 shadow-lg"
        style={{
          clipPath:
            'polygon(30px 0%, calc(100% - 30px) 0%, 100% 30px, 100% 100%, 0% 100%, 0% 30px)',
        }}
      />

      {/* the dial */}
      <motion.div
        variants={vaultVariant}
        className="absolute inset-x-0 top-8 mx-auto flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-[#050806] p-1"
      >
        <motion.div
          variants={shineVariant}
          className="absolute left-1/2 top-0 h-full w-10 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5)_30%,#fff,rgba(255,255,255,0.5)_70%,transparent)] opacity-30"
        />
        <motion.div
          variants={lockVariant}
          className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-[repeating-radial-gradient(rgba(80,90,85,0.5)_0.15rem,rgba(30,36,33,0.5)_0.32rem)]"
        >
          <div className="flex h-full w-2.5 items-center justify-center">
            <svg
              width="8"
              height="36"
              viewBox="0 0 8 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
            >
              <path
                fill="#050806"
                d="M3 0C1.34315 0 0 1.34315 0 3V19.5858C0 19.851 0.105357 20.1054 0.292893 20.2929L3.29289 23.2929C3.68342 23.6834 3.68342 24.3166 3.29289 24.7071L0.292893 27.7071C0.105357 27.8946 0 28.149 0 28.4142V33C0 34.6569 1.34315 36 3 36H5C6.65685 36 8 34.6569 8 33V16.4142C8 16.149 7.89464 15.8946 7.70711 15.7071L4.70711 12.7071C4.31658 12.3166 4.31658 11.6834 4.70711 11.2929L7.70711 8.29289C7.89464 8.10536 8 7.851 8 7.58579V3C8 1.34315 6.65685 0 5 0H3Z"
              />
            </svg>
          </div>
        </motion.div>
        <div className="absolute inset-x-0 top-0 mx-auto flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border-4 border-[#050806]" />
      </motion.div>

      <motion.div
        variants={vaultVariant}
        className="absolute inset-x-0 top-8 mx-auto flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border-b-[3px] border-white/10"
      />

      {/* the code field */}
      <motion.div
        variants={inputVariant}
        className="absolute inset-x-0 top-[126px] mx-auto flex w-[90%] max-w-[230px] items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.04] p-2 drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300 group-hover:border-neon/60 group-hover:[box-shadow:inset_0_0_6px_rgba(49,196,126,0.5)]"
      >
        <div className="ml-2 text-xs text-neon">
          {'••••••••••'.split('').map((char, index) => (
            <motion.span
              key={index}
              className="mr-1 inline-block font-[350]"
              variants={codeVariant}
              custom={index}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------- the others */

function Wallet({ on }: { on: boolean }) {
  return (
    <Stage>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{ y: on ? -6 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="w-[240px] rounded-lg border border-white/[0.08] bg-gradient-to-b from-[#141a17] to-[#0b100e] p-4 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-full bg-gradient-to-br from-neon/70 to-neon/20" />
            <div className="min-w-0">
              <div className="h-2 w-24 rounded-full bg-white/15" />
              <div className="mt-2 h-2 w-16 rounded-full bg-white/[0.08]" />
            </div>
          </div>
          <motion.div
            initial={false}
            animate={{
              backgroundColor: on ? 'rgba(49,196,126,1)' : 'rgba(255,255,255,0.06)',
              color: on ? '#05140d' : 'rgba(255,255,255,0.5)',
            }}
            transition={{ duration: 0.4 }}
            className="mt-4 flex h-9 items-center justify-center rounded-md text-[12px] font-semibold"
          >
            {on ? 'Connected' : 'Connect wallet'}
          </motion.div>
        </motion.div>
      </div>
    </Stage>
  )
}

function Funding({ on }: { on: boolean }) {
  return (
    <Stage>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Funding account</div>
        <div className="flex items-end gap-1 font-mono text-[34px] leading-none">
          <span className="text-white/40">$</span>
          {'184,204'.split('').map((c, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={on ? { y: [10, 0], opacity: [0, 1] } : { opacity: 0.35 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: EASE }}
            >
              {c}
            </motion.span>
          ))}
        </div>
        <motion.div
          initial={false}
          animate={{ opacity: on ? 1 : 0.3, width: on ? 120 : 40 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="h-1 rounded-full bg-neon"
        />
      </div>
    </Stage>
  )
}

/** Beam travelling along a routed path, adapted from the fraud card. */
function Route({ on }: { on: boolean }) {
  // the path starts and ends at the edge of each node, never under it
  const path = 'M 22 22 L 50 22 L 50 56 L 78 56'

  return (
    <Stage>
      <div className="absolute inset-0">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 78"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d={path} stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
          {on && (
            <g mask="url(#route-mask)">
              <circle className="route-beam" cx="0" cy="0" r="10" fill="url(#route-grad)" />
            </g>
          )}
          <defs>
            <mask id="route-mask">
              <path d={path} stroke="white" strokeWidth="1.6" />
            </mask>
            <radialGradient id="route-grad" fx="1">
              <stop offset="0%" stopColor="#31c47e" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>

        {/* nodes sit where the path begins and ends */}
        <span
          className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-white/10 bg-[#0a0e0c] text-[10px] uppercase tracking-[0.15em] text-white/40"
          style={{ left: '14%', top: '28%' }}
        >
          from
        </span>
        <span
          className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl border border-neon/25 bg-[#0c1712] text-[10px] uppercase tracking-[0.15em] text-neon/70"
          style={{ left: '86%', top: '72%' }}
        >
          to
        </span>

        <motion.div
          initial={false}
          animate={{ opacity: on ? 1 : 0.45 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-[#0a0e0c] px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/50"
          style={{ left: '50%', top: '50%' }}
        >
          confidential
        </motion.div>
      </div>

      <style>{`
        .route-beam {
          offset-anchor: 10px 0px;
          offset-path: path("M 22 22 L 50 22 L 50 56 L 78 56");
          animation: route-run 3s cubic-bezier(0.05, 0.05, 0.05, 0.03) infinite;
        }
        @keyframes route-run {
          0% { offset-distance: 0%; }
          60% { offset-distance: 100%; }
          100% { offset-distance: 100%; }
        }
      `}</style>
    </Stage>
  )
}

function Keys({ on }: { on: boolean }) {
  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-white/[0.07] bg-[#0a0e0c]">
      <Scrambler on={on} />
      <EdgeMask />

      <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
        <div className="relative rounded-[3px] bg-black/40 p-1">
          <div className="relative h-[84px] w-[64px] overflow-hidden rounded-[2px] bg-gradient-to-br from-[#161d19] to-[#0d1310]">
            <svg
              viewBox="0 0 80 96"
              fill="none"
              className="absolute inset-0 h-full w-full"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776" className="stroke-white/10" />
              {on && (
                <path
                  d="M26.22 78.25c2.679-3.522 1.485-17.776 1.485-17.776-1.084-2.098-1.918-4.288-2.123-5.619-3.573 0-3.7-8.05-3.827-9.937-.102-1.509 1.403-1.383 2.169-1.132-.298-1.3-.92-5.408-1.021-11.446C22.775 24.794 30.94 17.75 40 17.75h.005c9.059 0 17.225 7.044 17.097 14.59-.102 6.038-.723 10.147-1.021 11.446.765-.251 2.271-.377 2.169 1.132-.128 1.887-.254 9.937-3.827 9.937-.205 1.331-1.039 3.521-2.123 5.619 0 0-1.194 14.254 1.485 17.776"
                  className="draw-outline stroke-neon drop-shadow-[0_0_6px_rgba(49,196,126,0.8)]"
                />
              )}
            </svg>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 text-[12px]">
          <motion.span
            initial={{ x: 8 }}
            animate={{ x: on ? -2 : 8 }}
            transition={{ duration: 0.4, delay: 1.8, ease: 'easeInOut' }}
          >
            Passkey M
          </motion.span>
          {on && <CheckCircle />}
        </div>

        <div className="mt-4 flex gap-2">
          {['P1', 'P2', 'P3', 'P4'].map((k, i) => (
            <motion.span
              key={k}
              initial={false}
              animate={on ? { opacity: 1, y: 0 } : { opacity: 0.35, y: 5 }}
              transition={{ duration: 0.4, delay: on ? 2.5 + i * 0.12 : 0 }}
              className="rounded-lg border border-neon/25 bg-neon/10 px-3 py-1.5 font-mono text-[12px] font-semibold text-neon"
            >
              {k}
            </motion.span>
          ))}
        </div>
      </div>

      <style>{`
        .draw-outline {
          stroke-dasharray: 160;
          stroke-dashoffset: 160;
          animation: draw-outline 4s ease forwards;
        }
        @keyframes draw-outline {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  )
}

function Deposit({ on }: { on: boolean }) {
  return (
    <Stage>
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={false}
          animate={{ y: on ? -6 : 0, borderColor: on ? 'rgba(49,196,126,0.5)' : 'rgba(255,255,255,0.08)' }}
          transition={{ duration: 0.4, ease: EASE }}
          className="w-[240px] rounded-lg border bg-gradient-to-b from-[#141a17] to-[#0b100e] p-5"
        >
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/35">Amount</div>
          <div className="mt-3 font-mono text-[28px] leading-none">
            $25,000
            <motion.span
              className="ml-0.5 text-neon"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            >
              |
            </motion.span>
          </div>
          <div className="mt-4 flex gap-1.5">
            {['25%', '50%', '75%', 'Max'].map((p) => (
              <span
                key={p}
                className="flex-1 rounded-md bg-white/[0.05] py-1.5 text-center text-[10px] text-white/45"
              >
                {p}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </Stage>
  )
}

const CIPHER = '8F2A9C41D7B3E5A6'

function Encrypt({ on }: { on: boolean }) {
  return (
    <Stage>
      <Scrambler on={on} />
      <EdgeMask />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <motion.span
          initial={false}
          animate={{ opacity: on ? 0.25 : 0.7, filter: on ? 'blur(3px)' : 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="font-mono text-[24px]"
        >
          $25,000
        </motion.span>
        <div className="flex flex-wrap justify-center gap-1 px-8">
          {CIPHER.split('').map((c, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={
                on
                  ? { opacity: 1, filter: 'blur(0px)', scale: 1 }
                  : { opacity: 0, filter: 'blur(10px)', scale: 1.02 }
              }
              transition={{ duration: 0.5, delay: on ? 0.25 + i * 0.06 : 0, ease: 'easeInOut' }}
              className="rounded bg-neon/10 px-1.5 py-1 font-mono text-[15px] text-neon"
            >
              {c}
            </motion.span>
          ))}
        </div>
      </div>
    </Stage>
  )
}

const DOTS = [
  { top: '38%', left: '18%' },
  { top: '64%', left: '32%' },
  { top: '46%', left: '74%' },
  { top: '76%', left: '56%' },
  { top: '30%', left: '46%' },
  { top: '62%', left: '8%' },
  { top: '82%', left: '24%' },
  { top: '56%', left: '88%' },
  { top: '26%', left: '68%' },
]

/** Radar sweep over a field of deposits, adapted from the bot detection card.
 *  Here it says the opposite thing: no single deposit can be singled out. */
function Batch({ on }: { on: boolean }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!on) return
    const id = window.setInterval(() => setIndex((v) => (v + 1) % DOTS.length), 2200)
    return () => window.clearInterval(id)
  }, [on])

  return (
    <Stage>
      <div className="absolute inset-x-0 bottom-0 top-2">
        {/* the sweep */}
        <motion.div
          className="pointer-events-none absolute bottom-3 left-1/2 h-48 w-48 origin-bottom-left"
          style={{
            background:
              'radial-gradient(circle at 0% 100%, rgba(49,196,126,0.28) 5%, transparent 60%)',
          }}
          initial={{ opacity: 0.6, rotate: -55 }}
          animate={on ? { opacity: [0.6, 1, 0.6], rotate: [-55, -42, -50, -45, -55] } : { opacity: 0.3 }}
          transition={{ duration: 14, repeat: on ? Infinity : 0, ease: 'easeInOut' }}
        />

        {/* range rings */}
        <div className="absolute left-1/2 top-6 h-full w-[130%] -translate-x-1/2 rounded-full border-t border-dashed border-white/10" />
        <div className="absolute left-1/2 top-14 h-full w-[110%] -translate-x-1/2 rounded-full border-t border-dashed border-white/10" />
        <div className="absolute left-1/2 top-24 h-full w-[88%] -translate-x-1/2 rounded-full border-t border-dashed border-white/10" />

        {/* the deposits */}
        {DOTS.map((d, i) => (
          <span
            key={i}
            className="absolute h-[5px] w-[5px] rounded-[1px] bg-white/25"
            style={{ top: d.top, left: d.left }}
          />
        ))}

        {/* the one the sweep is over, which still says nothing about its owner */}
        <motion.div
          layoutId="batch-dot"
          className="absolute flex h-[7px] w-[7px] items-center justify-center rounded-[1px] bg-neon shadow-[0_0_10px_4px_rgba(49,196,126,0.55)]"
          style={DOTS[index]}
          transition={{ type: 'spring', stiffness: 300, damping: 70 }}
        >
          <motion.span
            key={index}
            className="absolute h-[300%] w-[300%] rounded-full border border-neon/70"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 1.8, opacity: [0.7, 1, 0] }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
          />
        </motion.div>

        <div className="absolute bottom-1 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full border border-white/10 bg-[#0a0e0c]" />
      </div>
    </Stage>
  )
}

/** Phone that lifts to reveal an alert, adapted from the notification centre. */
function Shield({ on }: { on: boolean }) {
  return (
    <Stage>
      <motion.div
        initial={false}
        animate={{ y: on ? -22 : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute inset-x-0 top-8 mx-auto h-60 w-[250px] rounded-[34px] border border-white/10 bg-[#111714] p-1.5"
      >
        <div className="relative h-full overflow-hidden rounded-[28px] bg-[#070b09]">
          <div className="absolute left-5 top-3 text-[9px] text-white/35">09:41</div>
          <motion.span
            initial={false}
            animate={{ backgroundColor: on ? '#31c47e' : 'rgba(255,255,255,0.12)' }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 top-2.5 h-5 w-5 -translate-x-1/2 rounded-full"
          />

          <motion.div
            initial={false}
            animate={
              on
                ? { y: 44, scale: 1, filter: 'blur(0px)' }
                : { y: -70, scale: 0.75, filter: 'blur(10px)' }
            }
            transition={{ duration: 0.3, ease: 'easeInOut', delay: on ? 0.1 : 0 }}
            className="absolute inset-x-2.5 z-10 flex items-center gap-2.5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.08] px-2.5 py-2.5 backdrop-blur-md"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neon/15 text-[12px] font-semibold text-neon">
              G
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline gap-2">
                <span className="flex-1 truncate text-[12px] font-medium leading-none">
                  Position updated
                </span>
                <span className="shrink-0 text-[9px] leading-none text-white/35">now</span>
              </span>
              <span className="mt-2 block truncate text-[11px] leading-none text-white/50">
                Balance •••••• encrypted
              </span>
            </span>
          </motion.div>

          {/* home screen behind the alert */}
          <div className="absolute inset-x-5 top-[104px] grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <span
                key={i}
                className="aspect-square rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
              />
            ))}
          </div>
        </div>
      </motion.div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,#0a0e0c_55%,transparent)]" />
    </Stage>
  )
}

const MAP = {
  wallet: Wallet,
  funding: Funding,
  route: Route,
  keys: Keys,
  deposit: Deposit,
  encrypt: Encrypt,
  batch: Batch,
  vault: Vault,
  shield: Shield,
}

export default function StepVisual({ kind, on }: { kind: VisualKind; on: boolean }) {
  const Comp = MAP[kind]
  return <Comp on={on} />
}
