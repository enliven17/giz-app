import { webcrypto } from "node:crypto";
import { AppState, Platform } from "react-native";
import { Passkey } from "react-native-passkey";
import * as SecureStore from "expo-secure-store";
import { MeraError } from "@category-labs/mera";
import { identity } from "@/config/passkeys";
import {
  describeNativeFailure,
  nativeMeraProbe,
  probeAvailability,
  waitForProbeForeground,
} from "@/services/nativeMeraProbe";
import { probeWalletStorage } from "@/storage/probeWallet";
import { testProbeWallet } from "../support/probe";

const original = { ...identity };
const os = Object.getOwnPropertyDescriptor(Platform, "OS")!;
const version = Object.getOwnPropertyDescriptor(Platform, "Version")!;
const appState = Object.getOwnPropertyDescriptor(AppState, "currentState")!;
const crypto = Object.getOwnPropertyDescriptor(globalThis, "crypto");
beforeEach(() => {
  Object.defineProperty(globalThis, "crypto", { value: webcrypto, configurable: true });
  Object.defineProperty(Platform, "OS", { value: "ios", configurable: true });
  Object.defineProperty(Platform, "Version", { value: "18.0", configurable: true });
  Object.defineProperty(AppState, "currentState", { value: "active", configurable: true });
  Object.assign(identity, {
    appleTeamId: "ABCDE12345",
    androidSha256Fingerprints: [Array(32).fill("AB").join(":")],
  });
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(null);
  jest.mocked(SecureStore.setItemAsync).mockResolvedValue();
  jest.mocked(SecureStore.deleteItemAsync).mockResolvedValue();
});
afterEach(() => {
  Object.assign(identity, original);
  Object.defineProperty(Platform, "OS", os);
  Object.defineProperty(Platform, "Version", version);
  Object.defineProperty(AppState, "currentState", appState);
  if (crypto) Object.defineProperty(globalThis, "crypto", crypto);
  jest.useRealTimers();
});

test("real SDK and native adapter carry the frozen RP, salt and user-verification requirements", async () => {
  jest.mocked(Passkey.createPlatformKey).mockResolvedValue({
    id: testProbeWallet.credentialId,
    rawId: testProbeWallet.credentialId,
    response: { clientDataJSON: "", attestationObject: "" },
    clientExtensionResults: { prf: { enabled: true, results: { first: new Uint8Array(32) } } },
  });
  expect(probeAvailability()).toBeNull();
  const created = await nativeMeraProbe.run("create");
  expect(created.wallet).toEqual(testProbeWallet);
  expect(Passkey.createPlatformKey).toHaveBeenCalledWith(
    expect.objectContaining({
      rp: { id: "gizu.io", name: "Gizu" },
      authenticatorSelection: expect.objectContaining({
        userVerification: "required",
        residentKey: "required",
      }),
      extensions: { prf: { eval: { first: expect.any(Uint8Array) } } },
    }),
  );
  const request = jest.mocked(Passkey.createPlatformKey).mock.calls[0]![0];
  expect(Buffer.from(request.extensions!.prf!.eval!.first as Uint8Array).toString("hex")).toBe(
    identity.derivation.prfSaltHex,
  );
  const persisted = jest.mocked(SecureStore.setItemAsync).mock.calls[0]![1];
  expect(JSON.parse(persisted)).toEqual(testProbeWallet);
  jest.mocked(SecureStore.getItemAsync).mockResolvedValue(persisted);
  jest.mocked(Passkey.getPlatformKey).mockResolvedValue({
    id: testProbeWallet.credentialId,
    rawId: testProbeWallet.credentialId,
    response: { authenticatorData: "", clientDataJSON: "", signature: "" },
    clientExtensionResults: { prf: { results: { first: new Uint8Array(32) } } },
  });
  expect((await nativeMeraProbe.run("sign")).proof?.verified).toBe(true);
  expect(Passkey.getPlatformKey).toHaveBeenCalledWith(
    expect.objectContaining({
      rpId: "gizu.io",
      userVerification: "required",
      allowCredentials: [{ id: testProbeWallet.credentialId, type: "public-key" }],
    }),
  );
});

