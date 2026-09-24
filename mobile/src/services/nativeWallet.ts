import { requireOptionalNativeModule } from "expo";
import type { AccessService, WalletSession } from "./access";

export interface NativeWalletBridge {
  openWallet(): Promise<unknown>;
  lock(): void;
}
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
export const nativeWalletAccess = createNativeWalletAccess(() =>
  __DEV__ ? requireOptionalNativeModule<NativeWalletBridge>("GizuSigner") : null,
);

export interface WalletBalanceService {
  getBalance(address: string, signal: AbortSignal): Promise<string>;
}
const endpoint = "https://testnet-rpc.monad.xyz";
export const monadBalanceService: WalletBalanceService = {
  async getBalance(address, signal) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) throw new Error("Invalid address");
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener("abort", abort);
    if (signal.aborted) abort();
    const timeout = setTimeout(abort, 12_000);
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify([
          { jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] },
          { jsonrpc: "2.0", id: 2, method: "eth_getBalance", params: [address, "latest"] },
        ]),
      });
      if (!response.ok) throw new Error("Balance unavailable");
      const rows: unknown = await response.json();
      if (!Array.isArray(rows) || rows.length !== 2) throw new Error("Invalid response");
      const chain = rows.find((row) => row?.id === 1);
      const balance = rows.find((row) => row?.id === 2);
      if (
        chain?.jsonrpc !== "2.0" ||
        balance?.jsonrpc !== "2.0" ||
        chain.error ||
        balance.error ||
        chain.result !== "0x279f" ||
        typeof balance.result !== "string" ||
        !/^0x(?:0|[1-9a-f][0-9a-f]{0,63})$/i.test(balance.result)
      )
        throw new Error("Invalid testnet balance");
      return BigInt(balance.result).toString();
    } finally {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abort);
    }
  },
};
export function formatMon(wei: string): string {
  if (!/^(?:0|[1-9][0-9]{0,77})$/.test(wei)) throw new Error("Invalid balance");
  const padded = wei.padStart(19, "0");
  const whole = padded.slice(0, -18);
  const fraction = padded.slice(-18).replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole;
}
