import type { StoredSignerCapabilities } from "@/domain/wallet/storedSigner";
import { Platform } from "react-native";

export interface NativeWalletBridge {
  openWallet(): Promise<unknown>;
  lock(): void;
}
export type NativeTransfers = {
  executeOperation(proposal: string): Promise<string>;
  getOperationStatus(): Promise<string>;
  cancelOperation(): void;
};
export type NativeSignerBridge = NativeWalletBridge & NativeTransfers;

/** Public results only. Keys, PRF and authorization remain inside the native module. */
export function getNativeSigner(): NativeSignerBridge | null {
  // Phase 1: no legacy lookup or fallback, including in previously installed clients.
  return null;
}

export function getSignerCapabilities(): StoredSignerCapabilities {
  return {
    contractVersion: 1,
    available: false,
    reason:
      Platform.OS === "android" ? ("notImplemented" as const) : ("unsupportedPlatform" as const),
  };
}
export class WalletUnavailableError extends Error {
  constructor() {
    super(
      getSignerCapabilities().reason === "unsupportedPlatform"
        ? "Wallet access is unavailable on this platform. The replacement signer targets Android."
        : "Wallet access is temporarily unavailable while the new signer is being implemented.",
    );
  }
}
