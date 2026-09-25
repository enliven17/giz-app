import type { StoredOperation } from "@/domain/wallet/storedSigner";
import type { WalletHistory, WalletTransferService } from "@/domain/wallet/types";
import { transferProposal, walletAddressPattern } from "@/domain/wallet/transfers";
import { getStoredTransferSigner, type StoredTransferBridge } from "./nativeBridge";

/** Only explicitly allowed public fields survive the native boundary. */
export function storedHistory(input: unknown, walletId: string, address: string): WalletHistory {
  if (!Array.isArray(input) || input.length > 256 || !walletAddressPattern.test(address))
    throw new Error("Invalid operation history");
  const ids = new Set<string>();
  const operations: StoredOperation[] = input.map((value) => {
    if (!value || typeof value !== "object") throw new Error("Invalid operation");
    const o = value as Record<string, unknown>;
    if (
      typeof o.operationId !== "string" ||
      !/^[0-9a-f-]{36}$/i.test(o.operationId) ||
      ids.has(o.operationId) ||
      o.walletId !== walletId ||
      !Number.isSafeInteger(o.revision) ||
      (o.revision as number) < 1 ||
      typeof o.canResume !== "boolean" ||
      typeof o.blocked !== "boolean" ||
      !["running", "needsAuthorization", "needsReview", "completed", "cancelled"].includes(
        o.status as string,
      ) ||
      !Array.isArray(o.steps) ||
      o.steps.length < 1 ||
      o.steps.length > 32
    )
      throw new Error("Invalid operation");
    ids.add(o.operationId);
    const steps: StoredOperation["steps"] = o.steps.map((s, index) => {
      if (
        !s ||
        s.index !== index ||
        !Number.isInteger(s.accountIndex) ||
        s.accountIndex < 0 ||
        s.accountIndex > 15 ||
        typeof s.from !== "string" ||
        !walletAddressPattern.test(s.from) ||
        typeof s.to !== "string" ||
        !walletAddressPattern.test(s.to) ||
        typeof s.valueWei !== "string" ||
        !/^[1-9][0-9]{0,17}$/.test(s.valueWei) ||
        BigInt(s.valueWei) > 100000000000000000n ||
        !["planned", "signed", "pending", "unknown", "finalized", "reverted"].includes(s.status)
      )
        throw new Error("Invalid step");
      if (
        s.status !== "planned" &&
        (typeof s.transactionHash !== "string" || !/^0x[0-9a-f]{64}$/i.test(s.transactionHash))
      )
        throw new Error("Missing transaction hash");
      if (s.status !== "planned" && s.nonce === undefined) throw new Error("Missing nonce");
      if (
        s.nonce !== undefined &&
        (typeof s.nonce !== "string" || !/^(0|[1-9][0-9]{0,19})$/.test(s.nonce))
      )
        throw new Error("Invalid nonce");
      return {
        index,
        accountIndex: s.accountIndex,
        from: s.from,
        to: s.to,
        valueWei: s.valueWei,
        status: s.status,
        ...(s.status !== "planned" ? { transactionHash: s.transactionHash } : {}),
        ...(s.nonce !== undefined ? { nonce: s.nonce } : {}),
        nonceConflict: s.nonceConflict === true,
      };
    });
    return {
      operationId: o.operationId,
      walletId,
      revision: o.revision as number,
      status: o.status as StoredOperation["status"],
      canResume: o.canResume,
      blocked: o.blocked,
      steps,
    };
  });
  return {
    operations: operations.slice().reverse(),
    blocked: operations.some((o) => o.blocked),
    entries: operations
      .flatMap((o) =>
        o.steps
          .filter((s) => s.transactionHash && s.from.toLowerCase() === address.toLowerCase())
          .map((s) => ({
            transactionHash: s.transactionHash!,
            status: s.status,
            nonce: s.nonce!,
            to: s.to,
            valueWei: s.valueWei,
          })),
      )
      .reverse(),
  };
}
export function createStoredTransfers(
  walletId: string,
  getBridge: () => StoredTransferBridge | null = getStoredTransferSigner,
): WalletTransferService {
  function native() {
    const bridge = getBridge();
    if (!bridge) throw new Error("Native transfers unavailable");
    return bridge;
  }
  async function history(address: string) {
    return storedHistory(await native().listOperations(), walletId, address);
  }
  return {
    history,
    async send(address, recipient, amount) {
      if (!walletAddressPattern.test(address)) throw new Error("Invalid wallet");
      const p = JSON.parse(transferProposal("0", recipient, amount));
      p.transfers[0].expectedFrom = address;
      await native().executeOperation({ walletId, chainId: 10143, transfers: p.transfers });
      return history(address);
    },
    async resume(address, operationId, revision) {
      await native().resumeOperation(operationId, revision);
      return history(address);
    },
    async cancelOperation(address, operationId) {
      await native().cancelOperation(operationId);
      return history(address);
    },
    cancel() {
      getBridge()?.lock();
    },
  };
}
