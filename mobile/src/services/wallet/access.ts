import type { AccessService, WalletSession } from "../access";
import { getNativeSigner, type NativeWalletBridge } from "./nativeBridge";

export function createNativeWalletAccess(
  getBridge: () => NativeWalletBridge | null,
): AccessService {
  return {
    method: "Passkey",
    async request() {
      const bridge = getBridge();
      if (!bridge?.openWallet) throw new Error("Native wallet unavailable");
      const result = await bridge.openWallet();
      if (!result || typeof result !== "object") throw new Error("Invalid native wallet");
      const wallet = result as Record<string, unknown>;
      if (
        typeof wallet.address !== "string" ||
        !/^0x[0-9a-fA-F]{40}$/.test(wallet.address) ||
        wallet.accountIndex !== 0 ||
        wallet.chainId !== 10143
      )
        throw new Error("Invalid native wallet");
      // Explicit public allowlist. No credential IDs, signatures or native payload retained.
      return {
        kind: "testnet",
        method: "Passkey",
        accountId: wallet.address.toLowerCase(),
        address: wallet.address,
        accountIndex: 0,
        chainId: 10143,
      } satisfies WalletSession;
    },
    cancel() {
      getBridge()?.lock();
    },
  };
}
export const nativeWalletAccess = createNativeWalletAccess(getNativeSigner);
