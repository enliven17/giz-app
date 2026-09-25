// @ts-check
// CommonJS is shared by Expo config evaluation and Metro.
const identity = require("./passkey-identity.json");

/** @param {string | undefined} mode */
function validatePasskeyMode(mode) {
  if (mode === undefined || mode === "mock") return "mock";
  if (mode === "native-probe") throw new Error("Legacy signer diagnostics are disconnected.");
  if (mode === "probe") {
    throw new Error(
      "The JavaScript passkey probe was removed. Use native mode or explicit mock mode.",
    );
  }
  if (mode !== "native") throw new Error("PASSKEY_MODE must be mock or native.");
  return "native";
}

module.exports = { identity, validatePasskeyMode };
