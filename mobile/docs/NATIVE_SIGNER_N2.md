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
`npm run debug:signer`. On the first screen, select
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

The initial build was verified before device installation. The subsequent Android
installation and first successful live transfer are recorded below.

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
  further physical review/lifecycle/bridge tests and independent security audit.

## Android preparation follow-up

A device report stopped at the generic preparation text. The old transport used
blocking requests, displayed no per-request progress and removed the Cancel action.
No crash was found in the inspected native crash log, and no broadcast journal
file existed at that check; the exact original stalled request was not observable.

Android now uses a private cancellable OkHttp transport (4.9.2 declaration, matching
the React Native baseline), with redirects and connection retries disabled, a
12-second call deadline, a 1 MiB response bound and a 30-second total preparation
deadline. Preparation keeps a Cancel button and shows the current query category.
Failure closes secret state and shows sanitized network/funding/policy guidance.
Diagnostics record only fixed RPC method names and failure codes, never payloads
or credential data. Screenshot protection remains enabled.

Five JVM HTTP regression tests passed: success, redirect rejection, oversized
response rejection, stalled-call timeout and cancellation of an in-flight call.
Android CI runs these before packaging. A new device retry is needed to identify
whether the original issue was connectivity, endpoint behavior or account state.

## Android live acceptance and follow-up — 2026-09-24

The user completed a physical Android transfer after funding Account 0. Read-only
Monad testnet RPC checks confirmed a successful receipt (status 0x1), chain 10143,
0.001 MON, 21,000 gas, and a receipt block below the finalized head:

- Sender: 0x90ad2f19302ED5439B69659Bbc5D6d8c5b7dDf95
- Recipient: 0x0e4e77B43a94A704E2a7a005238038F3EF00f407
- Transaction: 0xb3b9b115ec88086227c30cb712ba832b3604b2baaae771d9b70bf1b4ddbe9cb6

This records one Android success, not complete N2 acceptance or an iOS result.
The earlier generic estimation error disappeared after funding. Android now checks
the selected account's entire batch amount plus maximum fees before estimation;
insufficient funds get explicit testnet funding guidance. Rust remains the
authoritative quote/approval validator. This early funding-message improvement is
Android-only; iOS still uses its existing preparation failure behavior.

The development form exposes a count of 1–16 transfers (default 1), repeating the
entered amount and recipient for the selected account, with a 1 MON aggregate
value cap. It submits one proposal, never multiple unlock requests. Native review
lists every transfer and the totals. Batches are sequential, not atomic; the
existing 120-second operation lifetime still applies and can stop a long batch.
Tests with mocked services cannot establish the number of actual provider prompts.

### Physical follow-up checklist

Use small testnet amounts and a recipient you control. Record the number of
passkey prompts, hashes, and outcome; do not record credentials or signing secrets.

1. **Insufficient funds:** select a known unfunded derived account. Preparation
   must show funding guidance before approval, with no new journal entry.
2. **Cancel before approval:** unlock a transfer, then cancel native review.
   Refresh status: only the previous journal entries should remain. Repeat by
   backgrounding during review; returning must not revive signing authority.
3. **Restart recovery:** after a known finalized transfer, stop and reopen the app.
   Refresh native status without unlocking. The same finalized hash must remain
   and no transfer may be resubmitted. This is completed-record persistence only.
4. **Two transfers, then thirteen:** begin with count 2 and 0.000001 MON per
   transfer. Review both transfers and totals; approve once. Expect one unlock,
   distinct transaction hashes and consecutive nonces. After that succeeds,
   repeat with count 13 to exercise the 12+ signature requirement.
5. **Partial execution:** cancel/background during a batch. Already submitted
   steps may complete; remaining steps must not sign. Refresh/restart to reconcile
   recorded hashes. Do not retry the whole batch while any result is unknown.
6. **Uncertain submission recovery:** a controlled interruption after journaling
   but before a known RPC result must retain unknown/pending state across process
   restart and block new signing until reconciliation. A completed-record restart
   does not prove this case. No automatic resend or journal deletion is permitted.

Physical follow-up: the user reported one unlock and one native approval for two
successful 0.001 MON transfers. RPC receipts confirmed success, Account 0, the same
recipient and consecutive nonces 1 and 2:

- 0x6f67dafae7bb847dae6e6a1c6ebda51947fc98eccfc46e0c83028962252eee97
- 0x1bd53bddc7b452dac29f69ce1de2ab5e9ad357275d11dd84bf942ed090602bdb

The user also reported all three finalized records visible after reopening, and
still three after cancelling before approval. These are user-observed device
results, not instrumented lifecycle/security proof. The 13-transfer batch,
partial-batch cancellation and uncertain-submission restart cases remain
**not run**; further manual testing was paused at the user's request.

Follow-up verification passed: 25 focused Jest tests, TypeScript, scoped ESLint,
12 Rust tests, eight Android JVM tests (including aggregate funding and transport
cancellation), Android arm64 APK build, Markdown formatting and diff checks.
The APK was installed successfully on the connected Android phone with `install -r`;
app data was preserved. The screen-reopening Jest test mocks native persistence:
it does not establish process-death durability. No iOS build or new live batch was
executed for this follow-up.
