# P0 — Passkey identity and configuration

P0 local implementation: 2026-09-23. External acceptance is **pending**. No passkeys
were created and no association files published. P1 now provides an isolated
[native probe](MERA_NATIVE_PROBE.md); real operations remain blocked by placeholders.

## Frozen contract

The source of truth is `src/config/passkey-identity.json`:

- RP ID: `gizu.io`, shared by development, production, web and mobile, as requested.
- RP name: Gizu. Development app IDs remain `com.example.gizu.dev`; scheme remains
  `gizu-dev`. Production identifiers are unset and production builds remain blocked.
- One EVM account, derivation version `mera-evm-v1`: 32-byte PRF entropy → English
  BIP-39 mnemonic → seed with empty passphrase → BIP-32 `m/44'/60'/0'/0/0`.
- PRF salt: SHA-256 of UTF-8 `mera.prf.salt.v1`, matching Mera's fixed default.
  Its hex value is public configuration, not key material. A test verifies it.
- Native passkey eligibility: iOS 18+ / Android API 28+, plus actual PRF provider
  support. Existing demo installation floors stay unchanged in P0. P1 must check
  eligibility before calling native APIs; P2 owns unsupported-access UI.
- Persist metadata only. No PRF, mnemonic, seed or private-key persistence.

Same credential + RP + salt + derivation means the same address. Web and mobile
must implement this exact contract; P0 has not changed the frontend's access code.
Neither matching names nor a newly created passkey recover an existing wallet.
Because the RP is shared across environments, a development build can select a
production credential once associated. Use separately created test passkeys and
unfunded accounts during P1; build mode does not isolate keys. Any future RP or
derivation change requires an explicit migration/recovery plan.

## Mock mode and fail-closed configuration

Copy `.env.example` to `.env` if explicit local configuration is desired. The
default mode is `EXPO_PUBLIC_PASSKEY_MODE=mock`. P1 also accepts `probe` to open
the isolated compatibility screen (its native actions still validate identity). The current
demo access service stays unchanged. Both Expo config evaluation and app startup
validate mode; unknown values fail, and `native` never falls back to demo success.

Native mode first rejects placeholder signing metadata. Even with valid metadata,
integrated access remains blocked until P2. Use the isolated `probe` mode for P1. No environment
flag claims that the domain was verified. Public Expo environment variables must
never contain secrets. Real signing IDs/fingerprints are public metadata; signing
private keys and provisioning credentials do not belong in this JSON or the app.

## Association templates and verification

Run from `mobile/`:

```sh
npm run passkeys:check
npm run passkeys:templates
npm run passkeys:verify-domain
```

- `check` validates the selected mode and reports the remaining native gate.
- `templates` regenerates review-only files under `docs/passkey-association-templates/`.
  These are outside website public directories and are not deployed automatically.
- `verify-domain` rejects placeholders, then fetches both HTTPS files with a timeout,
  no redirects, successful HTTP status and JSON content type. It checks the exact
  Apple app entry, Android package, credential relation and configured fingerprints.
  Success checks hosted metadata only; it does not prove OS association caching,
  provisioning or provider PRF support on a signed device.

Replace `REPLACE_WITH_APPLE_TEAM_ID` and
`REPLACE_WITH_ANDROID_SHA256_FINGERPRINT` with actual development signing details
in the source JSON, then regenerate templates. Preserve all intended existing
entries if the domain already serves associations; do not overwrite other apps.
The verifier permits unrelated entries because this RP is intentionally shared.

Publish only after reviewing real values:

| Template                          | Required public URL                                                     |
| --------------------------------- | ----------------------------------------------------------------------- |
| `apple-app-site-association.json` | `https://gizu.io/.well-known/apple-app-site-association` (no extension) |
| `assetlinks.json`                 | `https://gizu.io/.well-known/assetlinks.json`                           |

Apple requires `webcredentials.apps` containing `TEAM_ID.bundleIdentifier` and
the corresponding signed entitlement. Expo now declares `webcredentials:gizu.io`;
rebuild the development client before testing it. Android requires
`delegate_permission/common.get_login_creds`, the exact package and certificate
SHA-256 fingerprint. Include only intended debug/EAS signing certificates; Play
app-signing and upload certificates are distinct. No fabricated identity can pass
platform verification, even if it passes local syntax checks.

## Prepared mock adapter scenarios

These are the implementation/test contract for the later wallet adapter, not
implemented native results. Use synthetic fixture IDs such as `mock-credential-a`
and a fixed public test address; never save a real credential or signing secret
in fixtures. Every result must remain explicitly marked as mock.

| Scenario                                         | Required outcome                                                  |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| Create, then open the same credential            | Same synthetic address and derivation version                     |
| Existing selection with no local metadata        | Discover existing credential; never silently create               |
| Sign                                             | Mock proof only; no native signer and no transaction submission   |
| Cancel or provider failure                       | No ready state; sanitized error; retry possible                   |
| PRF unsupported or association mismatch          | Explicit unavailable/failure result, no mock fallback from native |
| Wrong credential/address                         | Reject continuity; do not replace the remembered account          |
| Partial create / metadata write failure          | Offer reopen; do not automatically create another credential      |
| Duplicate request / late completion / background | Serialize the request and discard abandoned results               |

The existing demo access method does not yet implement this create/open/sign
contract. P1 supplies a separate compatibility probe; P2 replaces access flows.

## Acceptance boundary

Verification on 2026-09-23:

- Passed: full `npm run check`, including TypeScript, formatting, lint, Expo Doctor
  (21/21), and 119 tests in 14 suites. Coverage thresholds passed; six tests cover
  the new configuration, derivation constants, guard and association validation.
- Passed: iOS/Android Metro/Hermes exports, Expo public config evaluation and
  entitlement introspection (`webcredentials:gizu.io`). These are not native builds.
- Passed: expected rejection of native-mode Expo configuration and domain
  verification while placeholder signing metadata is present.
- Blocked: live association verification, pending real signing identities and
  publication. The verifier stops before network access with current placeholders.
- Not run: signed native builds, physical-device association/passkey checks, or
  Mera create/get/sign. P1 dependencies from the interrupted start were removed;
  the original dependency lockfile was restored.

P0 is locally configured but **not fully accepted** until actual Team ID and
Android certificates are supplied, both hosted files are verified, and signed
development builds associate successfully. Release identifiers remain a later
release gate. Domain publishing and account/signing setup have not been performed.

Reference: [Mera native recipe](https://mera.category.xyz/recipes/use-mera-with-react-native/)
and [Expo association configuration](https://docs.expo.dev/linking/ios-universal-links/).
