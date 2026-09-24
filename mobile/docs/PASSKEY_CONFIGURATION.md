# Passkey identity and configuration

Native credential handling and authorization are implemented in the
[native signer](NATIVE_SIGNER.md). Account 0 remains compatible with the frozen
identity below; diagnostic indexed derivation is bounded to indices 0–15.
See [Android signing](ANDROID_SIGNING.md) for development association setup and
[verification](NATIVE_SIGNER_VERIFICATION.md) for device evidence and limitations.
Apple Team ID `588X2UZY3L` is configured; production release acceptance remains open.

## Frozen contract

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

The default is `native`: normal app routes use passkey-backed access in a compatible
development client. `npm run start:demo` explicitly selects mock mode. The retired
`probe` mode and unknown values are rejected. Developer diagnostics use explicit
commands in [README](../README.md) and are hidden from normal navigation.

Platform identity validators check configuration syntax, not domain ownership,
installed signing or provider capability. Rebuild native clients after changing
native code or entitlements. No JavaScript PRF/signing fallback is permitted.

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
or fetch the separately prepared Android `assetlinks.json`. Historical configuration-stage fetch failure is not current hosting evidence; rerun
verification when deploying or changing associations.

Expo declares `webcredentials:gizu.io` and the supplied team. Regenerate/rebuild
the native development client before checking signing and association on a physical
iPhone. Setting a Team ID is not evidence that a matching provisioning profile or
Apple Developer app registration already exists.

## Acceptance

Functional tests mock external/native boundaries. Create/open/recovery, unsupported
PRF, cancellation, partial creation, wrong credentials and late callbacks need
provider-aware verification. Current evidence and remaining physical iOS/Android
cases are tracked in [signer verification](NATIVE_SIGNER_VERIFICATION.md).
No device test, hosting check or provisioning action was performed during this
documentation consolidation.
