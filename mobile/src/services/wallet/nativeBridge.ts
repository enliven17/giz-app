import { requireOptionalNativeModule } from "expo";

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
  return __DEV__ ? requireOptionalNativeModule<NativeSignerBridge>("GizuSigner") : null;
}
