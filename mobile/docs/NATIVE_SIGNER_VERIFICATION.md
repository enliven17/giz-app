# Native signer verification

Consolidated 2026-09-24. Historical evidence below is carried from the N1–N3 records;
checks were not rerun for this documentation change. Counts describe those revisions,
not a claim about current test totals. The [architecture](NATIVE_SIGNER.md) defines
the boundary; the [roadmap](../PLAN.md) owns scheduling. Setup commands live in
[README](../README.md).

## Recorded automated evidence

| Slice, 2026-09-24    | Recorded checks                                                                                                                                                                     | Scope limitation                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| N1                   | 4 Rust tests, formatting/Clippy, independent viem recovery of 16 synthetic signatures, 123 Jest tests/15 suites, coverage, TS/lint, Android arm64 and unsigned iOS simulator builds | No physical iOS, secret-boundary instrumentation or audit                         |
| N2                   | 10 Rust tests, synthetic EIP-1559 decoding/hash/signer checks, 138 Jest tests/17 suites, coverage and both builds                                                                   | Native review implemented; hostile-bridge acceptance incomplete                   |
| N2 follow-up         | 12 Rust tests, 8 Android JVM tests, 25 focused Jest tests, TS/scoped lint, arm64 APK                                                                                                | Transport/funding/cancellation checks; no new iOS or 13-transfer acceptance       |
| N3 access            | 13 Rust tests, 157 Jest tests/19 suites, coverage, native bindings, Android JVM/build and unsigned iOS simulator                                                                    | Mocked access tests do not establish provider behavior                            |
| N3 transfers/history | 14 Rust tests, 170 Jest tests/21 suites, coverage, TS/lint/format, Android JVM/build and unsigned iOS simulator                                                                     | Live approval through the newly integrated screen not established by installation |

Synthetic checks use reference inputs only, never real passkey secrets in JS.
The transfer vector example and `scripts/verify-transfer.mjs` independently decode
and recover native outputs. CI native generation/build configuration exists;
local results do not establish hosted CI/Linux success. CI's ephemeral Android
signing key must not be published in domain associations.

Previously recorded failure: Expo Doctor 20/21, installed Expo 57.0.24 versus
expected 57.0.25. This is historical until rerun, not a newly observed result.

## Physical Android evidence

N1 user reported success on A142 / Android 16. Provider identity, exact revision,
prompt count and boundary instrumentation were not fully recorded.

N2 user completed a 0.001 MON transfer after funding Account 0. Historical read-only
RPC checks confirmed successful receipt, chain 10143, 21,000 gas and a block below
the finalized head:

- Sender: `0x90ad2f19302ED5439B69659Bbc5D6d8c5b7dDf95`
- Recipient: `0x0e4e77B43a94A704E2a7a005238038F3EF00f407`
- Hash: `0xb3b9b115ec88086227c30cb712ba832b3604b2baaae771d9b70bf1b4ddbe9cb6`

User reported one unlock and one native approval for two further 0.001 MON transfers.
Historical RPC checks confirmed the same sender/recipient and consecutive nonces 1, 2:

- `0x6f67dafae7bb847dae6e6a1c6ebda51947fc98eccfc46e0c83028962252eee97`
- `0x1bd53bddc7b452dac29f69ce1de2ab5e9ad357275d11dd84bf942ed090602bdb`

User reported three finalized records after reopening and still three after
cancelling before approval. This supports completed-record persistence and one
cancellation case, not process-death safety during uncertain submission.
N3 screenshots showed a different zero-balance account and recovery of the funded
Account 0 with 19.990574 testnet MON: Android access/balance evidence only.

Earlier 2026-09-23 JavaScript-probe success proved derivation/recovery/test signing
on one provider; it does not prove the replacement native secret boundary.

## Main-app integration evidence

Existing Home, Account, Deposit/Withdraw and Activity use native adapters. Functional
coverage mocks those boundaries and exercises validation, duplicate prevention,
status display, missing legacy details, refresh failure, leaving a page during an
operation, disconnect and stale results. Native-only signing policy is unchanged.
Main-app physical acceptance remains outstanding; debug-harness evidence does not
complete it. Installation/build success is not an accepted live journey.

## Remaining acceptance

Manual testing was paused by the user. Do not resume transactions or mark skipped
cases passed as part of documentation work.

- Physical iOS PRF create/open/recovery, review, cancellation and provider behavior.
- Android provider/device/revision/prompt record and native synthetic-secret
  instrumentation across returns, events, errors, logs and generated bindings.
- Hostile JS: removed bridge/secret exports inaccessible; no approve bypass, altered
  chain/recipient/value/fees/index, extra steps, replay, expiry or concurrent escalation.
- Review accessibility, overlay/touch protections, provider pauses versus background,
  teardown and late callbacks on both platforms.
- 13-transfer one-unlock batch: not run. Synthetic 16-signature proof is different.
- Partial-batch cancellation and uncertain-submission restart: not run. Preserve
  already-broadcast hashes, stop remaining authority, reconcile without resending.
- Insufficient funds on an unfunded account: explicit device acceptance still open.
- Independent FFI/memory/dependency/license/update-trust review and security audit.
- Signed production builds, recovery/domain loss/account discovery, web isolation
  and privacy decisions before real-funds release.

Record future results with revision, device/OS/provider, build type, prompts and
public hashes/statuses. Never capture real credential secrets or heap dumps.
