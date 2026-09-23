# Passkey identity and configuration

Current Android scope update: the isolated P1 probe now permits Android API 28+
with valid package/certificate metadata and native passkey support. Real PRF,
signing, lifecycle and recovery acceptance remain pending. Earlier iOS-only and
Android-deferred statements below describe the previous baseline; Android
production support is not established. See [Android setup](ANDROID_SIGNING.md).

Initial release: **iOS only**, as requested on 2026-09-23. Android is deferred.
Android local signing and the frontend association file have since been prepared
at the user's request; see [Android signing](ANDROID_SIGNING.md). Android runtime
support and device acceptance remain deferred. The iOS template/verifier commands
below still handle Apple only and do not generate or validate the Android file.
Apple Team ID `588X2UZY3L` is user supplied and configured in both the shared
identity file and Expo's iOS signing configuration. No credentials were created
and nothing was published during this configuration change.

## Frozen contract

The source of truth is `src/config/passkey-identity.json`:

- RP ID: `gizu.io`, shared by development, production, web and mobile.
- Apple Team ID: `588X2UZY3L`; development bundle: `com.example.gizu.dev`.
  The bundle must be registered/signed under that team with Associated Domains.
  Release identity is still unresolved and production builds remain blocked.
- One EVM account, derivation `mera-evm-v1`: 32-byte PRF entropy → English BIP-39
  mnemonic → seed with empty passphrase → BIP-32 `m/44'/60'/0'/0/0`.
- PRF salt: SHA-256 of UTF-8 `mera.prf.salt.v1`, matching Mera's fixed default.
- Initial native eligibility: iOS 18+ and a PRF-capable provider. Android settings
  retained in the source are deferred scaffolding, not active release requirements.
- Persist metadata only. No PRF, mnemonic, seed or private-key persistence.

Same credential + RP + salt + derivation yields the same address. Development is
not a separate wallet namespace. Use a separately created, unfunded test passkey.
Changing the RP or derivation requires a reviewed recovery/migration strategy.

## Modes and native validation

The default is `EXPO_PUBLIC_PASSKEY_MODE=mock` (the existing investment demo).
`probe` opens the isolated [P1 compatibility screen](MERA_NATIVE_PROBE.md).
`native` integrated access remains unimplemented and fails closed. Unknown modes
also fail at Expo config evaluation and app startup.

The probe requires iOS, a valid Apple Team ID and bundle identifier; it does not
require Android signing metadata. Local validation checks configuration syntax,
not actual ownership, signing or hosting. The native platform enforces association
when a ceremony is attempted. No failure silently becomes mock success.

## Apple association file

Run from `mobile/`:

```sh
npm run passkeys:check
npm run passkeys:templates
npm run passkeys:verify-domain
```

`templates` generates only `docs/passkey-association-templates/apple-app-site-association.json`:

```json
{
  "webcredentials": {
    "apps": ["588X2UZY3L.com.example.gizu.dev"]
  }
}
```

Publish it at `https://gizu.io/.well-known/apple-app-site-association` (without the
`.json` extension). It must return HTTP 200, `application/json`, and no redirect.
Preserve intended existing entries if the domain already serves an association.
The template is outside website public directories and is never auto-published.

`verify-domain` fetches and validates **only the Apple file**. It does not generate
or fetch the separately prepared Android `assetlinks.json`. Its run after adding the
Team ID failed with `fetch failed`; public hosting has not been verified.

Expo declares `webcredentials:gizu.io` and the supplied team. Regenerate/rebuild
the native development client before checking signing and association on a physical
iPhone. Setting a Team ID is not evidence that a matching provisioning profile or
Apple Developer app registration already exists.

## Mock scenario contract

Later integrated access must cover create/open/same-address recovery, fixed-message
signing, cancellation, missing/unsupported PRF, association failure, mismatched
credentials, partial creation, storage failure, duplicate requests and late results.
Use synthetic fixtures and mock only external/native boundaries. Current probe
coverage and native runtime evidence are recorded in [MERA_NATIVE_PROBE.md](MERA_NATIVE_PROBE.md).

## Remaining acceptance gate

Verify the signed iOS app under Team ID `588X2UZY3L`, publish and verify the Apple
association file, then run real create/get/address/signature checks on a supported
physical iPhone. Android native builds, fingerprints, asset links and physical-device
acceptance are deferred; they do not block the initial release.

Verification for this update: TypeScript, lint, Expo config evaluation and all 18
affected configuration/adapter/functional tests passed. Expo resolves Team ID
`588X2UZY3L` and `webcredentials:gizu.io`. The native client was not rebuilt or
provisioned with this team during this update; hosting verification failed to fetch.
