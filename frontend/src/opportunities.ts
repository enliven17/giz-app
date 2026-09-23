export const MONAD_MAINNET_CHAIN_ID = 143

export type Opportunity = {
  id: string
  name: string
  apr: number
  totalApr: number
  tvl: number
  chainId: number
  chain: { name: string }
  protocol: { name: string }
}

export type OpportunityPage = {
  list: Opportunity[]
  page: number
  items: number
  total: number
}

export async function listOpportunities(query: {
  search: string
  page: number
  items: number
  chainId: number
}): Promise<OpportunityPage> {
  const params = new URLSearchParams({
    search: query.search,
    page: String(query.page),
    items: String(query.items),
    chainId: String(query.chainId),
  })
  const response = await fetch(`/v1/opportunities?${params}`)
  if (!response.ok) {
    throw new Error('opportunities unavailable')
  }
  return response.json() as Promise<OpportunityPage>
}
