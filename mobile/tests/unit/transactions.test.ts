import {
  calculateQuote,
  decimal,
  maximum,
  NETWORK_FEE,
  parseAmount,
  tradeFee,
} from "@/domain/transactions";
import { createMockTransactionService } from "@/services/transactions";

test.each([
  "",
  " ",
  "-1",
  "+1",
  "1e3",
  "1,000",
  ".5",
  "1.",
  "1.2345678",
  "1..2",
  "NaN",
  "00",
  "1234567890123456789",
])("rejects ambiguous amount %s", (value) => {
  expect(() => parseAmount(value)).toThrow();
});
test("six-decimal amounts round trip without floating-point loss", () => {
  for (const value of ["0", "0.000001", "184204.000001", "999999999999999999.999999"])
    expect(decimal(parseAmount(value))).toBe(value);
});
test("Max reserves rounded-up trade fees and percentages never exceed Max", async () => {
  const account = await createMockTransactionService().load();
  const input = { kind: "buy" as const, vaultId: "helix" };
  const max = maximum(account, input);
  expect(max + tradeFee(max) + NETWORK_FEE).toBeLessThanOrEqual(BigInt(account.cash));
  expect(max + 1n + tradeFee(max + 1n) + NETWORK_FEE).toBeGreaterThan(BigInt(account.cash));
  expect(calculateQuote(account, { ...input, amount: decimal(max) }).debit).toBe(account.cash);
  expect(maximum(account, { kind: "deposit" })).toBe(BigInt(account.wallet) - NETWORK_FEE);
  expect(maximum({ ...account, cash: "1" }, { kind: "withdraw" })).toBe(0n);
});
test("validates minima, available balances, locked units and net positive output", async () => {
  const account = await createMockTransactionService().load();
  expect(() => calculateQuote(account, { kind: "buy", vaultId: "helix", amount: "24999" })).toThrow(
    "Minimum purchase",
  );
  expect(() => calculateQuote(account, { kind: "sell", vaultId: "obsidian", amount: "1" })).toThrow(
    "No unlocked",
  );
  expect(() =>
    calculateQuote(account, { kind: "sell", vaultId: "vertex", amount: "0.000001" }),
  ).toThrow("too small");
  expect(() => calculateQuote(account, { kind: "deposit", amount: "42180" })).toThrow("exceeds");
  expect(() => calculateQuote(account, { kind: "withdraw", amount: "0" })).toThrow(
    "greater than zero",
  );
  expect(() =>
    calculateQuote(account, { kind: "buy", vaultId: "missing", amount: "30000" }),
  ).toThrow("Choose an available");
});
