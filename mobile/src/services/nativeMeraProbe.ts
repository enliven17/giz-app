import { createPasskeyWithPrfOutput, getPasskeyPrfOutput, isMeraError } from "@category-labs/mera";
import { reactNativeWebAuthnClient } from "@category-labs/mera/react-native-webauthn-client";
import { AppState, Platform } from "react-native";
import { Passkey } from "react-native-passkey";
import { hexToBytes } from "viem";
import { identity, validateAndroidIdentity, validateNativeIdentity } from "@/config/passkeys";
import { ProbeError } from "@/domain/probeWallet";
import { probeWalletStorage } from "@/storage/probeWallet";
import { createMeraProbeService } from "./meraProbe";

export function probeAvailability(): string | null {
  if (!__DEV__) return "The passkey probe is available only in a native development build.";
  if (Platform.OS !== "ios" && Platform.OS !== "android")
    return "The native passkey probe supports iOS and Android only.";
  const android = Platform.OS === "android";
  const version = Number.parseInt(String(Platform.Version), 10);
  const minimum = android
    ? identity.minimumPasskeyOs.androidApi
    : identity.minimumPasskeyOs.iosMajor;
  if (!Number.isFinite(version) || version < minimum)
    return android
      ? "Native passkeys require Android 9+ (API 28+) and a PRF-capable provider."
      : "Native passkeys require iOS 18+ and a PRF-capable provider.";
  try {
    if (android) validateAndroidIdentity();
    else validateNativeIdentity();
  } catch {
    return android
      ? "Blocked: configure a valid Android package and signing certificate SHA-256 fingerprint."
      : "Blocked: configure a valid Apple Team ID and iOS bundle identifier.";
  }
  if (!Passkey.isSupported()) return "This device does not support native passkeys.";
  return null;
}

export function describeNativeFailure(error: unknown): ProbeError {
  if (isMeraError(error)) {
    if (error.code === "PRF_UNAVAILABLE")
      return new ProbeError(
        "This provider did not return usable PRF output. A passkey may already exist; try opening it with a supported provider.",
      );
    if (error.code === "CRYPTO_UNAVAILABLE")
      return new ProbeError(
        "Secure native randomness is unavailable. Rebuild the development client.",
      );
    const cause = error.cause as { error?: unknown } | undefined;
    if (cause?.error === "UserCancelled")
      return new ProbeError(
        "Passkey request cancelled. If creation had started, try opening the existing passkey.",
      );
    if (cause?.error === "NoCredentials")
      return new ProbeError(
        "No matching passkey was supplied by this provider. Check credential sync and selection.",
      );
    if (cause?.error === "NotSupported")
      return new ProbeError("The selected passkey provider is unsupported.");
  }
  // Never display or log SDK/native error payloads; association errors can also
  // masquerade as no-credential failures in the native library.
  return new ProbeError(
    "The native request failed. Check domain associations and provider support. If creation had started, open the existing passkey before creating another.",
  );
}

async function ceremony<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw describeNativeFailure(error);
  }
}

// Face ID/system sheets can briefly mark iOS inactive. Wait for the real active
// event; a full background transition or timeout abandons the operation.
export async function waitForProbeForeground(): Promise<void> {
  if (AppState.currentState === "active") return;
  if (AppState.currentState === "background" && Platform.OS !== "android")
    throw new ProbeError("Probe abandoned while the app was in the background.");
  await new Promise<void>((resolve, reject) => {
    const finish = (active: boolean) => {
      clearTimeout(timer);
      subscription.remove();
      if (active) resolve();
      else reject(new ProbeError("Return to the app and retry after the system prompt closes."));
    };
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active" || (state === "background" && Platform.OS !== "android"))
        finish(state === "active");
    });
    const timer = setTimeout(() => finish(false), 5000);
  });
}

export const nativeMeraProbe = createMeraProbeService({
  availability: probeAvailability,
  isActive: () => AppState.currentState === "active",
  waitForForeground: waitForProbeForeground,
  storage: probeWalletStorage,
  ceremonies: {
    create: () =>
      ceremony(() =>
        createPasskeyWithPrfOutput({
          rp: { id: identity.rpId, name: identity.rpName },
          user: { name: "gizu-native-test", displayName: "Gizu native compatibility test" },
          prfSalt: hexToBytes(`0x${identity.derivation.prfSaltHex}`),
          webAuthnClient: reactNativeWebAuthnClient,
        }),
      ),
    get: (credentialId) =>
      ceremony(() =>
        getPasskeyPrfOutput({
          rpId: identity.rpId,
          credential: credentialId ? { credentialId } : undefined,
          prfSalt: hexToBytes(`0x${identity.derivation.prfSaltHex}`),
          webAuthnClient: reactNativeWebAuthnClient,
        }),
      ),
  },
});
