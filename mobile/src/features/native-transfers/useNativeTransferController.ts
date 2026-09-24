import { useEffect, useRef, useState } from "react";

export type NativeTransfers = {
  executeOperation(proposal: string): Promise<string>;
  getOperationStatus(): Promise<string>;
  cancelOperation(): void;
};
type TransferStatus = { transactionHash: string; status: string };
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
export function useNativeTransferController(service: NativeTransfers | null) {
  const [account, setAccount] = useState("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.001");
  const [count, setCount] = useState("1");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    "Testnet MON only. Native review is required before signing.",
  );
  const [results, setResults] = useState<TransferStatus[]>([]);
  const running = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      service?.cancelOperation();
    };
  }, [service]);
  async function run(refresh: boolean) {
    if (!service || running.current) return;
    let proposal = "";
    if (!refresh) {
      try {
        proposal = transferProposal(account, recipient.trim(), amount.trim(), count);
      } catch {
        setMessage(
          "Enter account 0–15, a full recipient address, and an amount above 0 up to 0.1 MON, and 1–16 transfers totaling at most 1 MON.",
        );
        return;
      }
    }
    running.current = true;
    setBusy(true);
    try {
      const result = await (refresh
        ? service.getOperationStatus()
        : service.executeOperation(proposal));
      const statuses = parseNativeStatus(result);
      if (mounted.current) {
        setResults(statuses);
        setMessage(
          statuses.length
            ? "Native transaction status below. Pending or unknown transfers must be reconciled before retrying."
            : "No native transfers recorded.",
        );
      }
    } catch {
      if (mounted.current)
        setMessage(
          "Operation stopped or unavailable. Refresh native status before retrying. Check testnet funds and connectivity; submitted transfers cannot be undone.",
        );
    } finally {
      running.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  return {
    account,
    setAccount,
    recipient,
    setRecipient,
    amount,
    setAmount,
    count,
    setCount,
    busy,
    message,
    results,
    review: () => run(false),
    refresh: () => run(true),
  };
}
