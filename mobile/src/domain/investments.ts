export type Risk = "Low" | "Medium" | "High";
export const periods = ["1D", "1W", "1M", "1Y", "All"] as const;
export type Period = (typeof periods)[number];
export type Vault = {
  id: string;
  name: string;
  ticker: string;
  strategy: string;
  managers: string;
  tvl: string;
  apy: string;
  change24h: string;
  price: string;
  risk: Risk;
  lockup: string;
  minimum: string;
  allocation: { label: string; pct: number }[];
  series: number[];
};
export type Holding = {
  id: string;
  name: string;
  ticker: string;
  units: string;
  valueCents: string;
  change: string;
};
export type Activity = { id: string; month: string; label: string; value: string };
export type InvestmentSnapshot = {
  vaults: Vault[];
  holdings: Holding[];
  activity: Activity[];
  portfolioSeries: number[];
  dailyChange: { percent: string; valueCents: string };
  asOf: string;
  freshness: "fresh" | "stale" | "offline";
};
// Integer cents are the display boundary. Chart numbers never authorize transactions.
export function dollars(cents: string | bigint): string {
  const amount = BigInt(cents);
  const absolute = amount < 0n ? -amount : amount;
  return `${amount < 0n ? "-" : ""}$${(absolute / 100n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${(absolute % 100n).toString().padStart(2, "0")}`;
}
export function portfolioTotal(holdings: Holding[]) {
  return dollars(holdings.reduce((total, holding) => total + BigInt(holding.valueCents), 0n));
}
export function filterVaults(vaults: Vault[], query: string, risk: Risk | "All") {
  const search = query.trim().toLowerCase();
  return vaults.filter(
    (vault) =>
      (risk === "All" || vault.risk === risk) &&
      [vault.name, vault.ticker, vault.strategy, vault.managers].some((field) =>
        field.toLowerCase().includes(search),
      ),
  );
}
export function periodSeries(series: number[], period: Period) {
  const count = { "1D": 8, "1W": 16, "1M": 32, "1Y": 48, All: series.length }[period];
  return series.slice(-count);
}
