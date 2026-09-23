const { mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");
const {
  identity,
  validateNativeIdentity,
  validatePasskeyMode,
  associationFiles,
  validateAssociationFiles,
} = require("../src/config/passkeys");

async function readAssociation(name) {
  const response = await fetch(`https://${identity.rpId}/.well-known/${name}`, {
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (
    response.status !== 200 ||
    response.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() !== "application/json"
  ) {
    throw new Error(`${name} must return HTTP 200 and application/json without redirects.`);
  }
  return response.json();
}

async function main() {
  const command = process.argv[2];
  if (command === "check") {
    const mode = validatePasskeyMode(process.env.EXPO_PUBLIC_PASSKEY_MODE);
    console.log(`RP: ${identity.rpId}; mode: ${mode}; derivation: ${identity.derivation.version}`);
    console.log(
      "Native acceptance remains blocked by P0 signing/hosting inputs and P1 device checks.",
    );
  } else if (command === "templates") {
    const files = associationFiles();
    const destination = resolve(__dirname, "../docs/passkey-association-templates");
    mkdirSync(destination, { recursive: true });
    writeFileSync(
      resolve(destination, "apple-app-site-association.json"),
      `${JSON.stringify(files.apple, null, 2)}\n`,
    );
    writeFileSync(
      resolve(destination, "assetlinks.json"),
      `${JSON.stringify(files.android, null, 2)}\n`,
    );
    console.log("Wrote review templates only. Nothing published; placeholders are nonfunctional.");
  } else if (command === "verify-domain") {
    validateNativeIdentity();
    const [apple, android] = await Promise.all([
      readAssociation("apple-app-site-association"),
      readAssociation("assetlinks.json"),
    ]);
    validateAssociationFiles(apple, android);
    console.log(
      "Hosted association files match configured development identities. Signed-device verification is still required.",
    );
  } else {
    throw new Error("Expected check, templates or verify-domain.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Passkey configuration check failed.");
  process.exitCode = 1;
});
