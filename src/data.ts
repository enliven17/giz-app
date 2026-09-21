export type Vault = {
  id: string
  name: string
  ticker: string
  strategy: string
  tvl: string
  apy: number
  change24h: number
  price: number
  risk: 'Low' | 'Medium' | 'High'
  lockup: string
  minimum: string
  managers: string
  allocation: { label: string; pct: number }[]
  series: number[]
}

// deterministic pseudo series, design only
const seed = (n: number, len = 64, drift = 1) =>
  Array.from({ length: len }, (_, i) => {
    const w = Math.sin(i * 0.35 + n) * 6 + Math.sin(i * 0.11 + n * 2) * 14 + Math.sin(i * 0.9 + n) * 2.5
    return 100 + w + i * drift * 0.7
  })

export const vaults: Vault[] = [
  {
    id: 'helix',
    name: 'Helix Alpha',
    ticker: 'HLX',
    strategy: 'Market neutral basis trade',
    tvl: '$412.8M',
    apy: 18.4,
    change24h: 2.31,
    price: 1.8342,
    risk: 'Medium',
    lockup: '30 days',
    minimum: '$25,000',
    managers: 'Helix Capital',
    allocation: [
      { label: 'Perp basis', pct: 46 },
      { label: 'Funding carry', pct: 31 },
      { label: 'Stables', pct: 23 },
    ],
    series: seed(1, 64, 1.1),
  },
  {
    id: 'obsidian',
    name: 'Obsidian Credit',
    ticker: 'OBS',
    strategy: 'Private credit, senior secured',
    tvl: '$1.24B',
    apy: 11.2,
    change24h: 0.42,
    price: 12.094,
    risk: 'Low',
    lockup: '90 days',
    minimum: '$100,000',
    managers: 'Obsidian Partners',
    allocation: [
      { label: 'Senior loans', pct: 62 },
      { label: 'Mezzanine', pct: 24 },
      { label: 'Cash', pct: 14 },
    ],
    series: seed(2, 64, 0.5),
  },
  {
    id: 'vertex',
    name: 'Vertex Quant',
    ticker: 'VTX',
    strategy: 'Systematic momentum, cross asset',
    tvl: '$268.1M',
    apy: 26.7,
    change24h: -1.84,
    price: 4.4127,
    risk: 'High',
    lockup: 'None',
    minimum: '$10,000',
    managers: 'Vertex Research',
    allocation: [
      { label: 'Crypto majors', pct: 41 },
      { label: 'FX carry', pct: 29 },
      { label: 'Commodities', pct: 30 },
    ],
    series: seed(3, 64, 1.6),
  },
  {
    id: 'meridian',
    name: 'Meridian RWA',
    ticker: 'MRD',
    strategy: 'Tokenized treasuries and real estate',
    tvl: '$836.5M',
    apy: 8.9,
    change24h: 0.11,
    price: 1.0412,
    risk: 'Low',
    lockup: '14 days',
    minimum: '$5,000',
    managers: 'Meridian Asset Co',
    allocation: [
      { label: 'T-Bills', pct: 55 },
      { label: 'Real estate', pct: 33 },
      { label: 'Cash', pct: 12 },
    ],
    series: seed(4, 64, 0.32),
  },
]

export const holdings = [
  { id: 'helix', name: 'Helix Alpha', ticker: 'HLX', units: '148,204.12', value: 271_842.55, change: 2.31 },
  { id: 'obsidian', name: 'Obsidian Credit', ticker: 'OBS', units: '21,904.00', value: 264_912.08, change: 0.42 },
  { id: 'vertex', name: 'Vertex Quant', ticker: 'VTX', units: '62,110.44', value: 274_083.61, change: -1.84 },
]

export const portfolioSeries = seed(7, 72, 1.0)
