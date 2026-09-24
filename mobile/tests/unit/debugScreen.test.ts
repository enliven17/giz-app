import { resolveDebugScreen } from "@/config/debugScreen";

test.each([true, false])("normal app has no diagnostic entry (development=%s)", (dev) => {
  expect(resolveDebugScreen(undefined, "mock", dev)).toBeUndefined();
});
test.each([
  ["wallet", "native"],
  ["signer", "native-probe"],
  ["ui", "mock"],
] as const)("explicit %s launch requires development and matching mode", (screen, mode) => {
  expect(resolveDebugScreen(screen, mode, true)).toBe(screen);
  expect(() => resolveDebugScreen(screen, mode, false)).toThrow("development-only");
});
test("stale modes and mismatched debug configuration fail closed", () => {
  expect(() => resolveDebugScreen(undefined, "native", true)).toThrow("explicit debug");
  expect(() => resolveDebugScreen(undefined, "native-probe", true)).toThrow("explicit debug");
  expect(() => resolveDebugScreen("wallet", "mock", true)).toThrow("do not match");
  expect(() => resolveDebugScreen("unknown", "mock", true)).toThrow("Unknown");
});
