import {
  createSecp256k1SigningSession,
  getEvmAddress,
  type Secp256k1SigningSession,
} from "@category-labs/mera";
import { HDKey } from "@scure/bip32";
import { entropyToMnemonic, mnemonicToSeedSync } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english.js";
import { bytesToHex, hashMessage, hexToBytes, recoverMessageAddress } from "viem";
import { identity } from "@/config/passkeys";
import { ProbeError, PROBE_MESSAGE, type ProbeProof, type ProbeWallet } from "@/domain/probeWallet";

// Owns and clears the supplied PRF buffer even when validation/derivation fails.
// No session or secret escapes this function. JS strings/internal library copies
// cannot be reliably erased; this is not hardware-isolated wallet key storage.
export async function deriveProbeWallet(
  prf: Uint8Array,
  credentialId: string,
  expected?: ProbeWallet,
  sign = false,
): Promise<{ wallet: ProbeWallet; proof?: ProbeProof }> {
  let seed: Uint8Array | undefined;
  let root: HDKey | undefined;
  let child: HDKey | undefined;
  let privateKey: Uint8Array | undefined;
  let session: Secp256k1SigningSession | undefined;
  let signature: `0x${string}` | undefined;
  let wallet: ProbeWallet;
  try {
    if (prf.length !== identity.derivation.prfBytes)
      throw new ProbeError("PRF output must be 32 bytes.");
    seed = mnemonicToSeedSync(
      entropyToMnemonic(prf, wordlist),
      identity.derivation.bip39Passphrase,
    );
    prf.fill(0);
    root = HDKey.fromMasterSeed(seed);
    child = root.derive(identity.derivation.path);
    privateKey = child.privateKey ?? undefined;
    if (!privateKey) throw new ProbeError("Wallet derivation failed.");
    session = createSecp256k1SigningSession({ privateKey });
    privateKey.fill(0);
    wallet = {
      credentialId,
      address: getEvmAddress(session.publicKey),
      rpId: identity.rpId,
      derivationVersion: identity.derivation.version,
    };
    if (
      expected &&
      (expected.credentialId !== credentialId ||
        expected.address.toLowerCase() !== wallet.address.toLowerCase())
    ) {
      throw new ProbeError("Selected passkey does not match the remembered test wallet.");
    }
    if (sign) {
      const signed = await session.signDigest(hexToBytes(hashMessage(PROBE_MESSAGE)));
      signature = bytesToHex(new Uint8Array([...signed.compact, signed.recovery + 27]));
    }
  } finally {
    session?.end();
    prf.fill(0);
    seed?.fill(0);
    privateKey?.fill(0);
    child?.wipePrivateData();
    root?.wipePrivateData();
  }
  if (!signature) return { wallet };
  // Separate viem recovery path validates Mera's signature and address, offline.
  const recovered = await recoverMessageAddress({ message: PROBE_MESSAGE, signature });
  if (recovered.toLowerCase() !== wallet.address.toLowerCase())
    throw new ProbeError("Test signature verification failed.");
  return { wallet, proof: { message: PROBE_MESSAGE, signature, verified: true } };
}

// Public all-zero BIP-39 vector, deliberately unrelated to a provider credential.
// This checks Hermes/package compatibility, not the quality of the native CSPRNG
// or passkey support. Never expose this known key as a wallet to fund.
export async function runProbeSelfCheck(): Promise<void> {
  const random = new Uint8Array(32);
  try {
    if (!globalThis.crypto?.getRandomValues)
      throw new ProbeError("Secure randomness is unavailable.");
    globalThis.crypto.getRandomValues(random);
    const result = await deriveProbeWallet(
      new Uint8Array(32),
      "cHVibGljLXRlc3QtdmVjdG9y",
      undefined,
      true,
    );
    if (
      result.wallet.address !== "0xF278cF59F82eDcf871d630F28EcC8056f25C1cdb" ||
      !result.proof?.verified
    ) {
      throw new ProbeError("Offline derivation or signature self-check failed.");
    }
  } finally {
    random.fill(0);
  }
}
