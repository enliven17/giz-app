# Stored-wallet Android signer

Phase 2 implements a separate local Expo module, `GizuStoredSigner`, under native
package `io.gizu.storedwallet`. The retained `gizu-signer` module is unchanged and
excluded from app linking. This module is Android-only and development-only.

## Implemented boundary

- Native `createWallet` requires a native confirmation and Credential Manager
  registration. Registration is verified against challenge, origin, RP and P-256
  credential metadata. PRF-enabled registration is required for later recovery.
- Random 32-byte entropy is generated only after the provider returns to a focused,
  unlocked app. Rust derives all 16 public accounts to check core availability.
- `WalletStore` encrypts a bounded binary record using AES-256-GCM, application-bound
  AAD and an Android Keystore key. Entropy is not encoded into JSON or strings.
  `AtomicFile` writes live in `noBackupFilesDir`. Missing key/corruption produces
  `recoveryRequired`; existing data is never overwritten by creation.
- The Keystore key does not require user authentication: passkey authorization is
  enforced by native code, not secure hardware. Native memory compromise is outside
  this boundary. Managed/provider/FFI copies cannot be promised forensic erasure.
- `openWallet` verifies a fresh signed assertion, bound to the wallet and open
  purpose. Decrypted entropy is cleared before waiting for credential UI. Opening
  does not establish reusable spending authority or backend authentication.
- A process-wide mutex serializes ceremonies. Lock, teardown, cancellation and the
  two-minute timeout invalidate work. Only the bounded credential-provider wait can
  survive an activity pause; foreground and unlocked state are required on return.
- Native responses are explicit public maps. Errors are fixed messages without
  underlying provider, key, file or crypto details. A cancellation after an atomic
  write may leave a valid backup-required wallet; query state rather than recreate.

## Deliberately unavailable

Every created wallet stays `backupRequired` and exposes no accounts through the
bridge. `backupWallet` and `restoreWallet` reject as not implemented. There are no
transaction exports yet. Native `getCapabilities` reports `available: false`,
`walletStorage` eligibility, `backup: false` and `transfers: false`.

The main app remains gated and does not call these ceremonies until verified
backup onboarding is integrated. An explicit development-only
`npm run debug:stored-wallet` harness can refresh state and exercise create/open;
there is no product route or automatic legacy fallback. Phase 3 implements backup and restore; phase 4 integrates spending approval.

## Ownership and verification

- `core/`: adapted derivation and exact-transfer policy from the retained Rust core,
  now consuming random wallet entropy. No fixed-message probe exports. Native-only
  UniFFI bindings are not a JavaScript signing API.
- `android/`: Expo lifecycle, native prompts, credential verification and storage.
- `scripts/build.sh`: generates Kotlin bindings and the arm64 Android library.
- Generated bindings, targets and binaries are ignored; never edit them manually.

From `mobile/`:

```sh
npm run stored-signer:test
npm run stored-signer:build
cd android
./gradlew :gizu-stored-signer:testDebugUnitTest :app:assembleDebug
```

The build needs Rust 1.94.1, the aarch64-linux-android target, Android NDK
27.1.12297006 and a macOS/Linux host. The JVM tests exercise storage failures,
AES-GCM integrity and passkey verification using synthetic data; they do not prove
Android Keystore behavior or physical-device/provider support.

The prototype supplied the starting credential verifier/envelope and their tests.
The crypto core retains the original pinned Rust dependencies. Android adds CBOR
4.5.6 for parsing authenticator registration data; no wallet secrets go through JS.
