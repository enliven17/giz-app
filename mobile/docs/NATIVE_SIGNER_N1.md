# Native signer N1

Native compatibility implementation; physical-device and boundary instrumentation
acceptance remain open. Synthetic tests do not establish production security.

## Implemented boundary

This section records the N1 probe boundary. N2 adds a separate native-reviewed
transfer flow; see [N2 implementation](NATIVE_SIGNER_N2.md).

The N1 probe in `modules/gizu-signer/` exposes only opening/cancelling a
development test and public capabilities. JS cannot supply PRF, paths, messages,
digests or transaction payloads. Swift/Kotlin obtain PRF directly from credential
APIs and pass it to Rust through a private native UniFFI interface. Only public
indices, addresses, fixed proof messages and signatures return to JS.

Native review authorizes 16 fixed proof messages for accounts 0–15. One assertion
feeds every proof. Creation may require a separate provider prompt and pins the
follow-up assertion to that newly created credential. The frozen gizu.io salt and
BIP39/BIP32 paths are unchanged. The probe stores no credentials or account metadata;
select the same existing passkey and compare addresses to test recovery.

Operations expire after 120 seconds and cancellation discards late results. This
fixed-message probe does not implement N2 general operation authorization or N3
full lifecycle enforcement. The N1 probe does not sign or broadcast transactions. Its Monad chain-10143
EIP-1559 fixture tests encoding; transfer execution is owned by the separate N2 flow.

## Build and run

From `mobile/`, on macOS with Xcode, CocoaPods, Java 17, Android SDK/NDK
27.1.12297006 and Rust on PATH:

```sh
rustup target add aarch64-apple-ios aarch64-apple-ios-sim aarch64-linux-android
npm run signer:build
npm run signer:test
npm run android -- --device --no-bundler
# Or an Apple Silicon iOS simulator:
npm run ios -- --no-bundler
# Then launch the retained developer diagnostics:
npm run debug:signer
```

`signer:build -- android` and `signer:build -- ios` build a single platform.
Bindings/frameworks are ignored; regenerate before Expo prebuild on a clean checkout.
Only Android arm64, Apple Silicon simulator and iOS device artifacts are generated.
Windows/Intel simulator builds are not validated. iOS PRF requires iOS 18+; Android probe entry requires API 28+ and a PRF-capable provider.
Expo Go and old installed clients cannot run this module; rebuild the client.
Metro reload alone cannot remove a previously compiled raw-PRF bridge.

Rust 1.94.1 and crypto dependencies are pinned in the manifest/lockfile: UniFFI
0.32.2, bip39 3.0.0, bip32 0.6.0, k256 0.14.0, Alloy consensus 2.5.0/primitives
1.7.3, zeroize 1.9.0. Android uses Credential Manager 1.6.0, coroutines 1.10.2
and JNA 5.17.0 for UniFFI. Expo Modules Core 57.0.18 matches the installed SDK.
Resolution/build success is not a dependency security audit.

## Synthetic verification

Rust tests cover malformed input, 16 unique indexed accounts, signature recovery,
message tampering, different roots, and independent derivation/Monad encoding vectors.
All-zero entropy is a public fixture, never a wallet to fund.

Reference scripts under the module's `scripts/` run in an isolated temporary npm
project with viem 2.56.8 and @scure/bip32/@scure/bip39 2.4.0. Copy scripts there;
these dependencies must stay outside the mobile runtime.

- `reference-vectors.mjs` regenerates committed address/encoding vectors.
- `cargo run --locked --manifest-path modules/gizu-signer/core/Cargo.toml --example public_vectors`
  emits public synthetic address/message/signature TSV.
- `verify-signatures.mjs <tsv-path>` independently verifies signatures with viem
  and rejects altered messages.

Never substitute real credentials or secrets into those scripts. Functional screen
tests mock only the native boundary and cover success, unavailable module, duplicate
prevention, sanitized failure/retry, and unmount cancellation.

## Remaining gates and limitations

Rust zeroizes owned PRF/seed buffers and adapters clear mutable PRF buffers.
Provider JSON, Swift/JVM objects, UniFFI serialization and cryptographic temporaries
may retain copies until runtime cleanup. This is neither hardware isolation nor
guaranteed forensic erasure. Native/device compromise is outside this boundary.

Before N1 can be marked complete:

- Record physical Android creation, same-passkey recovery and 16 signatures from
  one assertion, with revision, device/OS/provider and prompt counts.
- Repeat on physical iOS; simulator compilation does not establish PRF support.
- Instrument synthetic secrets across returns, errors, callbacks, events and logs.
  Static interface review alone is insufficient.
- Exercise cancellation, expiry, backgrounding and teardown on each provider.
  Complete broader lifecycle/session enforcement in N3 before product integration.
- Independently review dependencies and FFI memory-copy behavior.

Historical JS-probe device results do not satisfy these native implementation gates.

## Verification record — 2026-09-24

- Passed: four Rust tests, rustfmt and Clippy with warnings denied.
- Passed: independent viem verification of all 16 synthetic signatures and rejection
  of altered messages; all 16 address vectors and the Monad signing hash agree.
- Passed: Android arm64 debug APK and unsigned Apple Silicon iOS simulator app builds.
  Device-target Rust static library also compiles; a signed iPhone app is not tested.
- Passed: TypeScript, ESLint, formatting and 123 Jest tests across 15 suites with
  configured coverage thresholds. Four new functional tests use a mocked native module.
- Failed: Expo Doctor version alignment, 20/21 checks pass. The existing Expo
  57.0.24 pin trails the now-recommended 57.0.25 patch; no Expo upgrade was folded
  into this signer change.
- Blocked: physical Android acceptance (no connected device), physical iPhone
  acceptance (no device supplied).
- Not run: native synthetic-secret callback/log instrumentation, device lifecycle
  acceptance, dependency security audit, live Monad transfers (N2-gated).

## Android user-reported result

After installation of the N1 APK, the user reported the native passkey test worked
on the connected Android A142 (Android 16). Provider identity, prompt count,
recovery/cancellation scenarios and boundary instrumentation were not independently
recorded. This is positive first-run evidence, not full N1 acceptance.
