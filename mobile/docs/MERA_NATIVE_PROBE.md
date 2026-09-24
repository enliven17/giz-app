# Retired JavaScript Mera probe

Retired on 2026-09-24 at the user’s request. The probe UI, JavaScript PRF/derivation/
signing services, native passkey dependency, crypto polyfill and probe-only tests
were removed. `EXPO_PUBLIC_PASSKEY_MODE=probe` now fails explicitly; it never falls
back silently to mock access. `native` remains unavailable until the replacement.

The Android screenshots from 2026-09-23 demonstrated derivation, same-address
recovery and test-message verification on one phone/provider. That historical
result did not establish native secret isolation. The implementation is available
in Git history at `50c52e9`; do not restore it as a production fallback.

The replacement follows [N0](NATIVE_SIGNER_N0.md) and the
[Mera integration plan](MERA_PASSKEY_PLAN.md). Identity, account-0 derivation,
association configuration and local signing credentials are preserved.

## Existing installed apps

Removing the dependency from source does not remove native code from an already
installed development client. Rebuild and replace the Android/iOS app before
claiming the old native bridge is absent on that device; a Metro reload is not
enough. Clear any old probe mode from the terminal or local environment and use
`EXPO_PUBLIC_PASSKEY_MODE=mock` for the current demo.

No provider passkeys or existing local metadata are deleted by this cleanup.
The former metadata key was `gizu.mera.probe.metadata.v1`; future migration must
treat it as untrusted remembered public metadata, not authentication.
