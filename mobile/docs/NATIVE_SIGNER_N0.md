# N0 — Native signer boundary and dependency decision

Date: 2026-09-24. Source baseline: `50c52e9`, plus the current Mera planning docs.
Status: design selected for N1; no native signer, dependencies or transactions
were installed/executed by this phase. Build compatibility and security acceptance
remain N1–N4 gates. Parent: [Mera plan](MERA_PASSKEY_PLAN.md).

The user selected **Monad testnet native-token transfers**, rather than an
offline-only delivery. This record freezes that bounded scope. Production networks,
tokens, approvals, trading contracts, ERC-4337 and arbitrary messages are excluded.

## 1. Threat model and enforceable claim

Target: PRF, mnemonic, seed, extended private keys and child private keys never
cross into JS. The signer issues signatures only for the exact operation approved
through its native review. Treat all JS, request fields, backend responses and
RPC responses as untrusted inputs; distinguish RPC availability from consensus truth.

| Attacker/capability                                 | Required boundary                                                                                                       | Limitation                                                                                                          |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Malicious JS/dependency/OTA JS update               | Cannot read secrets, approve a request, substitute signed bytes, exceed approved limits or call a second raw PRF bridge | Can mislead outside native review, request prompts, cancel or deny service                                          |
| Malicious backend                                   | No key material; supplied operation is parsed and reviewed natively                                                     | Can lie about product information; signer cannot establish investment legitimacy                                    |
| Malicious RPC                                       | Cannot choose signed chain/recipient/value beyond approved fields                                                       | Can lie about nonce/code/balance/receipts; N0 trusts configured RPC for chain-state observations, not authorization |
| Native memory corruption/instrumentation, rooted OS | Outside the claim                                                                                                       | Native secrets reside in app memory; Rust/zeroing reduce risks, not hardware isolation                              |
| Malicious signed native app update/build dependency | Outside runtime boundary                                                                                                | Requires build/release provenance and independent review                                                            |
| Domain/provider compromise, lost passkey            | Separate recovery/trust gate                                                                                            | Same RP is shared with web/dev; mobile isolation does not protect an exposed web PRF                                |

Native review is an app-controlled trusted surface relative to JS, not an
OS-attested transaction display. Prevent JS overlays/touch interception by using
a full-screen native controller/Activity, never a React view/WebView. User approval
must originate from that controller; no JS `approve` method/event. A counterfeit
JS screen cannot authorize the real signer, but social engineering remains possible.

## 2. Pre-removal secret and serialization inventory

The legacy implementation was subsequently removed on 2026-09-24. This inventory
records the audit baseline at `50c52e9`, not files still present in the checkout.
Paths relative to `mobile/`. These observations describe the former prototype,
not a full third-party dependency audit.

| Boundary                         | Current evidence                                                                                                                                                          | Required native change                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Android credential response → JS | `node_modules/react-native-passkey/android/src/main/java/com/reactnativepasskey/PasskeyModule.kt` resolves provider response to JS and forwards native exception messages | Native-only Credential Manager adapter; parse response locally; map errors to codes                              |
| iOS credential response → JS     | `node_modules/react-native-passkey/ios/PasskeyDelegate.swift` includes PRF first/second in extension results                                                              | Native-only AuthenticationServices delegate; never serialize PRF to Expo/JS                                      |
| Mera adapter → service           | `src/services/nativeMeraProbe.ts` invokes create/get PRF APIs; `meraProbe.ts` receives `prfOutput`                                                                        | Remove this path from native-signer builds; retain only separate historical probe build                          |
| Derivation/signing               | `src/services/meraDerivation.ts`: mnemonic string, seed, HD root/child, private key and Mera session all in JS                                                            | Shared native core owns derivation and signing; no secret getters                                                |
| Error handling                   | `describeNativeFailure` sanitizes errors after the native bridge; raw error already reached JS                                                                            | Sanitize before either FFI/public bridge; never return underlying exception text                                 |
| Persistence                      | `src/storage/probeWallet.ts` serializes explicit `parseProbeWallet` projection                                                                                            | Preserve metadata-only policy; native owns trusted credential/account selection; JS metadata is advisory         |
| UI/controller                    | `useProbeController.ts` stores wallet/result/message, uses JS AppState                                                                                                    | Public results only; native lifecycle and operation state become authoritative                                   |
| Logging/crashes                  | No explicit secret logging found in inspected probe/service/storage paths; ErrorBoundary shows generic text                                                               | Disable raw payload/provider logging and secret Debug/Serialize; review release telemetry and generated bindings |
| Cleanup                          | JS buffers cleared and session ended in finally, with known immutable/runtime copies                                                                                      | Explicit native terminal cleanup plus bounded ownership; record unavoidable provider/JVM/Swift copies            |

