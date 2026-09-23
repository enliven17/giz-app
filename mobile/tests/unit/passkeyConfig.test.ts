import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  associationFiles,
  identity,
  validateAssociationFiles,
  validateNativeIdentity,
  validatePasskeyMode,
} from "../../src/config/passkeys";

// Synthetic signing metadata only: not a registered team or certificate.
const fixture = {
  ...identity,
  appleTeamId: "ABCDE12345",
  androidSha256Fingerprints: [Array(32).fill("AB").join(":")],
};

test("freezes shared RP and deterministic account-zero recipe without wallet secrets", () => {
  expect(identity.rpId).toBe("gizu.io");
  expect(identity.sharedWebMobileWallets).toBe(true);
  expect(identity.sharedDevelopmentProductionRp).toBe(true);
  expect(identity.derivation).toEqual({
    version: "mera-evm-v1",
    prfSaltLabel: "mera.prf.salt.v1",
    prfSaltHex: createHash("sha256").update("mera.prf.salt.v1").digest("hex"),
    prfBytes: 32,
    mnemonicLanguage: "english",
    bip39Passphrase: "",
    path: "m/44'/60'/0'/0/0",
    accountIndex: 0,
  });
  expect(identity.minimumPasskeyOs).toEqual({ iosMajor: 18, androidApi: 28 });
});

test("mock is explicit and invalid/native modes cannot silently use demo success", () => {
  expect(validatePasskeyMode(undefined)).toBe("mock");
  expect(validatePasskeyMode("mock")).toBe("mock");
  expect(validatePasskeyMode("probe")).toBe("probe");
  expect(() => validatePasskeyMode("typo")).toThrow("PASSKEY_MODE");
  expect(() => validatePasskeyMode("native")).toThrow("Apple Team ID");
});

test("native metadata rejects placeholders, empty fingerprints and RP drift", () => {
  expect(() => validateNativeIdentity()).toThrow("Apple Team ID");
  expect(() => validateNativeIdentity({ ...fixture, androidSha256Fingerprints: [] })).toThrow(
    "SHA-256",
  );
  expect(() =>
    validateNativeIdentity({ ...fixture, androidSha256Fingerprints: ["placeholder"] }),
  ).toThrow("SHA-256");
  expect(() => validateNativeIdentity({ ...fixture, rpId: "other.gizu.io" })).toThrow("frozen");
  expect(() => validateNativeIdentity({ ...fixture, androidPackage: "invalid" })).toThrow(
    "identifiers",
  );
  expect(validateNativeIdentity(fixture)).toEqual(fixture);
});

test("valid-looking identity still cannot enable an unimplemented native adapter", () => {
  const original = { ...identity };
  try {
    Object.assign(identity, fixture);
    expect(() => validatePasskeyMode("native")).toThrow("not implemented");
  } finally {
    Object.assign(identity, original);
  }
});

test("association validation requires the matching app, relation and every certificate", () => {
  const files = associationFiles(fixture);
  expect(() => validateAssociationFiles(files.apple, files.android, fixture)).not.toThrow();
  for (const invalid of [null, {}, { webcredentials: { apps: ["OTHER.app"] } }]) {
    expect(() => validateAssociationFiles(invalid, files.android, fixture)).toThrow("Apple");
  }
  const entry = files.android[0]!;
  for (const invalid of [
    null,
    {},
    [],
    [{ ...entry, relation: [] }],
    [{ ...entry, target: { ...entry.target, package_name: "wrong.app" } }],
  ]) {
    expect(() => validateAssociationFiles(files.apple, invalid, fixture)).toThrow("Android");
  }
  expect(() =>
    validateAssociationFiles(files.apple, files.android, {
      ...fixture,
      androidSha256Fingerprints: [
        ...fixture.androidSha256Fingerprints,
        Array(32).fill("CD").join(":"),
      ],
    }),
  ).toThrow("Android");
});

test("checked-in review templates match the public identity configuration", () => {
  const files = associationFiles();
  const read = (name: string) =>
    JSON.parse(
      readFileSync(resolve(__dirname, "../../docs/passkey-association-templates", name), "utf8"),
    );
  expect(read("apple-app-site-association.json")).toEqual(files.apple);
  expect(read("assetlinks.json")).toEqual(files.android);
});