test("unsupported PRF and cancellation are sanitized through the actual SDK wrapper", async () => {
  jest
    .mocked(Passkey.getPlatformKey)
    .mockRejectedValueOnce({ error: "UserCancelled", message: "SENSITIVE_PROVIDER_DETAILS" });
  await expect(nativeMeraProbe.run("open")).rejects.toThrow("cancelled");
  jest.mocked(Passkey.getPlatformKey).mockResolvedValueOnce({
    id: testProbeWallet.credentialId,
    response: { authenticatorData: "", clientDataJSON: "", signature: "" },
  });
  await expect(nativeMeraProbe.run("open")).rejects.toThrow("PRF output");
  expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
});

test("metadata storage rejects corrupt or mismatched records and strips extra fields", async () => {
  await probeWalletStorage.write({
    ...testProbeWallet,
    privateKey: "NEVER_PERSIST",
  } as typeof testProbeWallet);
  expect(JSON.parse(jest.mocked(SecureStore.setItemAsync).mock.calls[0]![1])).toEqual(
    testProbeWallet,
  );
  for (const raw of [
    "not json",
    "null",
    JSON.stringify({ ...testProbeWallet, rpId: "other.io" }),
  ]) {
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(raw);
    await expect(probeWalletStorage.read()).rejects.toThrow();
  }
  await probeWalletStorage.remove();
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("gizu.mera.probe.metadata.v1");
});

test("eligibility blocks old OS and placeholder identity before native requests", () => {
  Object.defineProperty(Platform, "Version", { value: "17.5", configurable: true });
  expect(probeAvailability()).toContain("iOS 18+");
  Object.defineProperty(Platform, "Version", { value: "18.0", configurable: true });
  identity.appleTeamId = "REPLACE_WITH_APPLE_TEAM_ID";
  expect(probeAvailability()).toContain("Blocked");
  expect(Passkey.createPlatformKey).not.toHaveBeenCalled();
});

test("error mapping never returns provider payloads", () => {
  for (const code of ["NoCredentials", "NotSupported", "RequestFailed"]) {
    const error = new MeraError("PASSKEY_OPERATION_FAILED", "SENSITIVE", {
      cause: { error: code, message: "SENSITIVE" },
    });
    expect(describeNativeFailure(error).message).not.toContain("SENSITIVE");
  }
  expect(describeNativeFailure(new MeraError("CRYPTO_UNAVAILABLE", "SENSITIVE")).message).toContain(
    "randomness",
  );
  expect(describeNativeFailure({ arbitrary: "SENSITIVE" }).message).not.toContain("SENSITIVE");
});

test("system-sheet inactive transition waits for active; background and timeout fail closed", async () => {
  jest.useFakeTimers();
  Object.defineProperty(AppState, "currentState", { value: "inactive", configurable: true });
  let listener: (state: "active" | "background") => void = () => {};
  const remove = jest.fn();
  const spy = jest.spyOn(AppState, "addEventListener").mockImplementation((_type, callback) => {
    listener = callback;
    return { remove };
  });
  try {
    const active = waitForProbeForeground();
    listener("active");
    await expect(active).resolves.toBeUndefined();
    expect(remove).toHaveBeenCalledTimes(1);
    const background = waitForProbeForeground();
    const rejected = expect(background).rejects.toThrow("Return to the app");
    listener("background");
    await rejected;
    const timedOut = waitForProbeForeground();
    const timeout = expect(timedOut).rejects.toThrow("Return to the app");
    jest.advanceTimersByTime(5000);
    await timeout;
  } finally {
    spy.mockRestore();
  }
});

test("iOS eligibility does not require Android signing metadata; Android is deferred", () => {
  identity.androidSha256Fingerprints = [];
  expect(probeAvailability()).toBeNull();
  Object.defineProperty(Platform, "OS", { value: "android", configurable: true });
  expect(probeAvailability()).toContain("Android is deferred");
  expect(Passkey.createPlatformKey).not.toHaveBeenCalled();
});