**Build-level requirement:** not importing react-native-passkey from JS is not
sufficient. The new native-signer build must exclude its raw JS-callable module
(and any equivalent PRF/export path). Remove its autolinking/dependency from that
build or maintain a separate probe target. Verify installed module exports on both
platforms. The native module must not re-export its private UniFFI interface.

## 3. Architecture selection

Select a local Expo module under `mobile/modules/gizu-signer/` with Swift/Kotlin
platform adapters and native review, backed by one Rust core. Use UniFFI only
between Swift/Kotlin and Rust. JS receives a small Expo public interface.

| Option                                                     | Decision                                                                                                  |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Existing Mera JS with a native wrapper                     | Reject: secrets still enter JS                                                                            |
| Independent Swift and Kotlin crypto/policy implementations | Reject initially: duplicate encoding/authorization rules and divergent review behavior                    |
| Local Expo module + shared Rust core                       | Select: one derivation, encoding and policy implementation; explicit platform-owned provider/UI lifecycle |
| Hardware-only wallet or smart-account redesign             | Defer: different key/account and recovery model                                                           |

Rust core: strict parsing, account paths, canonical immutable operation, signing
digest/transaction encoding, bounded sessions and secret ownership. Platform code:
credential access, native review, foreground lifecycle, OS randomness, native
metadata storage and network transport. JS: proposal composition, public progress
and ordinary app UI. No secret-bearing Rust object or buffer crosses into JS.

The native controller owns a private core operation object. Approval sets native
state on that same immutable object. Do not hash one JSON blob for review and later
sign another. Rust builds the typed transaction once; native review displays its
canonical fields; the signer uses exactly that transaction object.

## 4. Selected dependency baseline

Registry metadata and upstream docs inspected 2026-09-24. Versions below are exact
**N1 starting pins**, not an installed lockfile or a proven compatible build. Some
are recent releases; published maintenance activity is not a security endorsement.
N1 must resolve/lock transitive dependencies, inspect features and advisories,
produce license notices and compile both targets before accepting this baseline.
Do not silently upgrade if resolution fails: record a revised selection.

| Component              | Selection / provenance                                                                               | License / review notes                                                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Public bridge          | Existing Expo 57-compatible `expo-modules-core`, Swift/Kotlin local module                           | Expo MIT; use installed SDK resolution, no independent latest upgrade                                                          |
| iOS credentials/UI     | Apple AuthenticationServices + UIKit, iOS 18+ PRF capability                                         | Apple SDK terms; PRF provider/device checks required                                                                           |
| Android credentials/UI | `androidx.credentials:credentials:1.6.0` and `credentials-play-services-auth:1.6.0`; native Activity | AndroidX Apache-2.0; same versions declared by installed passkey package; platform integration still unproven                  |
| Native bindings        | Mozilla `uniffi = 0.32.2`                                                                            | MPL-2.0; generated binding/license obligations reviewed before distribution; private native-to-native API only                 |
| BIP-39                 | rust-bitcoin `bip39 = 3.0.0`, English, zeroize enabled                                               | CC0-1.0; don't enable random mnemonic generation or secret serialization                                                       |
| BIP-32                 | iqlusion `bip32 = 0.6.0`, k256 backend                                                               | MIT OR Apache-2.0; registry dependency is k256 ^0.14; inspect secret copies/chain-code cleanup                                 |
| secp256k1              | RustCrypto `k256 = 0.14.0`, ECDSA/recovery only                                                      | MIT OR Apache-2.0; upstream documents historical audit/fixed issues, not an audit of this version/integration                  |
| Ethereum codec         | Alloy `alloy-consensus = 2.5.0`, `alloy-primitives = 1.7.3`                                          | MIT OR Apache-2.0; native typed EIP-1559 encoding, no custom RLP/crypto; consensus declares Rust 1.94.1 minimum                |
| Cleanup                | RustCrypto `zeroize = 1.9.0`                                                                         | MIT OR Apache-2.0; explicit close and zeroizing owned buffers, not proof every copy is erased                                  |
| Public request parsing | `serde = 1.0.229`, `serde_json = 1.0.151`                                                            | MIT OR Apache-2.0; reject unknown/duplicate fields, floats, oversized/deep input; never derive Serialize/Debug on secret types |

No separate direct hash dependency is necessary if selected Alloy primitives
provide Keccak-256; use Keccak, not SHA3-256, for Ethereum. BIP derivation hashes
come from established crates. Pin toolchain meeting the whole resolved graph's
MSRV during N1; no Rust toolchain was found on PATH during N0. Toolchain/NDK/Xcode
setup and binary size/build timing remain implementation costs.

