import { useEffect, useRef, useState } from 'react'

// ponytail: sadece yukseklik lazim, tek ResizeObserver
export default function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height))
    ro.observe(el)
    setHeight(el.getBoundingClientRect().height)
    return () => ro.disconnect()
  }, [])

  return { ref, height }
}
