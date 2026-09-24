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

test("native modes are explicit and invalid modes cannot silently use demo success", () => {
  expect(validatePasskeyMode(undefined)).toBe("mock");
  expect(validatePasskeyMode("mock")).toBe("mock");
  expect(validatePasskeyMode("native-probe")).toBe("native-probe");
  expect(() => validatePasskeyMode("probe")).toThrow("removed");
  expect(() => validatePasskeyMode("typo")).toThrow("PASSKEY_MODE");
  expect(validatePasskeyMode("native")).toBe("native");
});

test("iOS identity rejects placeholders and RP drift but ignores deferred Android metadata", () => {
  expect(validateNativeIdentity()).toEqual(identity);
  expect(identity.appleTeamId).toBe("588X2UZY3L");
  expect(() =>
    validateNativeIdentity({ ...fixture, appleTeamId: "REPLACE_WITH_APPLE_TEAM_ID" }),
  ).toThrow("Apple Team ID");
  expect(() => validateNativeIdentity({ ...fixture, rpId: "other.gizu.io" })).toThrow("frozen");
  expect(() => validateNativeIdentity({ ...fixture, iosBundleIdentifier: "invalid" })).toThrow(
    "identifier",
  );
  expect(() =>
    validateNativeIdentity({ ...fixture, androidSha256Fingerprints: [], androidPackage: "" }),
  ).not.toThrow();
});

test("native mode selection is independent of mutable identity data", () => {
  const original = { ...identity };
  try {
    Object.assign(identity, fixture);
    expect(validatePasskeyMode("native")).toBe("native");
  } finally {
    Object.assign(identity, original);
  }
});

test("iOS association validation requires the exact team and app entry", () => {
  const files = associationFiles(fixture);
  expect(() => validateAssociationFiles(files.apple, fixture)).not.toThrow();
  for (const invalid of [null, {}, { webcredentials: { apps: ["OTHER.app"] } }]) {
    expect(() => validateAssociationFiles(invalid, fixture)).toThrow("Apple");
  }
});

test("checked-in review templates match the public identity configuration", () => {
  const files = associationFiles();
  const read = (name: string) =>
    JSON.parse(
      readFileSync(resolve(__dirname, "../../docs/passkey-association-templates", name), "utf8"),
    );
  expect(read("apple-app-site-association.json")).toEqual(files.apple);
  expect(files.apple.webcredentials.apps).toEqual(["588X2UZY3L.com.example.gizu.dev"]);
});
