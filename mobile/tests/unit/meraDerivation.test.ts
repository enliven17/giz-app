import { recoverMessageAddress } from "viem";
import { PROBE_MESSAGE } from "@/domain/probeWallet";
import { deriveProbeWallet } from "@/services/meraDerivation";
import { testProbeWallet } from "../support/probe";

test("derives the public BIP39 vector, proves its address and consumes PRF bytes", async () => {
  const prf = new Uint8Array(32);
  const first = await deriveProbeWallet(prf, testProbeWallet.credentialId);
  expect(first.wallet).toEqual(testProbeWallet);
  const result = await deriveProbeWallet(
    new Uint8Array(32),
    testProbeWallet.credentialId,
    first.wallet,
    true,
  );
  expect(result.proof?.verified).toBe(true);
  expect(result.proof?.message).toBe(PROBE_MESSAGE);
  expect(
    await recoverMessageAddress({ message: PROBE_MESSAGE, signature: result.proof!.signature }),
  ).toBe(testProbeWallet.address);
  expect(
    await recoverMessageAddress({
      message: "different message",
      signature: result.proof!.signature,
    }),
  ).not.toBe(testProbeWallet.address);
  expect(Object.keys(result).sort()).toEqual(["proof", "wallet"]);
});

test("clears nonzero secret buffers on success, invalid length and continuity mismatch", async () => {
  const different = new Uint8Array(32).fill(7);
  const result = await deriveProbeWallet(different, "dGVzdA");
  expect(result.wallet.address).not.toBe(testProbeWallet.address);
  expect(different.every((byte) => byte === 0)).toBe(true);
  const invalid = new Uint8Array(12).fill(7);
  await expect(deriveProbeWallet(invalid, "dGVzdA")).rejects.toThrow("32 bytes");
  expect(invalid.every((byte) => byte === 0)).toBe(true);
  const mismatch = new Uint8Array(32).fill(7);
  await expect(
    deriveProbeWallet(mismatch, testProbeWallet.credentialId, testProbeWallet, true),
  ).rejects.toThrow("does not match");
  expect(mismatch.every((byte) => byte === 0)).toBe(true);
});
