# Mera passkey integration and native signer plan

Updated: 2026-09-24. This is the current implementation direction, not a claim
that the native signer exists. It supersedes the earlier single-account,
JavaScript signing plan and its one-signature-per-unlock policy.

## Decision and current status

Keep React Native for the application. Move credential PRF retrieval, derivation,
key ownership, operation review and signing authorization into a native signer.
The target guarantee is:

> Wallet-root material and private keys never enter JavaScript, UI state, logs or
> backend systems. JavaScript cannot obtain signatures outside the operation
> approved by the user through native-controlled review.

This guarantee is scoped to the mobile native signer. It does not claim protection
against arbitrary native-code execution, a compromised OS or malicious application
binary, nor that derived keys remain inside secure hardware. A native module
normally shares the app process. Backend authorization and on-chain contract
security remain separate concerns.

The former P1 JavaScript probe was removed on 2026-09-24 at the user's request,
including the react-native-passkey bridge dependency and JS secret-handling code.
It remains historical compatibility evidence in Git, not an available fallback.
Only mock mode runs today; probe and native modes fail explicitly. Installed
native development clients must be rebuilt before the bridge is absent on-device.

User-provided Android screenshots on 2026-09-23 demonstrate address derivation,
same-address recovery and fixed-message signature verification on one phone/provider.
They do not establish native secret isolation, general provider support or iOS
acceptance. Recovery was reported around reopening; a controlled cold-process
restart test remains required. Intermittent white startup remains unresolved.
See [probe evidence](MERA_NATIVE_PROBE.md) and [identity configuration](PASSKEY_CONFIGURATION.md).

Accepted product direction:

- One passkey-derived root can control multiple derived accounts internally.
- One native approval and passkey unlock should cover a bounded operation with
  12 or more signatures, without per-account switching or per-signature prompts.
- Registration may still require multiple provider prompts. Expiry, interruption
  or a changed operation may require renewed approval/unlock.
- No custodial service is required by this design.
- Independent recovery is deferred for separate design, but remains a real-funds gate.
- Avoid publishing a common owner/parent relationship between accounts. ERC-4337
  is not selected by this change and does not itself provide unlinkability.
  Funding flows, public execution and shared authorities can still link accounts.

## Preserve identity and compatibility

The source of truth remains `src/config/passkey-identity.json`. Preserve `gizu.io`,
the existing PRF salt, English BIP-39, empty passphrase and the account-0 path
`m/44'/60'/0'/0/0` under `mera-evm-v1`. Native code must reproduce the same account
from identical synthetic inputs before using a real test credential.

Multiple accounts are planned, not implemented. N0 freezes the indexed scheme
`m/44'/60'/0'/0/i` for i = 0..15 and bounded discovery; account 0 is unchanged. Store
only validated public/account metadata, including indexes and derivation version.
Do not expose extended private keys, root material or secret export APIs to JS.
Do not expose extended public keys unnecessarily because they enable account enumeration.

Sharing derivation with the website remains a compatibility objective, not proof
that the website has the same isolation. Browser JavaScript signing would retain
its own exposure and must not be described as protected by the mobile native module.

## Native architecture and authorization

React Native submits an untrusted structured operation proposal. Native code
validates it, constructs an immutable canonical representation, renders the final
review from that representation, obtains approval, requests the passkey, derives
required keys, and signs only authorized steps. JS receives public results and
sanitized status. A trusted native review must not use a WebView or JS-provided
human-readable labels as the authority for what a payload means.

All sensitive steps must stay native end-to-end. Merely wrapping Mera JS, moving
keys after JS derivation, or putting a seed in SecureStore does not meet the goal.
The current react-native-passkey result path exposes PRF output to JS; replace or
adapt that path so secret responses never cross the module interface.

Use established cryptographic implementations. Evaluate Swift/Kotlin adapters
with a shared native core versus platform implementations in N0; no custom
cryptographic algorithms. Mera remains the reference for existing derivation and
compatibility. Its JavaScript signer cannot remain the secret-handling engine.
Do not claim an existing drop-in native Mera implementation without verifying one.

Proposed public interface responsibilities (names are illustrative):

- Read public account metadata and capability status.
- Execute a structured operation through native review and approval.
- Cancel an operation and read sanitized per-step progress.
- Lock/disconnect and forget public metadata.

Do not expose `getPrf`, seed/private-key getters, a general `signDigest`, or an
unrestricted live signing-session handle. Operation identifiers are correlation
handles, not authority to modify the approved operation.

