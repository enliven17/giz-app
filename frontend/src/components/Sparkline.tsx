export default function Sparkline({
  series,
  up,
  width = 60,
  height = 24,
  fluid = false,
}: {
  series: number[]
  up: boolean
  width?: number
  height?: number
  /** stretch to the container width */
  fluid?: boolean
}) {
  const min = Math.min(...series)
  const max = Math.max(...series)
  const span = max - min || 1
  const pts = series.map((v, i) => ({
    x: (i / (series.length - 1)) * width,
    y: height - ((v - min) / span) * (height - 4) - 2,
  }))
  const d = pts.reduce((acc, p, i) => {
    if (i === 0) return `M${p.x.toFixed(2)},${p.y.toFixed(2)}`
    const p0 = pts[i - 2] ?? pts[i - 1]
    const p1 = pts[i - 1]
    const p3 = pts[i + 1] ?? p
    const c1x = p1.x + (p.x - p0.x) / 6
    const c1y = p1.y + (p.y - p0.y) / 6
    const c2x = p.x - (p3.x - p1.x) / 6
    const c2y = p.y - (p3.y - p1.y) / 6
    return `${acc} C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p.x.toFixed(2)},${p.y.toFixed(2)}`
  }, '')
  const area = `${d} L${width},${height} L0,${height} Z`
  const color = up ? '#31c47e' : '#c4576a'
  const id = `sp-${up ? 'u' : 'd'}-${width}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={fluid ? '100%' : width}
      height={height}
      preserveAspectRatio={fluid ? 'none' : undefined}
      className={fluid ? 'block overflow-visible' : 'shrink-0 overflow-visible'}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