Randomness: use `SecRandomCopyBytes` on iOS and `SecureRandom` on Android for
32-byte credential challenges and operation IDs; fail closed on error. Never
accept a JS random source. ECDSA nonce generation comes from the selected library's
deterministic signing API, not bespoke nonce code.

UniFFI may copy buffers and retains objects across language lifetimes. Keep PRF
crossing to one private native import, destroy caller copies as soon as possible,
and explicitly close core objects rather than rely on GC/deinit. Android provider
JSON strings and Swift Data copies cannot be promised erased. Do not claim enclave
key protection. No secret persistence, cache, export, debug or backup API.

## 5. Frozen v1 scope and limits

These are conservative engineering limits for the first testnet implementation,
not product-wide defaults. Changing them requires revising native policy/tests.

- Chain: Monad testnet only, chain ID **10143**, native **MON**, 18 decimals.
  Mainnet and all other chain IDs rejected natively.
- Operation kinds: `deriveAccounts`, fixed `probeSignatures`, `nativeTransfers`.
  Do not mix message and transaction kinds within one request.
- Paths: `m/44'/60'/0'/0/i`, integer i = 0..15 inclusive. Preserve account 0 and
  `mera-evm-v1`; record indexed scheme as `gizu-indexed-v1`. No JS-supplied path,
  RP, salt, mnemonic language or passphrase. Native pins these inputs.
- At most 16 distinct accounts and 32 signatures/steps per operation. A 12+
  signature test is within these limits. No root/xpub export. Public index records
  are persisted natively; metadata loss must allow deliberate rediscovery of 0..15.
- Review timeout: 120 seconds. Provider wait timeout: 120 seconds. Signing window:
  120 seconds from successful native credential result, monotonic clock, no sliding
  extension. Native cancellation invalidates immediately; late provider responses
  are discarded. No continuing signatures after process restart.
- Testnet limits: at most 0.1 MON per transfer, 1 MON total value per operation,
  0.1 MON total maximum fees. Values use base-unit unsigned decimal strings with
  checked arithmetic; never JS floating-point amounts. Reject overflow/negative/
  exponent/ambiguous numeric formats. Limits do not replace reviewing exact amounts.
- Request size at most 64 KiB; one active review/ceremony/execution at a time.

Testnet grammar: EIP-1559 type 2 native transfers with exact 20-byte recipient,
nonzero recipient, value, nonce, gas limit, max fee per gas, priority fee, empty
input and empty access list. No contract creation, token approvals/transfers,
typed data, EIP-7702 authorization, ERC-4337 UserOperations or opaque digests.
Check recipient code through native RPC and reject code/delegated accounts in
this slice. This is a state check, not a guarantee the address stays code-free.

Native network configuration allows only a reviewed HTTPS Monad testnet endpoint,
initially `https://testnet-rpc.monad.xyz`; no JS URLs, headers or redirects to an
arbitrary host. Check eth_chainId. Network metadata must be rechecked before N1
live use. Native fetches nonce/fee/estimate/code/balance before review. For multiple steps
from one account, allocate consecutive nonces with checked arithmetic; reject
conflicts or gaps and recheck pending nonce before each submission. Native review
shows the resulting exact numbers and worst-case total `value + gasLimit * maxFee`.
Monad charges gas by gas limit; don't blindly inflate estimates or hardcode old
base fees. Fee changes/replacements require a new review, not automatic escalation.

Signing creates replay-protected chain-specific bytes. Session expiry prevents
new signatures; ordinary EOA transactions have no on-chain expiry. A signed but
unbroadcast transaction remains potentially valid. Do not promise expiry revokes it.

## 6. Public interface and execution ownership

Planned API only; no exported implementation yet:

- `getCapabilities()` → supported kinds, network and bounds; no secret/provider payload.
- `getAccounts()` → native remembered public indexes/addresses, explicitly locked.
- `executeOperation(proposal)` → native review, credential selection/unlock and
  execution; no separate public approve/sign calls. Create/open selection occurs
  in the native surface, never automatically create after an error.
- `cancelOperation(id)`, `lock()` → invalidate native authority; id grants no signing rights.
- `getOperationStatus(id)` → sanitized step states/transaction hashes.
- `forgetMetadata()` → lock first; remove native public metadata, not provider passkeys.

JS may propose account indexes and transfer recipients/values; native validates
all fields. Native assigns operation ID, expiry, credential binding and canonical
review. Unknown fields rejected. Output is public addresses, test proofs, tx hashes
and typed status/error codes. Never return full credential responses, PRF, root/
child keys, native pointers, raw errors or a reusable signer handle.

