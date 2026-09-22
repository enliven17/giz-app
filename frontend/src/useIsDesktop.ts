import { useEffect, useState } from 'react'

// ponytail: tek kirilma noktasi, mobil ve desktop tamamen ayri agac
export default function useIsDesktop(query = '(min-width: 1024px)') {
  const [is, setIs] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setIs(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])

  return is
}