For the first implementation, support a small explicit operation grammar. Bind
approval to chain, account indexes, transaction/message type, destinations,
contracts/methods, calldata, asset amounts, approval spenders/limits, fees, nonces,
step count, expiry and any permitted slippage. Parse, encode and compute signing
digests natively; reject unknown calls, unknown typed-data schemas and blind hashes.
A backend signature or successful simulation does not replace user authorization.

Prefer exact payloads initially. Later variable execution must use explicitly
reviewed bounds enforced natively at each step. Changed recipients, extra steps,
new accounts or spending beyond the approved limits require new review. Never
accept a JS-supplied summary paired with independently supplied opaque calldata.

## Lifecycle and execution

Proposed states: locked → reviewing → awaiting passkey → executing → completed,
failed, cancelled or expired → locked. Serialize native ceremonies and operations.

- Retain keys only for the approved bounded operation; define duration, signature
  and account limits before implementation. No persistent secret cache by default.
- Native code observes lifecycle and owns invalidation. Treat provider activity
  transitions explicitly; a JS `isActive` flag cannot authorize continued signing.
- Genuine backgrounding, expiry, disconnect or cancellation stops future signing.
  A provider response arriving after invalidation must be disposed, not reused.
- End sessions and clear owned buffers on every terminal path. Document residual
  native/library copies; do not promise provable complete memory erasure.
- Track each signature/submission/receipt separately. Multiple transactions are
  not automatically atomic. Stop on uncertain results and reconcile before retry.
- Cancellation cannot revoke signatures already returned or transactions already
  broadcast. Returning signed payloads allows JS to broadcast them later; constrain
  validity where supported and expose that limitation in the operation policy.
- Process death destroys authorization. Persist only non-secret progress needed
  for reconciliation; resume signing only after fresh native approval/unlock.

## Implementation sequence

### N0 — Freeze the boundary and select native dependencies

- [x] Record attacker assumptions and explicitly distinguish JS compromise,
      native process compromise, hardware extraction and malicious app updates.
- [x] Inventory every current secret crossing, serialization and error/log path.
- [x] Choose native module/core approach and review dependency maintenance,
      provenance, licenses, supported platforms, randomness and memory handling.
- [x] Freeze supported chains, operation grammar, derivation indexes and session
      limits. Keep unsupported transactions unavailable rather than sign blindly.
- [x] Specify the native review, immutable approval binding and public interface.

N0 decision record: [Native boundary and dependencies](NATIVE_SIGNER_N0.md).
Selected: local Expo module with Swift/Kotlin adapters and native review, shared
Rust core and private UniFFI bindings. User selected Monad testnet native-token
transfers (chain 10143). The record freezes paths, limits, typed requests, native
submission ownership and dependency starting pins. Dependency resolution and Android/iOS simulator builds have since passed; physical
provider and security acceptance remain separate gates.

Exit: design decisions recorded; no native isolation claim until implementation
and adversarial/device acceptance pass.

### N1 — Prove native-only retrieval, derivation and signing

Implementation and remaining gates: [N1 record](NATIVE_SIGNER_N1.md).

- [ ] Obtain PRF inside native credential adapters on Android and iOS.
- [x] Match synthetic derivation/address vectors and independently verify signatures.
- [ ] Derive multiple indexed accounts; demonstrate 12+ signatures from one unlock
      in an isolated fixed-operation probe, without exporting root or child secrets.
- [ ] Verify errors, callbacks, events and diagnostics contain no secret material.
- [x] Prove native EIP-1559 transfer encoding against independent vectors for
      Monad testnet. Live transfer signing waits for N2 native review enforcement.

Exit: device-backed native boundary proof. Android can lead because a test phone
is available; iOS remains a separate gate, not covered by Android success.

### N2 — Implement native review and enforce the approved operation

Implementation: [N2 record](NATIVE_SIGNER_N2.md). Local builds and synthetic tests
pass. Basic Android live transfer, one-unlock batching, cancellation and completed
history restart evidence is recorded in N2. Hostile-bridge, partial/interrupted
submission and physical iOS acceptance remain open.

- [x] Build accessible native confirmation from parsed canonical operation data.
- [x] Bind approval to immutable payloads and validate every signing step natively.
- [x] Reject payload substitution, blind signing, extra accounts/steps, changed
      fee/amount bounds, approval escalation and expired or replayed requests.
