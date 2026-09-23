// @ts-check
// CommonJS is shared by Expo config evaluation, Metro and the Node verification tool.
const identity = require("./passkey-identity.json");

/** Validate public signing metadata before generating or verifying association files. */
function validateNativeIdentity(value = identity) {
  if (value.rpId !== "gizu.io") {
    throw new Error(
      "The frozen passkey RP ID must be gizu.io; domain changes need a migration plan.",
    );
  }
  if (!/^[A-Z0-9]{10}$/.test(value.appleTeamId)) {
    throw new Error(
      "Supply the real Apple Team ID; placeholder configuration cannot enable native passkeys.",
    );
  }
  if (!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(value.iosBundleIdentifier)) {
    throw new Error("Supply a valid signed iOS development app identifier.");
  }
  return value;
}

/** @param {string | undefined} mode */
function validatePasskeyMode(mode) {
  if (mode === undefined || mode === "mock") return "mock";
  // The isolated probe can display missing prerequisites without invoking native APIs.
  if (mode === "probe") return "probe";
  if (mode !== "native") throw new Error("PASSKEY_MODE must be mock, probe or native.");
  validateNativeIdentity();
  // P0 must not enable the existing demo adapter under a native label.
  throw new Error(
    "Native passkey mode is not implemented. Complete the P1 compatibility gate first.",
  );
}

function associationFiles(value = identity) {
  return {
    apple: { webcredentials: { apps: [`${value.appleTeamId}.${value.iosBundleIdentifier}`] } },
  };
}

/** @param {unknown} apple */
function validateAssociationFiles(apple, value = identity) {
  validateNativeIdentity(value);
  const expected = associationFiles(value);
  const apps = /** @type {{webcredentials?: {apps?: unknown}} | null} */ (apple)?.webcredentials
    ?.apps;
  if (!Array.isArray(apps) || !apps.includes(expected.apple.webcredentials.apps[0])) {
    throw new Error("Apple association does not include this signed development app.");
  }
}

module.exports = {
  identity,
  validateNativeIdentity,
  validatePasskeyMode,
  associationFiles,
  validateAssociationFiles,
};
