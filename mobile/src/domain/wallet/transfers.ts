export const walletAddressPattern = /^0x[0-9a-f]{40}$/i;
export type TransferStatus = { transactionHash: string; status: string };
export function parseNativeStatus(value: string): TransferStatus[] {
  const rows: unknown = JSON.parse(value);
  if (!Array.isArray(rows) || rows.length > 256) throw new Error("Invalid native status");
  return rows.map((row: unknown) => {
    if (!row || typeof row !== "object") throw new Error("Invalid native status");
    const record = row as Record<string, unknown>;
    if (
      typeof record.transactionHash !== "string" ||
      !/^0x[0-9a-f]{64}$/i.test(record.transactionHash) ||
      typeof record.status !== "string" ||
      !["unknown", "pending", "finalized", "reverted"].includes(record.status)
    )
      throw new Error("Invalid native status");
    return { transactionHash: record.transactionHash, status: record.status };
  });
}
export function transferProposal(
  index: string,
  recipient: string,
  amount: string,
  count = "1",
): string {
  if (
    !/^(?:[0-9]|1[0-5])$/.test(index) ||
    !/^0x[0-9a-fA-F]{40}$/.test(recipient) ||
    !/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,18})?$/.test(amount) ||
    amount.length > 40 ||
    !/^(?:[1-9]|1[0-6])$/.test(count)
  )
    throw new Error("Invalid transfer");
  const [whole = "0", fraction = ""] = amount.split(".");
  const value = BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, "0"));
  if (value <= 0n || value > 10n ** 17n) throw new Error("Invalid transfer");
  if (value * BigInt(count) > 10n ** 18n) throw new Error("Invalid batch total");
  return JSON.stringify({
    kind: "nativeTransfers",
    chainId: 10143,
    transfers: Array.from({ length: Number(count) }, () => ({
      accountIndex: Number(index),
      to: recipient,
      valueWei: value.toString(),
    })),
  });
}
