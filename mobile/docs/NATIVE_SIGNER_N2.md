# N2 — Native review and Monad testnet transfers

Implemented for development builds on Android and iOS. Native build and synthetic
checks pass; live transfer/device acceptance is still pending. This does not close
the remaining N1 secret-boundary instrumentation, iPhone, or security-review gates.

## What is available

The native module accepts this strict proposal through `executeOperation(string)`:

```json
{
  "kind": "nativeTransfers",
  "chainId": 10143,
  "transfers": [
    {
      "accountIndex": 0,
      "to": "0x1111111111111111111111111111111111111111",
      "valueWei": "1000000000000000"
    }
  ]
}
```

The address above is a syntax example, not a recommended recipient. Select an
address you control for the first test. The development form offers one transfer;
the native core accepts up to 32 steps across account indices 0–15.

Native policy rejects unknown/duplicate fields, floats, exponents, leading-zero
amounts, oversized proposals, invalid accounts, zero/low reserved recipients,
other chains, executable sender/recipient code, non-21000 gas estimates and excess
value/fees. Each transfer is positive and at most 0.1 MON; total value is at most
1 MON and aggregate maximum fees at most 0.1 MON. Calldata, access lists,
ERC-4337, tokens and arbitrary signing are unavailable.

The public bridge also exposes `getOperationStatus()`, `cancelOperation()` and
`lock()`. Status returns a JSON journal projection of public transaction data.
Cancellation grants no approval authority. There is no JS approve, raw-sign,
private operation handle, PRF getter or signed-transaction export.

## Native operation flow

1. Native full-screen UI asks to unlock an **existing** test passkey. Creation
   remains a deliberate action in the separate N1 probe.
2. The private Rust operation derives sender addresses from PRF and owns the seed.
   Native transport queries the pinned HTTPS RPC for chain, pending nonce,
   balances, gas estimate, fees and account code. No JS endpoints or headers;
   redirects are rejected and response sizes bounded.
3. Rust constructs immutable EIP-1559 transactions, allocates consecutive nonces,
   validates per-account aggregate debits and generates the full native review.
   Every source, destination, amount, nonce, gas, fee and aggregate maximum debit
   is displayed. Reading to the bottom enables native approval.
4. Only that native button approves the same operation object. Before each step,
   native code rechecks chain, pending nonce and account code. Rust signs each
   approved step once; changed nonce/chain/code invalidates remaining authority.
5. Before broadcast, native storage records chain, account, nonce, intent hash,
   expected transaction hash and operation ID. It never stores seed or signed
   transaction bytes. Native transport sends the signed bytes directly.
6. Native reconciliation checks receipts against canonical block hashes and the
   RPC's finalized height. Results distinguish `finalized`, `reverted`,
   `pending` and `unknown`. A returned broadcast hash alone is not finality.
   Sequential execution stops unless the preceding transfer reaches finalized
   success within the bounded polling window.

RPC chain state is trusted as documented in N0; this is not a light-client proof
against a malicious RPC. Read-only checks on 2026-09-24 confirmed chain 10143 and
support for both fee query methods. The configured endpoint remains
`https://testnet-rpc.monad.xyz`.
[Network information](https://docs.monad.xyz/developer-essentials/testnet) and
[gas pricing](https://docs.monad.xyz/developer-essentials/gas-pricing) were rechecked.

## Failure and lifecycle behavior

Only one native probe/review/execution/reconciliation runs at a time. Android uses
a non-exported Activity with secure-window/overlay protection and an operation
token so a cancelled launch cannot attach to a later request. iOS uses a modal
full-screen UIKit controller. React cannot grant approval.

Provider waits and secret-bearing operations are bounded at 120 seconds. The Rust
deadline begins when the PRF-backed operation is created; network preparation and
review consume that same window. Backgrounding during preparation/review/execution,
rejection, lock, expiry or teardown invalidates the operation. Provider pauses are
handled separately, and foreground is required before review/signing.

Cancellation cannot undo a broadcast. A timeout or error after journaling leaves
an uncertain record. **Any unresolved record blocks new transfers**, even across
restart. Explicit status refresh can reconcile it without unlocking. A transaction
that cannot be found remains unknown; this version intentionally has no automatic
replacement, resend, new nonce, or journal-clear escape hatch. Manual recovery of
permanently unresolved transactions belongs to N3. Journal capacity is 256 records;
reaching it stops signing/submission rather than deleting evidence.

Core tests exercise rejection, immutable preparation, approval, one-time signing,
expiry, concurrency, nonces and aggregate limits. They do not establish native UI
isolation against every hostile-JS technique. Physical lifecycle, accessibility,
journal crash/restart and adversarial bridge tests remain acceptance work.

## How to test

Build using the N1 instructions and launch with
`EXPO_PUBLIC_PASSKEY_MODE=native-probe`. On the first screen, select
**Test native transfers**.

1. Use an existing test passkey and fund its selected account with faucet MON.
   N1 displays the public indexed addresses. Never fund with real assets.
2. Enter an account index, a recipient you control, and a small MON amount.
3. Tap **Review native transfer**, unlock in the native screen, read all details
   and approve on the phone. No transaction is sent by opening the JS form.
4. Inspect native status. If pending/unknown, refresh status rather than repeating
   the transfer. Verify sender, recipient, value and actual receipt independently.
5. Exercise rejection, cancellation, insufficient funds, network loss after
   submission, restart reconciliation and backgrounding. Record device, OS,
   provider, prompts and resulting hashes/statuses.

The device was disconnected during N2 verification, so the new APK has not been
installed on the phone and no live transaction was submitted in this change.

## Verification — 2026-09-24

- Passed: Android arm64 debug APK; unsigned Apple Silicon iOS simulator app.
- Passed: 10 Rust tests including adversarial policy/concurrency cases; Rust
  formatting and Clippy with warnings denied.
- Passed: independent viem decoding and signer/hash verification of synthetic
  native EIP-1559 bytes, including chain, destination, amount, gas and fees.
  Reproduce with the `transfer_vector` Rust example and the isolated
  `scripts/verify-transfer.mjs <output-path>` script (viem 2.56.8).
- Passed: TypeScript, ESLint, 138 Jest tests across 17 suites, coverage thresholds.
- CI updated: locked Rust policy tests/checks and binding/library generation before
  Android/iOS builds. CI generates an ephemeral Android signing key for compilation
  only; its fingerprint must never be associated with gizu.io. Linux Android support
  added to the build script. Hosted CI
  and Linux builds have not been executed locally.
- Outstanding: known Expo Doctor patch mismatch from N1 (57.0.24 versus 57.0.25);
  live receipts, physical review/lifecycle/bridge tests, independent security audit.
