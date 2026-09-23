export type AccessMethod = "Demo passkey";
export type DemoSession = { kind: "demo"; method: AccessMethod; accountId?: string };
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
