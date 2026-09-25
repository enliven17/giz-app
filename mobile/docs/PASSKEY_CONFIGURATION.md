# Passkey identity and configuration

The previous native signer is retained but disconnected. The Android stored-wallet
replacement contract is in [native signer architecture](NATIVE_SIGNER.md); its
runtime is not implemented yet. Wallet access currently reports unavailable.
The frozen derivation below documents the retained module only, not the new wallet
model. App identifiers/domain associations remain valid configuration inputs.
See [Android signing](ANDROID_SIGNING.md) for development association setup and
[verification](NATIVE_SIGNER_VERIFICATION.md) for device evidence and limitations.
Apple Team ID `588X2UZY3L` is configured; production release acceptance remains open.

## Retained signer identity

The source of truth is `src/config/passkey-identity.json`:

- RP ID: `gizu.io`, shared by development, production, web and mobile.
- Apple Team ID: `588X2UZY3L`; development bundle: `com.example.gizu.dev`.
  The bundle must be registered/signed under that team with Associated Domains.
  Release identity is still unresolved and production builds remain blocked.
- One EVM account, derivation `mera-evm-v1`: 32-byte PRF entropy → English BIP-39
  mnemonic → seed with empty passphrase → BIP-32 `m/44'/60'/0'/0/0`.
- PRF salt: SHA-256 of UTF-8 `mera.prf.salt.v1`, matching Mera's fixed default.
- Initial native eligibility: iOS 18+ and a PRF-capable provider. Android probe eligibility is API 28+ with provider support; OS checks alone
  do not establish PRF support or release acceptance.
- Persist metadata only. No PRF, mnemonic, seed or private-key persistence.

Same credential + RP + salt + derivation yields the same address. Development is
not a separate wallet namespace. Use a separately created test passkey; fund only with testnet MON when deliberately
testing transfers.
Changing the RP or derivation requires a reviewed recovery/migration strategy.

## Modes and native validation

The default is `native`, which fails explicitly while the replacement is unavailable.
`npm run start:demo` explicitly selects mock mode. Both `probe` and `native-probe`
and the former wallet/signer debug selections are rejected. Only the UI playground
remains launchable through [README](../README.md).

Configuration alone does not prove domain ownership, installed signing or provider
capability. Rebuild native clients after changing
native code or entitlements. No JavaScript PRF/signing fallback is permitted.

## Domain association deployment

The frontend owns `public/.well-known/apple-app-site-association` and
`public/.well-known/assetlinks.json`. Keep their approved app identities aligned
with the mobile configuration; preserve existing entries when adding identities.
Follow the [hosting guide](../../frontend/docs/PASSKEY_HOSTING.md) for deployment
and manual HTTP/header/content checks. No mobile script generates or publishes them.

For iOS, verify the hosted Apple file includes the configured Team ID and bundle ID.
For Android, verify the package and installed signing certificate fingerprint.
Successful HTTP checks do not establish signed-device or credential-provider support.
Rebuild native clients after changing signing configuration or entitlements.

## Acceptance

Functional tests mock external/native boundaries. Create/open/recovery, unsupported
PRF, cancellation, partial creation, wrong credentials and late callbacks need
provider-aware verification. Current evidence and remaining physical iOS/Android
cases are tracked in [signer verification](NATIVE_SIGNER_VERIFICATION.md).
No device test, hosting check or provisioning action was performed during this
documentation consolidation.