Native review shows testnet identity, full addresses/account indexes, every step,
exact amounts and individual/aggregate maximum fees. No blind batch approval hidden
behind a summary. It supports accessibility and details without trusting JS labels.
For a forgotten account, derive and show its actual address before the final native
approval; one passkey ceremony can precede approval in this case, but no signing
occurs until approval. Bound and discard the temporary key state on rejection.

Native owns submission and receipt polling through platform transport. Return tx
hashes, not raw signed transactions to JS. Persist a non-secret journal with chain,
account/nonce, canonical intent hash and expected tx hash before broadcast. Do not
persist signed bytes. Submit steps sequentially; confirmation policy is a network
acceptance check, never infer settlement merely from a returned hash. Stop on
ambiguous/error outcomes; reconcile by hash/nonce before a freshly approved retry.
No automatic replacement or new nonce. Native lifecycle cancellation cannot undo
already broadcast transactions. Polling/reconciliation may resume while locked;
signing cannot. RPC outage and insufficient test funds are explicit failures.

Probe message is a fixed native-owned, domain-separated test string containing
operation ID, account index and step number, explicitly disclaiming login/spending.
JS cannot supply arbitrary message text. Return proofs only for this test kind.

## 7. Lifecycle, bypass tests and delivery gates

Native observes foreground, review dismissal, credential callbacks and expiry.
A system provider Activity may pause the app; preserve only the pending ceremony,
require foreground on return, discard late/expired results. Leaving the app during
review/execution invalidates it. Never use JS AppState to grant authorization.
Cancellation can deny service but cannot broaden authority. Lock clears secrets
even when metadata deletion fails. Native progress journal contains no key bytes.

N1 must prove codecs/derivation with synthetic vectors first, then native real-test
passkey derivation and fixed-message signing. Testnet transfers are part of the
first delivery, but live transfer signing waits for N2's actual native review and
policy enforcement; never add a temporary unrestricted transfer signer.

Required evidence before the boundary is claimed:

1. Android arm64 physical device and iOS arm64 device builds; simulator builds aid
   development only. Compile Rust/UniFFI with locked transitive graph and license/
   advisory report. Missing hardware is reported, not counted as passed.
2. Existing zero-entropy account-0 vector plus multi-index synthetic vectors match
   JS reference; recover signatures independently using viem in tests. No real
   passkey secret crosses into the reference implementation.
3. Enumerate public native module methods and attempt to access the removed raw
   passkey bridge, secret exports and private native imports from hostile JS.
4. Test altered chain/value/recipient/fees/index, mutated proposals after approval,
   duplicate/concurrent requests, out-of-range inputs, expired handles, hidden
   additional steps and rejection of unknown calldata/typed data.
5. Test native review cannot be approved by JS, and native frame/lifecycle changes
   cannot skip it. Test provider pauses separately from real backgrounding.
6. Capture synthetic boundary events/errors/logs, inspect owned-buffer cleanup and
   generated bindings. No real-credential heap dumps. Native/JVM copy limits remain.
7. Demonstrate one approval/unlock, 12+ signatures, exact transaction decoding and
   Monad testnet receipts. Exercise partial failure, restart reconciliation and
   cancel-after-broadcast without claiming atomicity or revocation.

N0 verification is documentary/source review only. Native builds, dependency
resolution/advisory audit, real transfers and isolation tests are **not run**.
No release/funding approval follows from this design. Independent recovery,
web parity/isolation, app release identifiers and production privacy remain open.

## Sources and reproducibility

Read on 2026-09-24; revalidate version-specific APIs before implementation.

- [Expo local native modules](https://docs.expo.dev/workflow/customizing/)
- [UniFFI guide](https://mozilla.github.io/uniffi-rs/latest/) and
  [object lifetimes](https://mozilla.github.io/uniffi-rs/latest/internals/object_references.html)
- [Mera security model](https://mera.category.xyz/concepts/security-model/)
- [Android Credential Manager](https://developer.android.com/identity/credential-manager)
- [Android Keystore limits](https://developer.android.com/privacy-and-security/keystore)
- [k256 security notes](https://docs.rs/k256/0.14.0/k256/)
- [BIP-32](https://docs.rs/bip32/0.6.0/bip32/), [BIP-39](https://docs.rs/bip39/3.0.0/bip39/)
- [zeroize limitations](https://docs.rs/zeroize/1.9.0/zeroize/)
- [Alloy consensus](https://docs.rs/alloy-consensus/2.5.0/alloy_consensus/)
- [Registry metadata](https://crates.io): `/api/v1/crates/{name}` and
  `/api/v1/crates/{name}/{version}/dependencies`; observed bip32 0.6.0 → k256 ^0.14.
- [Monad testnet information](https://docs.monad.xyz/developer-essentials/testnet)
- [Monad gas pricing](https://docs.monad.xyz/developer-essentials/gas-pricing)