- [x] Implement operation serialization, duplicate prevention and native cancellation.
- [x] Enable reviewed Monad testnet native transfers through native-owned RPC
      submission; return hashes/status to JS, not raw signed transactions.

Exit (not yet accepted): adversarial device evidence that a hostile JS caller cannot
bypass review or extend approved signing authority. Completed implementation items
above do not substitute for that evidence.

### N3 — Lifecycle and application integration

First slice implemented: native address-only passkey access, local wallet view,
public address/copy, live Monad testnet balance, reviewed transfers and
account-scoped local outgoing history. See
[N3 implementation](NATIVE_SIGNER_N3.md). This does not complete lifecycle or adversarial acceptance. Native mode still
uses a standalone wallet screen rather than the main tabs; the next product work
is specified in [M6.1 in the mobile implementation plan](../PLAN.md#m61--real-passkey-and-wallet-behavior-in-the-existing-gizu-app).

- [ ] Implement native lifecycle/expiry handling and terminal cleanup.
- [x] Wire wallet controllers to public results and operation status only.
- [ ] Migrate wallet behavior into the existing main tabs and product screens (M6.1); no new wallet UI.
- [ ] Keep the retired JS probe and raw PRF bridge absent; verify native module exports
      on each rebuilt platform and prevent any JS fallback.
- [ ] Implement per-step progress, uncertain-outcome reconciliation and restart behavior.
- [x] Keep real accounts separate from mock balances/orders. Do not connect live
      signing to existing fixture transaction contracts.

Exit: integrated flows preserve authorization boundaries through interruptions.

### N4 — Security acceptance and release decisions

- [ ] Run native unit/integration tests and instrumented adversarial bridge tests.
- [ ] Complete physical-device acceptance for each supported platform/provider.
- [ ] Review release diagnostics, dependency/update trust and the complete signer
      and native-review boundary independently before real funds.
- [ ] Resolve independent recovery, domain/provider loss, account discovery and
      direct withdrawal in a separate design before enabling funding.
- [ ] Verify chosen account contracts do not publish unintended common ownership;
      assess funding/transaction correlation without promising full unlinkability.

Exit: evidence supports the stated guarantee; unresolved gates remain explicit.

## Verification and acceptance

Existing Jest/RNTL functional tests should exercise controllers against mocked
native boundaries. They cannot prove that secrets stay outside JavaScript or that
native authorization works. Add native tests for the actual enforcement code.

Use synthetic secrets for boundary instrumentation. Inspect every return/event,
exception, log and serialization path for PRF, mnemonic, seed and private-key
exposure; do not dump real-user heaps or credentials for testing. Combine code
review and instrumentation: absence from one captured trace is not a universal proof.

Adversarial tests must attempt review bypass, post-approval payload mutation,
wrong chain/account, extra signatures, unknown calldata/typed data, amount/fee
escalation, stale handles, replay, concurrent requests and cancellation races.
Test provider background transitions, genuine backgrounding, expiry, process death,
partial submission and restart. Verify native review is accessible and matches
exactly what native code signs.

For device acceptance, record build revision, OS, device and provider, approval
and unlock counts, account derivation compatibility, 12+ verified signatures,
rejected out-of-scope requests and cleanup behavior. Report passed, failed,
blocked and not-run checks separately. Native commands and current evidence are in the N1 record. N0 scope and acceptance details
are recorded in [the native signer decision](NATIVE_SIGNER_N0.md).

## Relationship to the previous P0–P5 plan

P0 identity remains in force. P1 remains compatibility evidence only. N0–N4 now
precede production P2 access integration and replace P3's JavaScript signer
boundary. Backend challenge authentication (previous P4) remains separate: never
trust a client address or success flag as backend authentication. Recovery and
release gates (previous P5) remain required before funding. N1 adds a separate development probe; production access remains blocked.

## References

- [Mera security model](https://mera.category.xyz/concepts/security-model/)
- [Mera signing sessions](https://mera.category.xyz/concepts/signing-sessions/)
- [Existing derivation recipe](https://mera.category.xyz/recipes/create-passkey-accounts/)
- [React Native modules](https://reactnative.dev/docs/turbo-native-modules-introduction)
- [Android Keystore security boundaries](https://developer.android.com/privacy-and-security/keystore)
- [WebAuthn PRF extension](https://w3c.github.io/webauthn/#prf-extension)
- [ERC-4337](https://eips.ethereum.org/EIPS/eip-4337)
- [Safe passkey signer representation](https://docs.safe.global/advanced/passkeys/passkeys-safe)
