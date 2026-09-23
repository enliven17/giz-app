export const investmentRanges = [
  "Under $500",
  "$500 to $2,000",
  "$2,000 to $10,000",
  "$10,000 to $50,000",
  "$50,000+",
  "Just exploring",
] as const;
export const investmentPlatforms = [
  "Aave",
  "Morpho",
  "Pendle",
  "Yearn",
  "Binance or Coinbase",
  "New to DeFi",
] as const;
export type EarlyAccessRequest = {
  email: string;
  amount: (typeof investmentRanges)[number];
  platforms: string[];
  other: string;
};
export interface EarlyAccessService {
  submit(request: EarlyAccessRequest): Promise<void>;
}
// Development only: no network, persistence, email or real waitlist enrollment.
export const mockEarlyAccessService: EarlyAccessService = {
  async submit() {},
};
