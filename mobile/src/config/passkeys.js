// @ts-check
// CommonJS is shared by Expo config evaluation and Metro.
const identity = require("./passkey-identity.json");

/** @param {string | undefined} mode */
function validatePasskeyMode(mode) {
  if (mode === undefined || mode === "mock") return "mock";
  if (mode === "native-probe") return "native-probe";
  if (mode === "probe") {
    throw new Error(
      "The JavaScript passkey probe was removed. Use native mode or the explicit native-probe diagnostics.",
    );
  }
  if (mode !== "native") throw new Error("PASSKEY_MODE must be mock, native-probe or native.");
  return "native";
}

module.exports = { identity, validatePasskeyMode };
