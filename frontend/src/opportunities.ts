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

export type OpportunityToken = {
  id: string
  name: string
  symbol: string
  address: string
  decimals: number
  price: number
}

export type OpportunityCampaign = {
  id: string
  campaignId: string
  type: string
  apr: number
  dailyRewards: number
  startTimestamp: number
  endTimestamp: number
  creatorAddress: string
}

export type OpportunityDetail = Opportunity & {
  description: string
  action: string
  type: string
  status: string
  dailyRewards: number
  liveCampaigns: number
  nativeApr: number
  explorerAddress: string
  howToSteps: string[]
  depositUrl: string
  identifier: string
  tags: string[]
  tokens: OpportunityToken[]
  campaigns: OpportunityCampaign[]
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

export async function getOpportunity(id: string): Promise<OpportunityDetail> {
  const response = await fetch(`/v1/opportunities/${id}`)
  if (!response.ok) {
    throw new Error('opportunity unavailable')
  }
  const body = (await response.json()) as { opportunity: OpportunityDetail }
  return body.opportunity
}
