import { useRef, useState, type ReactNode } from 'react'
import { motion, useAnimation, useReducedMotion } from 'framer-motion'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: ReactNode
  className?: string
}

export default function BubbleUpButton({ children, className = '', disabled, ...props }: Props) {
  const controls = useAnimation()
  const reduce = useReducedMotion()
  const intent = useRef(false)
  const [filled, setFilled] = useState(false)

  const fill = async () => {
    intent.current = true
    setFilled(true)
    await controls.start({
      clipPath: 'ellipse(120% 120% at 50% 100%)',
      transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 32 },
    })
  }

  const drain = async () => {
    intent.current = false
    setFilled(false)
    await controls.start({
      clipPath: 'ellipse(120% 120% at 50% -120%)',
      transition: reduce ? { duration: 0 } : { type: 'spring', stiffness: 300, damping: 32 },
    })
    if (!intent.current) controls.set({ clipPath: 'ellipse(0% 0% at 50% 100%)' })
  }

  return (
    <button
      onMouseEnter={fill}
      onMouseLeave={drain}
      onFocus={fill}
      onBlur={drain}
      onPointerDown={fill}
      onPointerUp={drain}
      onPointerCancel={drain}
      disabled={disabled}
      className={`relative isolate flex h-16 w-full cursor-pointer items-center justify-center overflow-clip rounded-3xl border border-neon/25 bg-white/[0.03] backdrop-blur-xl ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      } ${className}`}
      {...props}
    >
      <motion.div
        animate={controls}
        initial={{ clipPath: 'ellipse(0% 0% at 50% 100%)' }}
        className="absolute inset-0 bg-neon"
        aria-hidden="true"
      />
      <span
        className={`relative flex items-center gap-2 text-[15px] font-semibold tracking-wide transition-colors duration-200 ${
          filled ? 'text-ink' : 'text-neon'
        }`}
      >
        {children}
      </span>
    </button>
  )
}
