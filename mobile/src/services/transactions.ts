import type { InvestmentSnapshot } from "@/domain/investments";
import {
  calculateQuote,
  parseAmount,
  decimal,
  TransactionError,
  type OrderInput,
  type Quote,
  type Receipt,
  type TradingAccount,
} from "@/domain/transactions";
import { investmentFixture } from "./fixtures/investments";

export interface TransactionService {
  load(): Promise<TradingAccount>;
  quote(input: OrderInput): Promise<Quote>;
  sign(quoteId: string): Promise<string>;
  submit(quoteId: string, authorization: string, key: string): Promise<Receipt>;
  status(key: string): Promise<Receipt>;
}
export type MockScenario =
  "normal" | "rejection" | "failure" | "delayed" | "unknown" | "settlement-failure";
export function createMockTransactionService(
  seed: InvestmentSnapshot = investmentFixture,
  options: { scenario?: MockScenario; now?: () => number } = {},
): TransactionService {
  const now = options.now ?? Date.now;
  const scenario = options.scenario ?? "normal";
  const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
  let sequence = 0;
  const account: TradingAccount = {
    revision: 0,
    cash: parseAmount("184204").toString(),
    wallet: parseAmount("42180").toString(),
    holdings: clone(seed.holdings),
    vaults: seed.vaults.map((vault) => {
      const units = parseAmount(
        seed.holdings.find((h) => h.id === vault.id)?.units.replaceAll(",", "") ?? "0",
      ).toString();
      return {
        id: vault.id,
        name: vault.name,
        ticker: vault.ticker,
        price: parseAmount(vault.price).toString(),
        minimum: parseAmount(vault.minimum.replace(/[$,]/g, "")).toString(),
        lockup: vault.lockup,
        units,
        redeemable: vault.id === "obsidian" ? "0" : units,
      };
    }),
  };
  const quotes = new Map<string, Quote>();
  const authorizations = new Set<string>();
  const operations = new Map<string, { receipt: Receipt; checks: number }>();
  const quoteKeys = new Map<string, string>();
  let rejected = false,
    failed = false;
  function validQuote(id: string) {
    const quote = quotes.get(id);
    if (!quote || quote.expiresAt <= now() || quote.accountRevision !== account.revision)
      throw new TransactionError(
        "Quote expired or balance changed. Request a new quote.",
        "expired",
      );
    calculateQuote(account, quote.input);
    return quote;
  }
  function settle(receipt: Receipt) {
    const q = receipt.quote;
    const vault = account.vaults.find((v) => v.id === q.input.vaultId);
    const debit = BigInt(q.debit),
      credit = BigInt(q.credit);
    if (q.input.kind === "deposit") {
      account.wallet = (BigInt(account.wallet) - debit).toString();
      account.cash = (BigInt(account.cash) + credit).toString();
    }
    if (q.input.kind === "withdraw") {
      account.cash = (BigInt(account.cash) - debit).toString();
      account.wallet = (BigInt(account.wallet) + credit).toString();
    }
    if (q.input.kind === "buy" || q.input.kind === "sell") {
      const buying = q.input.kind === "buy";
      account.cash = (BigInt(account.cash) + (buying ? -debit : credit)).toString();
      vault!.units = (BigInt(vault!.units) + (buying ? credit : -debit)).toString();
      if (!buying || vault!.lockup === "None")
        vault!.redeemable = (BigInt(vault!.redeemable) + (buying ? credit : -debit)).toString();
      const existing = account.holdings.find((h) => h.id === vault!.id);
      // Preserve the snapshot's existing valuation; apply only this operation's unit-value delta.
      const deltaCents = ((buying ? credit : -debit) * BigInt(vault!.price)) / 10_000_000_000n;
      if (existing) {
        existing.units = decimal(vault!.units);
        existing.valueCents = (
          BigInt(existing.valueCents) + deltaCents > 0n
            ? BigInt(existing.valueCents) + deltaCents
            : 0n
        ).toString();
      } else
        account.holdings.push({
          id: vault!.id,
          name: vault!.name,
          ticker: vault!.ticker,
          units: decimal(vault!.units),
          valueCents: deltaCents.toString(),
          change: "0",
        });
      account.holdings = account.holdings.filter(
        (h) => parseAmount(h.units.replaceAll(",", "")) > 0n,
      );
    }
    account.revision += 1;
    receipt.status = "confirmed";
  }
  return {
    async load() {
      return clone(account);
    },
    async quote(input) {
      if ([...operations.values()].some((o) => o.receipt.status === "pending"))
        throw new TransactionError("Resolve the pending operation before starting another.");
      const quote = {
        ...calculateQuote(account, input),
        id: `quote-${++sequence}`,
        expiresAt: now() + 60_000,
      };
      quotes.set(quote.id, clone(quote));
      return clone(quote);
    },
    async sign(id) {
      validQuote(id);
      if (scenario === "rejection" && !rejected) {
        rejected = true;
        throw new TransactionError("Signing was rejected. Review and try again.", "rejected");
      }
      const authorization = `mock-authorization-${id}`;
      authorizations.add(authorization);
      return authorization;
    },
    async submit(id, authorization, key) {
      const previous = operations.get(key);
      if (previous) {
        if (previous.receipt.quote.id !== id)
          throw new TransactionError("Operation key does not match the quote.");
        return clone(previous.receipt);
      }
      if (quoteKeys.has(id)) throw new TransactionError("This quote has already been submitted.");
      const quote = validQuote(id);
      if (!authorizations.has(authorization) || authorization !== `mock-authorization-${id}`)
        throw new TransactionError("Signing authorization is missing.", "not-submitted");
      if ([...operations.values()].some((o) => o.receipt.status === "pending"))
        throw new TransactionError("Another operation is pending.", "not-submitted");
      if (scenario === "failure" && !failed) {
        failed = true;
        throw new TransactionError(
          "Submission failed before acceptance. Review and retry.",
          "not-submitted",
        );
      }
      const receipt: Receipt = { key, quote: clone(quote), status: "pending" };
      operations.set(key, { receipt, checks: 0 });
      quoteKeys.set(id, key);
      if (scenario === "unknown")
        throw new TransactionError(
          "Submission status is unknown. Check this operation before retrying.",
          "unknown",
        );
      return clone(receipt);
    },
    async status(key) {
      const operation = operations.get(key);
      if (!operation)
        throw new TransactionError(
          "Status is unavailable. Keep this operation and check again.",
          "unknown",
        );
      if (operation.receipt.status === "pending") {
        operation.checks++;
        if (scenario === "settlement-failure") {
          operation.receipt.status = "failed";
          operation.receipt.message = "Operation failed without changing balances.";
        } else if (scenario !== "delayed" || operation.checks >= 2) settle(operation.receipt);
      }
      return clone(operation.receipt);
    },
  };
}
