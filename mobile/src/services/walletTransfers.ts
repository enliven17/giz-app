import { requireOptionalNativeModule } from "expo";
import {
  parseNativeStatus,
  transferProposal,
  type NativeTransfers,
} from "@/domain/nativeTransfers";
export type WalletTransfer = {
  transactionHash: string;
  status: string;
  nonce: string;
  to?: string;
  valueWei?: string;
};
export type WalletHistory = { entries: WalletTransfer[]; blocked: boolean };
export interface WalletTransferService {
  history(address: string): Promise<WalletHistory>;
  send(address: string, recipient: string, amount: string): Promise<WalletHistory>;
  cancel(): void;
}
const addressPattern = /^0x[0-9a-f]{40}$/i;
export function walletHistory(value: string, address: string): WalletHistory {
  if (!addressPattern.test(address)) throw new Error("Invalid wallet");
  const statuses = parseNativeStatus(value);
  const rows = JSON.parse(value) as Record<string, unknown>[];
  const entries: WalletTransfer[] = [];
  const hashes = new Set<string>();
  rows.forEach((row, index) => {
    if (
      typeof row.from !== "string" ||
      !addressPattern.test(row.from) ||
      row.chainId !== 10143 ||
      typeof row.nonce !== "string" ||
      !/^(?:0|[1-9][0-9]{0,19})$/.test(row.nonce)
    )
      throw new Error("Invalid journal");
    const status = statuses[index];
    if (!status) throw new Error("Missing journal status");
    if (hashes.has(status.transactionHash.toLowerCase()))
      throw new Error("Duplicate journal entry");
    hashes.add(status.transactionHash.toLowerCase());
    if (row.from.toLowerCase() !== address.toLowerCase()) return;
    const entry: WalletTransfer = { ...status, nonce: row.nonce };
    // Existing records predate detail storage. Never invent their amounts/recipients.
    if (row.to !== undefined || row.valueWei !== undefined) {
      if (
        typeof row.to !== "string" ||
        !addressPattern.test(row.to) ||
        typeof row.valueWei !== "string" ||
        !/^[1-9][0-9]{0,17}$/.test(row.valueWei)
      )
        throw new Error("Invalid transfer details");
      entry.to = row.to;
      entry.valueWei = row.valueWei;
    }
    entries.push(entry);
  });
  return {
    entries: entries.reverse(),
    // Native signing conservatively blocks while ANY local operation is unresolved.
    blocked: statuses.some((row) => row.status === "pending" || row.status === "unknown"),
  };
}
export function createWalletTransfers(
  getBridge: () => NativeTransfers | null,
): WalletTransferService {
  function bridge() {
    const native = getBridge();
    if (!native?.executeOperation || !native.getOperationStatus)
      throw new Error("Native transfers unavailable");
    return native;
  }
  return {
    async history(address) {
      return walletHistory(await bridge().getOperationStatus(), address);
    },
    async send(address, recipient, amount) {
      if (!addressPattern.test(address)) throw new Error("Invalid wallet");
      const proposal = JSON.parse(transferProposal("0", recipient, amount));
      proposal.transfers[0].expectedFrom = address;
      return walletHistory(await bridge().executeOperation(JSON.stringify(proposal)), address);
    },
    cancel() {
      getBridge()?.cancelOperation();
    },
  };
}
export const nativeWalletTransfers = createWalletTransfers(() =>
  __DEV__ ? requireOptionalNativeModule<NativeTransfers>("GizuSigner") : null,
);
