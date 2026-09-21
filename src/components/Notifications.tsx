import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, CheckCheck } from 'lucide-react'
import Scramble from './Scramble'
import { notifications } from '../content'

const TAG_LABEL: Record<string, string> = {
  fill: 'order',
  vault: 'vault',
  report: 'report',
  security: 'security',
}

export default function Notifications({ onBack }: { onBack: () => void }) {
  const [read, setRead] = useState<string[]>([])
  const isUnread = (id: string, unread: boolean) => unread && !read.includes(id)
  const count = notifications.filter((n) => isUnread(n.id, n.unread)).length

  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-36 pt-14">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="glass-soft flex h-11 w-11 items-center justify-center rounded-2xl text-white/60"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => setRead(notifications.map((n) => n.id))}
          className="glass-soft flex h-11 items-center gap-2 rounded-2xl px-4 font-mono text-[10px] uppercase tracking-widest text-white/45"
        >
          <CheckCheck size={14} /> mark all
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
          <Scramble text={`${count} unread`} />
        </div>
        <h2 className="mt-2 text-[30px] font-medium tracking-tight">Notifications</h2>
      </motion.div>

      <div className="mt-6 space-y-2">
        {notifications.map((n, i) => {
          const unread = isUnread(n.id, n.unread)
          return (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              onClick={() => setRead((r) => (r.includes(n.id) ? r : [...r, n.id]))}
              className="glass flex w-full items-start gap-4 rounded-3xl p-5 text-left"
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-neon' : 'bg-white/15'}`}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-[15px] font-medium">{n.title}</span>
                  <span className="shrink-0 font-mono text-[10px] text-white/30">{n.time}</span>
                </span>
                <span className="mt-1 block truncate text-[13px] text-white/45">{n.body}</span>
                <span className="mt-2 inline-block rounded-full bg-white/5 px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest text-white/35">
                  {TAG_LABEL[n.tag]}
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
