import { resolveDebugScreen } from "@/config/debugScreen";

test.each([true, false])("normal app has no diagnostic entry (development=%s)", (dev) => {
  expect(resolveDebugScreen(undefined, "mock", dev)).toBeUndefined();
});
test.each([
  ["ui", "mock"],
  ["stored-wallet", "native"],
] as const)("explicit %s launch requires development and matching mode", (screen, mode) => {
  expect(resolveDebugScreen(screen, mode, true)).toBe(screen);
  expect(() => resolveDebugScreen(screen, mode, false)).toThrow("development-only");
});
test("stale modes and mismatched debug configuration fail closed", () => {
  expect(resolveDebugScreen(undefined, "native", true)).toBeUndefined();
  expect(() => resolveDebugScreen(undefined, "native", false)).toThrow("development-only");
  expect(() => resolveDebugScreen("signer", "native", true)).toThrow("disconnected");
  expect(() => resolveDebugScreen("wallet", "mock", true)).toThrow("disconnected");
  expect(() => resolveDebugScreen("unknown", "mock", true)).toThrow("Unknown");
});
