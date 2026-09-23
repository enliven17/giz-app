import { identity } from "@/config/passkeys";
import type { ProbeWallet } from "@/domain/probeWallet";
import type { ProbeCeremonies } from "@/services/meraProbe";
import type { ProbeWalletStorage } from "@/storage/probeWallet";

// Public BIP-39 test vector: 256 zero bits -> 23 'abandon' words + 'art'.
// Never fund this known test key.
export const testProbeWallet: ProbeWallet = {
  credentialId: "bW9jay1jcmVkZW50aWFsLWE",
  address: "0xF278cF59F82eDcf871d630F28EcC8056f25C1cdb",
  rpId: identity.rpId,
  derivationVersion: identity.derivation.version,
};
export function probeBoundaries(initial: ProbeWallet | null = null) {
  let saved = initial;
  const buffers: Uint8Array[] = [];
  function response() {
    const prfOutput = new Uint8Array(32);
    buffers.push(prfOutput);
    return { credentialId: testProbeWallet.credentialId, prfOutput };
  }
  const storage: jest.Mocked<ProbeWalletStorage> = {
    read: jest.fn(async () => saved),
    write: jest.fn(async (wallet) => {
      saved = wallet;
    }),
    remove: jest.fn(async () => {
      saved = null;
    }),
  };
  const ceremonies: jest.Mocked<ProbeCeremonies> = {
    create: jest.fn(async () => response()),
    get: jest.fn(async () => response()),
  };
  return {
    storage,
    ceremonies,
    buffers,
    availability: (): string | null => null,
    isActive: () => true,
  };
}
