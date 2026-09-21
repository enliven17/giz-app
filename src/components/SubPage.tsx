import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { subpages } from '../content'

export default function SubPage({ id, onBack }: { id: string; onBack: () => void }) {
  const page = subpages[id]
  if (!page) return null

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-14">
      <button
        onClick={onBack}
        className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60"
      >
        <ChevronLeft size={18} />
      </button>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <h2 className="text-[30px] font-medium tracking-tight">{page.title}</h2>
      </motion.div>

      {page.sections.map((sec, si) => (
        <motion.section
          key={si}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * si }}
          className="mt-7"
        >
          {sec.title && (
            <div className="mb-3 px-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/30">
              {sec.title}
            </div>
          )}

          {sec.body && (
            <p className="text-[14px] leading-relaxed text-white/45">{sec.body}</p>
          )}

          {sec.rows && (
            <div className="glass divide-y divide-white/5 rounded-3xl">
              {sec.rows.map((r) => (
                <button
                  key={r.label}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left active:bg-white/[0.03]"
                >
                  <span className="flex-1 truncate text-[14px] text-white/85">{r.label}</span>
                  {r.value && (
                    <span
                      className={`font-mono text-[12px] ${
                        r.value === 'Selected' ? 'text-neon' : 'text-white/45'
                      }`}
                    >
                      {r.value}
                    </span>
                  )}
                  {r.toggle && <span className="h-2 w-2 rounded-full bg-neon" />}
                  <ChevronRight size={15} className="shrink-0 text-white/20" />
                </button>
              ))}
            </div>
          )}
        </motion.section>
      ))}

      {page.action && (
        <button className="neon-btn mt-8 flex h-15 w-full items-center justify-center rounded-3xl py-5 text-[15px] font-semibold">
          {page.action}
        </button>
      )}
    </div>
  )
}
