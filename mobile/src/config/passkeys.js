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

/** Validate Android metadata without requiring Apple signing configuration. */
function validateAndroidIdentity(value = identity) {
  if (value.rpId !== "gizu.io") throw new Error("The frozen passkey RP ID must be gizu.io.");
  if (!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(value.androidPackage)) {
    throw new Error("Supply a valid Android package identifier.");
  }
  if (
    !Array.isArray(value.androidSha256Fingerprints) ||
    value.androidSha256Fingerprints.length === 0 ||
    !value.androidSha256Fingerprints.every((fingerprint) =>
      /^(?:[A-Fa-f0-9]{2}:){31}[A-Fa-f0-9]{2}$/.test(fingerprint),
    )
  ) {
    throw new Error("Supply the Android signing certificate SHA-256 fingerprint.");
  }
  return value;
}

/** @param {string | undefined} mode */
function validatePasskeyMode(mode) {
  if (mode === undefined || mode === "mock") return "mock";
  if (mode === "native-probe") return "native-probe";
  if (mode === "probe") {
    throw new Error(
      "The JavaScript passkey probe was removed. Use mock mode until the native signer is implemented.",
    );
  }
  if (mode !== "native") throw new Error("PASSKEY_MODE must be mock, native-probe or native.");
  return "native";
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
  validateAndroidIdentity,
  validatePasskeyMode,
  associationFiles,
  validateAssociationFiles,
};
