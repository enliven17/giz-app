import { identity } from "@/config/passkeys";

export class ProbeError extends Error {}

export type ProbeWallet = {
  credentialId: string;
  address: `0x${string}`;
  rpId: string;
  derivationVersion: string;
};

export function parseProbeWallet(value: unknown): ProbeWallet {
  const item = value as Partial<ProbeWallet> | null;
  if (
    !item ||
    typeof item.credentialId !== "string" ||
    !/^[A-Za-z0-9_-]+$/.test(item.credentialId) ||
    typeof item.address !== "string" ||
    !/^0x[0-9a-fA-F]{40}$/.test(item.address) ||
    item.rpId !== identity.rpId ||
    item.derivationVersion !== identity.derivation.version
  ) {
    throw new Error("Stored probe metadata is invalid or belongs to another derivation.");
  }
  // Explicit projection prevents accidentally persisting SDK results or secrets.
  return {
    credentialId: item.credentialId,
    address: item.address,
    rpId: item.rpId,
    derivationVersion: item.derivationVersion,
  };
}

export const PROBE_MESSAGE =
  "Gizu gizu.io native compatibility test v1. This proves test-key control only. " +
  "It does not authorize authentication, transactions, transfers or spending.";

export type ProbeProof = { message: string; signature: `0x${string}`; verified: true };
export type ProbeResult = { wallet: ProbeWallet; recovered: boolean; proof?: ProbeProof };
