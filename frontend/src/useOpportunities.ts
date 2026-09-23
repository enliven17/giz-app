import { useEffect, useState } from 'react'
import { listOpportunities, type OpportunityPage } from './opportunities'

type Load =
  | { kind: 'loading' }
  | { kind: 'ready'; page: OpportunityPage }
  | { kind: 'failed'; message: string }

export function useOpportunities(query: {
  search: string
  page: number
  items: number
  chainId: number
}) {
  const [load, setLoad] = useState<Load>({ kind: 'loading' })

  useEffect(() => {
    const controller = new AbortController()
    setLoad({ kind: 'loading' })
    listOpportunities(query)
      .then((page) => {
        if (controller.signal.aborted) {
          return
        }
        setLoad({ kind: 'ready', page })
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) {
          return
        }
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        setLoad({ kind: 'failed', message: 'Could not load vaults' })
      })
    return () => controller.abort()
  }, [query.search, query.page, query.items, query.chainId])

  return load
}
