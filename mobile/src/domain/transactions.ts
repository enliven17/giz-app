import type { Holding } from "./investments";

export const SCALE = 1_000_000n;
export const NETWORK_FEE = 420_000n;
export type OperationKind = "buy" | "sell" | "deposit" | "withdraw";
export const operationLabels: Record<OperationKind, string> = {
  buy: "Buy",
  sell: "Sell",
  deposit: "Deposit",
  withdraw: "Withdrawal",
};
export type TradeVault = {
  id: string;
  ticker: string;
  name: string;
  price: string;
  minimum: string;
  lockup: string;
  units: string;
  redeemable: string;
};
export type TradingAccount = {
  revision: number;
  cash: string;
  wallet: string;
  vaults: TradeVault[];
  holdings: Holding[];
};
export type OrderInput = { kind: OperationKind; vaultId?: string; amount: string };
export type Quote = {
  id: string;
  input: OrderInput;
  debit: string;
  credit: string;
  fee: string;
  from: string;
  to: string;
  expiresAt: number;
  accountRevision: number;
};
export type Receipt = {
  key: string;
  quote: Quote;
  status: "pending" | "confirmed" | "failed";
  message?: string;
};
export class TransactionError extends Error {
  constructor(
    message: string,
    public code: "validation" | "expired" | "rejected" | "not-submitted" | "unknown" = "validation",
  ) {
    super(message);
  }
}
export function parseAmount(text: string): bigint {
  if (!/^(?:0|[1-9]\d{0,17})(?:\.\d{1,6})?$/.test(text))
    throw new TransactionError("Enter a plain amount with up to 6 decimal places.");
  const [whole, fraction = ""] = text.split(".");
  return BigInt(whole!) * SCALE + BigInt(fraction.padEnd(6, "0"));
}
export function decimal(value: string | bigint): string {
  const n = BigInt(value);
  return `${n / SCALE}${n % SCALE ? `.${(n % SCALE).toString().padStart(6, "0").replace(/0+$/, "")}` : ""}`;
}
export function tradeFee(amount: bigint) {
  return (amount * 5n + 9999n) / 10000n;
}
export function selectedVault(
  account: TradingAccount,
  input: Pick<OrderInput, "kind" | "vaultId">,
) {
  const vault = account.vaults.find((item) => item.id === input.vaultId);
  if ((input.kind === "buy" || input.kind === "sell") && !vault)
    throw new TransactionError("Choose an available vault.");
  return vault;
}
export function maximum(
  account: TradingAccount,
  input: Pick<OrderInput, "kind" | "vaultId">,
): bigint {
  const vault = selectedVault(account, input);
  if (input.kind === "sell") return BigInt(vault!.redeemable);
  const balance = BigInt(input.kind === "deposit" ? account.wallet : account.cash);
  if (balance <= NETWORK_FEE) return 0n;
  if (input.kind !== "buy") return balance - NETWORK_FEE;
  // Largest principal whose principal + rounded-up fee + network fee fits.
  let low = 0n,
    high = balance - NETWORK_FEE;
  while (low < high) {
    const mid = (low + high + 1n) / 2n;
    if (mid + tradeFee(mid) + NETWORK_FEE <= balance) low = mid;
    else high = mid - 1n;
  }
  return low;
}
export function calculateQuote(
  account: TradingAccount,
  input: OrderInput,
): Omit<Quote, "id" | "expiresAt"> {
  const amount = parseAmount(input.amount);
  if (amount <= 0n) throw new TransactionError("Enter an amount greater than zero.");
  const vault = selectedVault(account, input);
  if (input.kind === "sell" && BigInt(vault!.redeemable) === 0n)
    throw new TransactionError("No unlocked units are available to sell.");
  if (amount > maximum(account, input))
    throw new TransactionError("Amount exceeds the available balance after fees.");
  if (input.kind === "buy" && amount < BigInt(vault!.minimum))
    throw new TransactionError(`Minimum purchase is ${decimal(vault!.minimum)} USDC.`);
  let debit = amount,
    credit = amount,
    fee = NETWORK_FEE;
  let from = input.kind === "deposit" ? "Passkey wallet · USDC" : "Account · USDC";
  let to = input.kind === "withdraw" ? "Passkey wallet · USDC" : "Account · USDC";
  if (input.kind === "buy") {
    fee += tradeFee(amount);
    debit += fee;
    credit = (amount * SCALE) / BigInt(vault!.price);
    to = vault!.ticker;
  } else if (input.kind === "sell") {
    const gross = (amount * BigInt(vault!.price)) / SCALE;
    fee += tradeFee(gross);
    credit = gross - fee;
    from = vault!.ticker;
  } else debit += fee;
  if (credit <= 0n) throw new TransactionError("Amount is too small after fees and rounding.");
  return {
    input: { ...input, amount: decimal(amount) },
    debit: debit.toString(),
    credit: credit.toString(),
    fee: fee.toString(),
    from,
    to,
    accountRevision: account.revision,
  };
}
