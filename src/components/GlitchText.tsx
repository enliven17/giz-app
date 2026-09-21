type Props = {
  children: string
  className?: string
  as?: 'span' | 'h1' | 'h2' | 'div'
}

export default function GlitchText({ children, className = '', as: Tag = 'span' }: Props) {
  return (
    <Tag className={`glitch ${className}`} data-text={children}>
      {children}
    </Tag>
  )
}
