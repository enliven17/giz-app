# Native signer ownership and structure

This is the app-owned native signing integration. It is not a copied Mera SDK.
Compatibility with the frozen Mera derivation is covered by the reference vectors;
third-party cryptography is consumed through Cargo dependencies and Cargo.lock.
Credential Manager, AuthenticationServices and Expo supply platform integration.

## Source ownership

- `core/src/`: app-owned Rust derivation, operation policy and signing. Secret
  material stays here/native; this reorganization does not change the core.
- `android/src/main/java/io/gizu/signer/GizuSignerModule.kt`: Expo entry points
  and credential access.
- Android `rpc/`: network transport, response handling and progress reporting.
- Android `storage/`: journal persistence and reconciliation.
- Android `transfers/`: in-process handoff, native review/activity lifecycle and
  balance checks. Directory grouping retains the `io.gizu.signer` package so the
  manifest and module registration remain stable.
- `ios/GizuSignerModule.swift`: Expo entry points and credential access.
- iOS `RPC/`: network transport and RPC response validation.
- iOS `Storage/`: journal persistence and reconciliation.
- iOS `Transfers/`: native review/controller lifecycle and internal failure type.
- `scripts/`: binding/build commands and compatibility verification tools.
- `generated/`, `ios/Generated/`, `ios/GizuSignerCore.xcframework` and Android
  `jniLibs/`: generated artifacts. Regenerate with `npm run signer:build`; do not
  hand-edit them. Dependency implementation belongs in package caches, not here.

## JavaScript boundary

Application adapters live in [src/services/wallet](../../src/services/wallet).
`nativeBridge.ts` owns the app-facing Expo lookup and public method types;
`access.ts` validates public identity, `transfers.ts` binds the sender to a
reviewed operation, `journal.ts` validates/filters public journal records, and
`balance.ts` performs read-only RPC. Pure formatting, proposal validation and
public service contracts live in [src/domain/wallet](../../src/domain/wallet).
The retained developer probe has its own fixed-message interface.

Do not introduce PRF/key exports, arbitrary digest signing, or JavaScript approval.
Do not replace native policy with client validation. Retain write-before-broadcast,
unknown-result reconciliation, operation expiry, cancellation and sender binding.
Storage keys, journal schema, module names, derivation and native ABI were preserved.

## Verification after reorganizing

Run mobile TypeScript/lint/coverage checks. Android builds recursively discover
Kotlin sources. Run `:app:assembleDebug` and `:gizu-signer:testDebugUnitTest` in
the generated Android project. After adding/moving Swift sources run `pod install
--no-repo-update` in `mobile/ios`, then build the supported arm64 simulator target.
No Rust binding regeneration is required for this source-only reorganization.

Native UI changes require rebuilding/reinstalling the client. Mocked functional
tests and native compilation do not replace physical-device passkey acceptance.
