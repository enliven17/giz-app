type DebugScreen = "wallet" | "signer" | "ui";

export function resolveDebugScreen(
  screen: string | undefined,
  passkeyMode: "mock" | "native" | "native-probe",
  development: boolean,
): DebugScreen | undefined {
  if (!screen) {
    if (passkeyMode === "native" && !development)
      throw new Error("Native access is development-only.");
    if (passkeyMode === "native-probe") {
      throw new Error(
        "Native harnesses require an explicit debug launch. Use npm run debug:wallet or debug:signer.",
      );
    }
    return undefined;
  }
  if (!development) throw new Error("Debug screens are development-only.");
  if (screen !== "wallet" && screen !== "signer" && screen !== "ui") {
    throw new Error("Unknown debug screen.");
  }
  const expected = screen === "wallet" ? "native" : screen === "signer" ? "native-probe" : "mock";
  if (passkeyMode !== expected) throw new Error("Debug screen and passkey mode do not match.");
  return screen;
}
