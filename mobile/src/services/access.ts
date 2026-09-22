export const walletProviders = ["MetaMask", "Rainbow", "Ledger", "WalletConnect"] as const;
export type AccessMethod = "Demo passkey" | (typeof walletProviders)[number];
export type DemoSession = { kind: "demo"; method: AccessMethod };
export interface AccessService {
  request(method: AccessMethod): Promise<DemoSession>;
}
export class AccessRejectedError extends Error {}
// No device credentials, network calls or signing. Session lasts only in memory.
export const demoAccessService: AccessService = {
  async request(method) {
    return { kind: "demo", method };
  },
};
