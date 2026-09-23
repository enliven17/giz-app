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
  if (
    !value.androidSha256Fingerprints.length ||
    value.androidSha256Fingerprints.some(
      (fingerprint) => !/^([A-F0-9]{2}:){31}[A-F0-9]{2}$/.test(fingerprint),
    )
  ) {
    throw new Error("Supply real Android signing certificate SHA-256 fingerprints.");
  }
  for (const appId of [value.iosBundleIdentifier, value.androidPackage]) {
    if (!/^[a-zA-Z][\w]*(\.[a-zA-Z][\w]*)+$/.test(appId)) {
      throw new Error("Supply valid signed development app identifiers.");
    }
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
    android: [
      {
        relation: ["delegate_permission/common.get_login_creds"],
        target: {
          namespace: "android_app",
          package_name: value.androidPackage,
          sha256_cert_fingerprints: value.androidSha256Fingerprints,
        },
      },
    ],
  };
}

/** @param {unknown} apple @param {unknown} android */
function validateAssociationFiles(apple, android, value = identity) {
  validateNativeIdentity(value);
  const expected = associationFiles(value);
  const apps = /** @type {{webcredentials?: {apps?: unknown}} | null} */ (apple)?.webcredentials
    ?.apps;
  if (!Array.isArray(apps) || !apps.includes(expected.apple.webcredentials.apps[0])) {
    throw new Error("Apple association does not include this signed development app.");
  }
  const target = expected.android[0]?.target;
  if (!target) throw new Error("Missing expected Android association.");
  if (
    !Array.isArray(android) ||
    !target.sha256_cert_fingerprints.every((fingerprint) =>
      android.some(
        (entry) =>
          entry?.target?.namespace === "android_app" &&
          entry.target.package_name === target.package_name &&
          Array.isArray(entry.relation) &&
          entry.relation.includes("delegate_permission/common.get_login_creds") &&
          Array.isArray(entry.target.sha256_cert_fingerprints) &&
          entry.target.sha256_cert_fingerprints.includes(fingerprint),
      ),
    )
  ) {
    throw new Error(
      "Android association does not include the package, credential relation and all configured signing certificates.",
    );
  }
}

module.exports = {
  identity,
  validateNativeIdentity,
  validatePasskeyMode,
  associationFiles,
  validateAssociationFiles,
};
