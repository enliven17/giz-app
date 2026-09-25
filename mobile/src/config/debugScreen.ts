type DebugScreen = "ui";

export function resolveDebugScreen(
  screen: string | undefined,
  passkeyMode: "mock" | "native",
  development: boolean,
): DebugScreen | undefined {
  if (!screen) {
    if (passkeyMode === "native" && !development)
      throw new Error("Native access is development-only.");
    return undefined;
  }
  if (!development) throw new Error("Debug screens are development-only.");
  if (screen === "wallet" || screen === "signer")
    throw new Error("Legacy signer diagnostics are disconnected from the app.");
  if (screen !== "ui") throw new Error("Unknown debug screen.");
  if (passkeyMode !== "mock") throw new Error("Debug screen and passkey mode do not match.");
  return screen;
}
