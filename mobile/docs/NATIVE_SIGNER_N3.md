# N3 — Native wallet integration

Wallet access, reviewed transfers and local outgoing history are implemented in
a retained developer harness under src/development/, hidden from the normal app.
This is not full N3 acceptance.
Development builds only, Monad testnet (10143), Account 0, RP gizu.io and the
frozen derivation from N0. Production remains blocked.

## Behavior and boundary

- Start with npm run debug:wallet. Existing welcome/access screens
  open a native choice to create a passkey or open an existing one.
- Registration can require a subsequent assertion. If interrupted, try the
  existing credential before creating another.
- Native Android/iOS credential adapters obtain PRF output. The private Rust
  derive_wallet_address function derives Account 0 and drops its secret state.
  It does not sign any message or transaction. No secret input/output API is
  exposed to Expo. The compatibility probe retains its separate fixed signatures.
- openWallet returns only address, accountIndex and chainId. The JS adapter
  validates and allowlists those fields. A local in-memory wallet view is not
  backend authentication or spending authorization. Restart/disconnect requires
  reopening the passkey; no stored metadata can grant access.
- The wallet shows the public address, copy action, exact-decimal MON balance,
  refresh, reviewed transfers, outgoing history and disconnect. Read-only RPC uses a fixed Monad testnet endpoint,
  verifies chain ID, and has a 12-second abort deadline. Errors replace stale
  balances; zero is displayed as zero. No floating-point financial conversion.
- Native mode mounts no demo investment, account, order or notification providers
  after access. It cannot navigate to demo transactions. Demo mode remains
  explicitly separate.
- Unmount/disconnect cancels outstanding requests; cancelled/late access results
  do not reopen a wallet. Native access retains the existing development gate,
  busy serialization, 120-second expiry and cancellation. Signing secrets are
  already released when the wallet screen becomes visible.
- This boundary does not claim protection against arbitrary native-code execution
  or a compromised device. The existing N0/N4 memory-copy and audit limitations
  remain. Instrumented bridge verification and physical iOS acceptance are open.

## Run

Rebuild native libraries and development clients after pulling this change:

    npm run signer:build
    npm run android -- --no-bundler

For an installed compatible client:

    npm run debug:wallet -- --port 8086

Use npm run debug:signer for the signature and transfer probes.
Use npm start for the normal app; M6.1 will integrate native services there.
There is no JS Mera or raw PRF fallback. Older clients fail access and do not
silently enter demo mode. Native/probe modes reject release JavaScript execution,
and both native platforms independently gate access to debug builds.

## Verification scope

The functional tests exercise welcome, native boundary success/failure/cancel,
balance loading/zero/error/retry, clipboard, disconnect and late-result rejection.
Only external/native boundaries are mocked. Unit tests validate public result
allowlisting, chain/quantity checks, decimal formatting and request cancellation.
Rust verifies address-only derivation against the existing Account 0 vectors.
Native compilation is required on Android and iOS; these checks do not establish
live credential-provider behavior.

## Remaining N3 work

- Per-step execution progress and wider account support; uncertain outcome recovery remains
  blocked from automatic resubmission.
- Full lifecycle/adversarial instrumentation and physical provider acceptance.
- Independent recovery UX, backend authentication and production release decisions.

Manual batch/lifecycle testing was paused at the user's request. Do not silently
mark the outstanding 13-transfer, partial-batch or uncertain-restart cases passed.

## Verification — 2026-09-24

- Passed: 157 Jest tests across 19 suites, including coverage thresholds; focused
  wallet tests repeated after the final loading-lifecycle adjustment.
- Passed: TypeScript, ESLint, Prettier and diff checks.
- Passed: 13 Rust tests and Clippy with warnings denied; native library/binding
  generation; Android JVM tests and arm64 APK; unsigned arm64 iOS simulator build.
- Failed (pre-existing): Expo Doctor dependency check, installed Expo 57.0.24
  versus expected 57.0.25; the other 20 checks passed.
- Not run: live create/open through the new product entry point, physical iOS
  behavior, hostile-JS instrumentation or a security audit. Compilation/mocked
  tests do not replace these checks.
- Initial access slice: installed after reconnection. User screenshots showed both
  a different zero-balance wallet and recovery of the original funded Account 0
  with 19.990574 testnet MON. This is live Android access/balance evidence.

## Reviewed transfers and local history

The wallet now offers a single native MON transfer from Account 0 (maximum 0.1
MON). JavaScript builds only a proposal containing expectedFrom equal to the
displayed address. The shared Rust core validates its format and rejects a PRF
that derives a different sender before preparing/reviewing/signing. The native
review remains the spending authorization boundary. The diagnostic probe's
unbound proposals remain supported; no general digest signer or secret bridge was
added. Older binaries reject the new proposal field instead of signing silently.

History refresh calls native reconciliation and allowlists public metadata, then
filters to the current address and chain. Any unknown/pending local operation,
including one belonging to another wallet, conservatively blocks new transfers.
This matches the native global journal gate. Errors/cancellation require an
explicit refresh before retry; no auto-resubmission, replacement or deletion.

New journal entries persist recipient and amount before broadcast. Older entries
retain their hash, nonce and status without fabricated details. Records are
newest-first and distinguish pending, unknown, finalized and reverted. This is
local outgoing history, not a chain indexer: external transactions and incoming
deposits are not listed. Balances are refreshed after a native operation or
history refresh. Disconnect/unmount cancels active signing and ignores late UI
results; already broadcast transactions remain irreversible.

Native review/balance checks and immutable approved transfers are unchanged.
There is no automatic transaction submission during installation or verification.

Transfer/history verification passed: 170 Jest tests across 21 suites with coverage
thresholds, TypeScript, ESLint, Prettier, diff checks, 14 Rust tests, Clippy,
Android JVM tests/arm64 build and unsigned arm64 iOS simulator build. The existing
Expo Doctor 57.0.24/57.0.25 mismatch remains from the preceding check; dependencies
were not changed. No new live transfer was submitted during this implementation.
The updated transfer/history APK was installed with app data preserved and opened
on the connected Android phone. Native mode runs on Metro port 8086; live approval
of a new transfer through this screen remains user-driven and unverified.
