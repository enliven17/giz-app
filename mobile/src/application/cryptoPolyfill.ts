import { getRandomValues } from "expo-crypto";

// Must run before Mera/noble module evaluation. Never substitute Math.random.
if (typeof globalThis.crypto?.getRandomValues !== "function") {
  if (!globalThis.crypto) {
    Object.defineProperty(globalThis, "crypto", { value: {}, configurable: true });
  }
  Object.defineProperty(globalThis.crypto, "getRandomValues", {
    value: getRandomValues,
    configurable: true,
  });
}
