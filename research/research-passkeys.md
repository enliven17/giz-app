# Passkey wallet research: Mera, Turnkey and the native signing design

Research consolidated: 24 September 2026.

**Decision:** prototype a user-device wallet engine inside our React Native mobile app. Use a passkey to authorize a bounded operation, and an independently generated local wallet seed to derive and sign for its accounts. The proposed prototype uses neither Mera's PRF-derived wallets nor Turnkey's hosted signing.

**Evidence status:** Mera source and documentation were inspected; Turnkey documentation and pricing were researched; the native architecture and Android test specification were written. No native prototype, physical-device signing test, recovery drill or production security audit has been completed. “Addresses a requirement by design” must not be read as “verified in a working product.”

## 1. Product context and the six criteria

The Earn app needs one user identity to manage a funding wallet, a confidential-balance signer, multiple investment wallets and fresh withdrawal wallets. A teammate's allocation algorithm will decide the number of investment wallets and their amounts. One investment or withdrawal may require more than twelve signatures at different times as routing and settlement complete.

The six criteria below preserve the user's original five requirements and the later requirement about platform experience. Affordability is an additional binding constraint, rather than silently replacing one of the six.

| # | Requirement | Practical meaning |
| --- | --- | --- |
| 1 | One identity controls all derived wallets | No wallet switching, separate passkeys or separate unlocks for each account. The app can act across all accounts in an approved operation. |
| 2 | One unlock, many signatures | One intent confirmation and one passkey authentication permit the operation's subsequent signatures, including delayed steps. |
| 3 | No wallet secrets exposed to the frontend | Seed, private keys, PRF root and signing shares must not enter Earn JavaScript. The stronger web requirement also excludes secrets in a separate popup's JavaScript. |
| 4 | User control and independent access | A company-backend outage must not remove ownership or make the company a mandatory cosigner. Users need an independently usable recovery/access path. |
| 5 | No direct public ownership link | Do not publish a common passkey public key, master wallet, owner registry or shared authorization that explicitly joins the accounts. This does not guarantee transaction anonymity. |
| 6 | One usable interface across the intended platforms | React Native mobile stays inside the app with the OS authentication sheet. Web may use a popup, but must not require an extension installation or repeated app switching. |

**Economic constraint:** the user expects possibly $1 or less in revenue per user, depending on invested amount. A $5-per-user signing bill is unacceptable. The user therefore selected local self-custody over purchasing per-signature infrastructure. Development, audits, RPC, gas and protocol fees still cost money.

**Resumption constraint:** a new unlock after termination or expiry is acceptable. Progress, account allocation and submitted transactions must survive; retries must not duplicate payments.

## 2. What we found about Mera

### 2.1 Why we initially considered it

Mera offers a convenient way to obtain a reproducible secret from a passkey's WebAuthn PRF extension and use it for blockchain accounts. Its account recipe converts PRF output into BIP39 seed material and derives numbered EVM accounts at `m/44'/60'/0'/0/{index}`. It also demonstrates a separate Ed25519 derivation for Solana. A signing session can then produce multiple signatures without invoking the authenticator for each one. [Mera account recipe, inspected commit](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/docs/src/content/docs/recipes/create-passkey-accounts.mdx).

This matched the intended UX: unlock once, derive A1…AN, and manage them without switching wallet applications. Using separate EVM derivation indices gives separate addresses; using the same key across EVM chains repeats the address.

Logging out and back in can reproduce the same wallets **when the same credential, PRF input, derivation scheme and account indices are retained**. Creating another passkey is a different operation. The inspected implementation uses a documented default PRF salt and returns the resulting bytes to its caller. [Mera passkey implementation](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/passkey.ts).

### 2.2 The security mismatch

The passkey's authentication private key and the derived blockchain keys are different things. Mera's documented model keeps the former in the authenticator while the PRF output and derived software keys enter the calling runtime. Its documentation explicitly treats the host environment as trusted and describes hostile scripts intercepting the PRF output or using a live signing session. It also explains that zeroing buffers is not proof that every copy disappeared. [Mera security model, inspected commit](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/docs/src/content/docs/concepts/security-model.mdx).

For our threat model, this means a compromised Earn page could capture enough material to reproduce the wallets, or misuse an active signer. The attacker would not need to extract the authenticator's own private key. Ending the session later cannot revoke a wallet key that was already copied.

The inspected secp256k1 API accepts private-key bytes and exposes `signDigest` for a 32-byte digest. The session implementation holds a copy until `end()` clears its owned buffer. These are useful low-level primitives, but they do not enforce an investment amount, allowed recipients, approved vaults or an aggregate operation budget. [Signing implementation](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/secp256k1.ts), [session implementation](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/session.ts).

React Native alone does not fix that boundary. The inspected Mera adapter invokes a native passkey library and returns PRF output into the TypeScript-facing API. A native authentication prompt does not mean derivation and signing stay native. [React Native adapter](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/react-native-webauthn-client-internal.ts).

**Conclusion:** this was a mismatch with our hostile-frontend model, not evidence that Mera's cryptography was broken or that it is unsuitable for every mainnet application. The review covered npm `@category-labs/mera` 0.2.0 and commit `a3102f4fa7b89ce4e58e843a2d6da2201035ff25`, not an unspecified future release.

### 2.3 The Mera team's response and our assessment

The user supplied a response attributed to Kai Jun Eer proposing an IndexedDB-stored, non-extractable `CryptoKey`, with a qualification about the level of frontend compromise. This is user-provided correspondence, not a verified public roadmap or a promise that Mera implements that design.

The suggestion provides a useful distinction: preventing raw key export can reduce exposure. However, `extractable: false` controls export/wrapping; it does not itself prohibit operations allowed by the key's usages. [MDN: CryptoKey extractability](https://developer.mozilla.org/en-US/docs/Web/API/CryptoKey/extractable).

Our assessment:

- A same-origin attacker that obtains a key handle may still invoke its permitted signing/decryption operations. Full arbitrary JavaScript XSS is not automatically contained by non-extractability.
- If PRF/root bytes first enter JavaScript and are then imported, hostile code can capture them before import.
- Standard WebCrypto ECDSA curves do not provide a general secp256k1 signing replacement for Mera's EVM keys. Wrapping those bytes with a non-extractable AES key still leaves the question of where plaintext is decrypted. [WebCrypto specification](https://www.w3.org/TR/webcrypto/).
- A timer or UI confirmation in the same compromised JavaScript context cannot enforce a security boundary against that context.

We therefore needed both **key isolation** and **an independent decision about what may be signed**.

## 3. Alternatives we explored before choosing the native design

These are architecture conclusions from our requirements analysis, not claims that we implemented every alternative.

| Proposal | What it could help with | Why it did not settle all requirements |
| --- | --- | --- |
| Collect all signatures immediately after one unlock | Reduces later prompts for transactions already fully known | Leaves exposed root keys exposed; future quotes, nonces, settlement and fees may not be known. A batch of signed transactions can also remain usable after the UI session ends. |
| Short-lived Mera session plus CSP/dependency controls | Reduces attack opportunities and duration | Valuable defense in depth; does not survive arbitrary hostile code in the trusted runtime or undo root-key theft. |
| Move derivation into WASM or a worker | Changes execution organization | Does not establish a trusted signer against malicious code controlling the caller, messages and code delivery. |
| Independent Mera signer origin/iframe/popup | Same-origin policy can separate Earn code from wallet code | Wallet-origin JavaScript still sees secrets. It needs independent deployment and a narrowly scoped RP ID; a broad parent RP can undermine separation. User rejected treating a second wallet app as the main solution. |
| Browser extension plus a native helper | Can keep signing outside website JavaScript | Requires installation. User explicitly rejected that onboarding requirement. |
| Our backend holds the complete seed | Removes keys from frontend code | Gives the operator signing power and creates a backend availability dependency unless another independently usable path is built. Not the chosen self-custody model. |
| Noir/zero-knowledge proofs | Can prove authorization statements without publishing their witnesses | A proof system does not itself supply secure key storage, independent recovery or an offline signer. Requires a separate, concrete account/protocol design. |
| Passkey plus PRF key, either one sufficient | Allows alternative authorization | The exposed PRF-derived key remains sufficient to spend, so the second factor does not close the original attack. |
| Fresh passkey approval plus second signer for every transaction | Adds authorization checks | Requiring a fresh WebAuthn ceremony per transaction undermines the intended many-signature UX. Approving one bounded session is a different design. |
| User/server 2-of-2 threshold signing | Neither share alone signs | Mandatory server participation blocks signing during server outages. Recovery/quorum alternatives must be explicitly designed. |
| Smart accounts with one public passkey owner | Can support delegation and session permissions | Reusing a visible owner/public key across accounts can directly join them. Privacy-preserving ownership requires additional design, not an assumption. |

The browser isolation and extension mechanisms are real capabilities; the rejection above is about fit with our requirements. [Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy), [Chrome Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging).

### Why “combine PRF with WebAuthn” was not enough

WebAuthn's PRF extension deliberately exposes its output to the relying-party client. It does not offer a standard command that privately derives an arbitrary family of EVM keys and signs an unlimited transaction sequence inside the authenticator. [WebAuthn PRF extension](https://www.w3.org/TR/webauthn-3/#sctn-prf-extension).

A P-256 passkey key and a secp256k1 wallet key are not automatically shares of one threshold signature. Treating them as two required approvals is possible at another layer, but that layer must define verification, delegation and availability. Combining two outputs already visible to the frontend does not create a secret from that frontend.

The useful idea that survived was **one authenticated approval of a bounded operation**, followed by a signer enforcing that operation. We needed to decide where that signer lived.

## 4. What we found about Turnkey

### 4.1 Why it was a serious candidate

Turnkey provides protected signing infrastructure with passkey-authenticated access and session mechanisms. We investigated it as a way to keep blockchain private keys out of Earn JavaScript while retaining multiple actions per login. Its sessions use client-side authentication keys to stamp requests; its documentation distinguishes those keys from session JWT metadata. The authorization credential therefore still needs protection even when the blockchain key is elsewhere. [Turnkey sessions](https://docs.turnkey.com/features/authentication/sessions/overview).

Scoped session profiles are evaluated on each request and can constrain allowed activities/resources and expiry. Profiles are immutable; omitting a profile yields a session without those scope restrictions. This supported the bounded-session direction, but did not prove that our full cross-chain aggregate budget could be enforced by a default configuration. That would require policy-specific integration and tests. [Session profiles](https://docs.turnkey.com/features/authentication/sessions/session-profiles).

Our security inference was that a frontend compromised during a broadly authorized session could still request damaging signatures. Protected custody is not a substitute for scoped authority or trustworthy confirmation. A non-extractable API authentication key can also be usable by malicious same-origin code without being exportable.

### 4.2 Users, sub-organizations and scale

One sub-organization per user was a natural model, with that user configured as the root authority and an HD wallet containing multiple accounts. Turnkey documents no count limit on sub-organizations, parent read-only visibility, and billing aggregation to the parent. Thus, 10,000 users was not ruled out by the sub-organization model itself. Root/quorum configuration determines who can act; sub-organizations can model either user-controlled or custodial wallets. [Sub-organizations](https://docs.turnkey.com/features/sub-organizations).

A wallet and its derived wallet accounts are separate concepts; six addresses do not inherently require six separately provisioned HD wallets. Plan wallet allowances, API throughput and commercial terms still matter. [Turnkey wallets](https://docs.turnkey.com/features/wallets).

The parent visibility also means there is no claim of account unlinkability from our organization or the signing provider. The criterion about avoiding a common owner on-chain is narrower.

### 4.3 Custody and outage distinctions

Turnkey was not automatically equivalent to giving our backend control of users' funds. A user-root configuration and directly authenticated API requests can avoid making our application server the sole authorization path. [Request authentication and stamps](https://docs.turnkey.com/api-reference/overview/stamps).

It nevertheless introduces a hosted signing service. Independence from **our backend** differs from independence from **Turnkey**. An alternate client would still need valid credentials, identifiers, RP access and service availability.

Turnkey supports an export encrypted to a user-controlled target encryption key, including one created offline. This could support an independent recovery path if completed and safely stored before a service outage. Export capability is not the same as an already usable backup; decrypting an export in Earn JavaScript would also violate our strict secret-isolation requirement. [Wallet export](https://docs.turnkey.com/features/wallets/export-wallets).

We did not deploy or validate that recovery arrangement.

### 4.4 Pricing and the decision to move away

Pricing rechecked on 24 September 2026. Published plan tables show $0.10/signature for Pay as You Go with 25 free monthly signatures, and Pro at $0.05/signature with a $99 monthly minimum. Enterprise advertises a negotiated floor of $0.0015/signature, not an available quote for us. [Turnkey pricing](https://www.turnkey.com/pricing).

For **500 users × 100 signatures each per month = 50,000 signatures**:

| Option | Calculation | Signing estimate/month |
| --- | --- | ---: |
| Pay as You Go | `(50,000 − 25) × $0.10` | **$4,997.50** |
| Pro | `50,000 × $0.05`, above the minimum | **$2,500** |
| Enterprise advertised floor | `50,000 × $0.0015`, only if negotiated | **$75 hypothetical** |

Pro therefore implied **$5/user/month**, before other expenses. This is a usage estimate, assuming the monthly minimum is a floor rather than an additional fee; no invoice or contract was obtained. The FAQ also mentions lower volume pricing, but we did not assume a discount or a flat unlimited-signature allowance.

Published wallet allowances were 1,000 Pay as You Go, 2,000 Pro and unlimited Enterprise. The research did not establish commercial terms for 10,000 users.

**Why we rotated:** the concrete $5/user estimate did not fit the user's stated unit economics, and the user preferred eliminating paid signing infrastructure and keeping normal signing on the user's device. This was not a finding that Turnkey cannot support passkeys, multiple accounts or user-controlled configurations. Local development may cost more initially; no total-cost-of-ownership study was completed.

## 5. The chosen mobile design

### 5.1 What replaces Mera and Turnkey

```text
User opens the React Native Earn app
                  │
        Proposes an investment/withdrawal
                  ▼
Native engine parses the operation and displays its actual limits
                  │
        One passkey authentication
                  ▼
Native verifier opens a bounded, expiring operation session
                  │
        Independent local HD wallet seed
                  ├── Funding account
                  ├── Investment accounts A1…AN
                  ├── Fresh return accounts R1…RN
                  └── Confidential signer through a separately verified adapter
                  │
Native policy checks each step → signs → records/submits → reports progress
```

The passkey is still the user's authentication anchor. It is no longer the source of blockchain key material. Multiple accounts share a protected local root and authorization session, not a publicly recorded master-wallet owner.

React Native continues to provide the product interface. A Kotlin module on Android, and eventually a Swift integration on iOS, connects platform authentication/storage to native wallet primitives. Trust Wallet Core is the selected prototype candidate for HD derivation and chain signing; it does not supply our authorization policy or execution journal. [React Native native modules](https://reactnative.dev/docs/turbo-native-modules-introduction), [Trust Wallet Core](https://developer.trustwallet.com/developer/wallet-core).

Mera is absent from the selected prototype. We retain the product idea of one unlock controlling many accounts, not its PRF-to-wallet implementation. Reintroducing its default TypeScript signer would reintroduce the boundary we are trying to remove.

### 5.2 How this addresses the initial key-exposure problem

The proposed engine generates random wallet entropy locally and never returns it, derived keys, decryption results or a wallet-root PRF to React Native. It exposes public account data and operation results. Since wallet generation does not depend on the passkey PRF, an attacker obtaining that PRF from a permitted web context would not thereby reconstruct this independent wallet root.

Stored entropy is encrypted under an Android Keystore key. Keystore can keep its own key material non-exportable and can provide hardware-backed storage on supported configurations. That does **not** mean the decrypted wallet seed and secp256k1 keys stay in hardware while our native signer uses them. [Android Keystore](https://developer.android.com/privacy-and-security/keystore).

The protection target is hostile JavaScript using the exposed app interfaces. Native code, libraries and release integrity remain trusted. We must inspect every installed native module, including generic storage, file and execution bridges, so an unrelated API cannot bypass the narrow wallet interface. Native memory corruption, malicious native updates or an OS compromise remain outside this proposed boundary.

An ordinary secure-storage wrapper returning a seed to JavaScript fails our requirement. AsyncStorage is unencrypted and unsuitable for wallet secrets; React Native itself is not a secure-wallet facility. [React Native security guidance](https://reactnative.dev/docs/security).

### 5.3 How this addresses the signing-oracle problem

Hiding keys is insufficient if compromised JavaScript can ask the native code to sign any hash. The engine must instead authorize a parsed operation with enforced constraints:

- Total value and per-wallet allocations.
- Permitted chains, assets, recipients, contract methods and vault beneficiaries.
- Token allowance, fee and slippage limits.
- Validity period, required dependencies, step ordering and nonces.
- Atomic aggregate-budget reservations so concurrent calls cannot overspend.
- Retry/replay protection and a durable record of submitted transactions.

The native confirmation uses the same normalized operation the policy executes. A JS `approved: true` flag, opaque digest or arbitrary calldata is not sufficient. Assertion verification binds the approved manifest to a fresh native challenge and registered credential. The passkey sheet proves authentication; it is not by itself an independently rendered transaction review.

A compromised frontend can still propose something harmful. The engine must reject actions outside the permitted product policy and display actual approved consequences. It cannot prevent a user from knowingly approving every harmful action, nor eliminate all protocol/contract risk.

### 5.4 Why many signatures need only one intended unlock

The passkey authorizes the session once; the engine later signs with each account's key after policy checks. It does not ask the authenticator to sign each blockchain transaction. The proposed Android session lasts 15 minutes, with delayed steps supported while valid. New permissions require new approval; expired or terminated sessions require another unlock.

There is an explicit storage tradeoff in the prototype: the Keystore encryption key is not configured to require an additional authentication prompt for every decryption. Native passkey verification gates use at the application layer. This avoids assuming that a Credential Manager authentication automatically authorizes a separate Keystore operation. It is **not a cryptographic 2-of-2 construction or hardware-enforced passkey-to-seed binding**.

The platform can show credential selection or additional screens. The exact normal single-unlock experience remains a physical-device acceptance test, not a promise inferred from APIs. [Android Credential Manager](https://developer.android.com/identity/credential-manager).

## 6. Assessment against all six criteria

Every native-design entry below is a proposed property until its listed test passes.

| Criterion | Mera as inspected | Turnkey option | Proposed native design and remaining proof |
| --- | --- | --- | --- |
| 1. One identity controls many wallets | Numbered accounts and live sessions fit | HD accounts plus authenticated sessions fit in principle | Local HD root derives accounts; one session manages them. Prove six accounts and persist allocation metadata. |
| 2. One unlock, many signatures | Available through software sessions, with host-runtime exposure | Documented sessions; operation policy still needed | One assertion opens bounded local authority. Prove 12+ signatures, including delayed steps, on physical devices. |
| 3. No frontend wallet secrets | Fails our hostile-JS requirement in the inspected flow | Can keep blockchain keys out of the frontend; session credentials and export paths still need care | No root/key/PRF crosses the RN bridge. Review APIs and test malicious JS. Does not promise protection from arbitrary native compromise. |
| 4. User control and independent access | Local derivation, but credential/RP continuity or export is necessary | User-root/direct access possible; service availability and advance backup matter | Local signing requires no company cosigner. Independent portable recovery/tool still must be built and tested. |
| 5. No direct public ownership link | Distinct EOAs need not expose a common root | Individual EOAs need not expose provider/account grouping | Only individual EOA signatures go on-chain; common passkey/manifest remain local. Funding and transaction correlation remain separate risks. |
| 6. Same usable interface, no extension | Convenient embedded UX but problematic secret boundary | Embedded UX possible; economics rejected | Mobile can keep everything in-app. Android prompt behavior is untested; iOS untested; strict zero-install web remains unresolved. |

**Cost comparison:** the native design removes vendor fees per locally generated signature. It does not remove gas, protocol costs, RPC costs, security engineering, maintenance or support. Economics motivated the choice; total cost has not been proven lower at every scale.

## 7. User control, recovery and backend outages

We must distinguish four situations:

| Situation | Intended behavior / dependency |
| --- | --- |
| Our backend is unavailable but the installed app and RPC work | Local keys remain usable. Product orchestration may need alternate direct access; unavailable quotes/routes cannot be invented. |
| App terminated or signing session expired | Reload the operation journal, reconcile chain/protocol outcomes and ask for another unlock before remaining signatures. |
| Phone lost, app data erased or Keystore key invalidated | Restore from independent user-held recovery material. Passkey sync alone cannot restore the independent wallet seed. |
| Aurora/FAR, a chain or a vault is unavailable | Ownership does not remove external protocol availability constraints. A recovered key cannot force an unavailable system to settle. |

Before real deposits, recovery needs portable seed material, derivation/version information, allocated account indices and relevant confidential-account/position metadata, plus a separately usable restoration tool. It must work without the company's API secret, database, original device or authorization. A backup encrypted only to a lost device's Keystore is insufficient.

Passkeys are RP-bound, and Android apps need an association with the RP. A new arbitrary recovery website cannot simply request the old credential. Independent recovery must therefore have an established alternative to relying on the original domain and app association. [Android association requirements](https://developer.android.com/identity/credential-manager/prerequisites).

The tradeoff versus Mera is deliberate: we give up passkey-PRF-only reconstruction to remove that root from the frontend-accessible derivation path. We have specified recovery as mandatory but have not implemented or validated it.

## 8. Progress preservation and safe resume

The accepted UX permits another unlock, not another deposit. Native state must durably track the operation manifest, allocated accounts, step IDs, budget reservations, nonces, signed transaction bytes, hashes and observed outcomes.

Persist the exact signed transaction before broadcasting. If the app dies after submission but before receiving an acknowledgement, restart by checking the stored hash and nonce. A timeout is not proof of failure. Rebroadcasting the same transaction differs from creating another transfer with a new nonce. Resolve unknown outcomes before repeating economic actions.

Session authorization is memory-only and expires. The journal persists progress but does not silently restore spending authority. Reorgs, replacement transactions, expired quotes, partial completion and consumed unknown nonces must be reconciled. A fresh unlock resumes the same account allocations and unfinished steps within their approved limits.

The mobile acceptance criteria and build specification define these tests. They have not yet been run.

## 9. Privacy and the Earn integration

“No direct public link” means the wallet layer need not disclose its common controller. It does not mean that A1…AN are guaranteed untraceable. Common gas funding, exact amounts, timing, public fan-out/fan-in, RPC logs, application telemetry or later consolidation can expose relationships. The app can also see the accounts it orchestrates. Do not equate privacy from public chain observers with privacy from the app operator or routing providers.

The allocation algorithm remains a teammate-supplied component. It proposes how much to send to how many accounts; native authorization must verify aggregate bounds and account ownership. Choosing wallet counts or splitting amounts does not itself prove anonymity.

Our earlier Aurora research identified a separate confidential-balance layer behind Aurora's routing interfaces. Replacing the wallet implementation does not eliminate that protocol or prove that every signature format is supported. The confidential account signer, quote binding, payout recipients, return routes and vault methods need their own native adapters. The Android prototype's twelve EVM transfers do not validate those adapters. See the [steps 3–4 specification](outputs/steps-3-4-confidential-balance-distribution-spec.md) and [signed-spending research](outputs/aurora-signed-spending-verification.md).

Fresh return wallets are new addresses under the local wallet, not necessarily new passkey credentials. Their keys remain user-controlled, and reusing a common passkey locally does not require publishing that passkey on-chain.

## 10. Required proof before proceeding (In progress)

The user made real-device testing a blocking requirement. An Android phone is available; no app repository existed when the prototype was specified. At the last environment inspection, this Mac lacked a working Android SDK and full Xcode installation. These are recorded setup facts, not permanent limitations.

The Android prototype must demonstrate:

1. A real passkey ceremony and native verification; no mocked unlock.
2. One intent confirmation and one intended authentication ceremony followed by 12+ valid signatures across six distinct accounts.
3. Delayed signing within the same authorized operation, including a wait simulating bridge settlement.
4. Rejection of unauthorized recipients, values, calldata, raw hashes, replay and concurrent overspending.
5. No wallet secrets in bridge payloads, JavaScript storage, logs or diagnostics.
6. Termination, expiry, lock, background and network-loss handling without lost allocations or duplicate payments.
7. An evidence report with device/OS/provider/build/storage configuration, actual prompt counts and independently verified signatures.

Production approval additionally requires independent recovery, full routing/vault adapters, broader device/provider coverage, native dependency/release review and a security audit appropriate to holding user funds. Neither this research report nor a successful twelve-signature demo replaces that work.

## 11. Evidence index and related artifacts

### Primary sources

| Source | Finding supported |
| --- | --- |
| [Mera security model at inspected commit](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/docs/src/content/docs/concepts/security-model.mdx) | Software-key exposure, trusted host and zeroization limits |
| [Mera account recipe](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/docs/src/content/docs/recipes/create-passkey-accounts.mdx) | PRF-based account derivation |
| [Mera passkey source](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/passkey.ts) | Returned PRF material and salt behavior |
| [Mera session source](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/session.ts) | Session-owned private-key buffer |
| [Mera secp256k1 source](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/secp256k1.ts) | Digest-signing interface |
| [Mera RN adapter](https://github.com/category-labs/mera/blob/a3102f4fa7b89ce4e58e843a2d6da2201035ff25/library/src/react-native-webauthn-client-internal.ts) | PRF result crosses into the library's JS-facing path |
| [WebAuthn](https://www.w3.org/TR/webauthn-3/) | Credential ceremonies, assertions and PRF semantics |
| [WebCrypto](https://www.w3.org/TR/webcrypto/) | CryptoKey operations and standard algorithm interface |
| [Turnkey pricing](https://www.turnkey.com/pricing) | Published pricing basis; not a negotiated quote |
| [Turnkey sub-organizations](https://docs.turnkey.com/features/sub-organizations) | User model, parent visibility and count support |
| [Turnkey wallets](https://docs.turnkey.com/features/wallets) | Wallet/account distinction |
| [Turnkey sessions](https://docs.turnkey.com/features/authentication/sessions/overview) | Session authentication and multiple actions |
| [Turnkey session profiles](https://docs.turnkey.com/features/authentication/sessions/session-profiles) | Request scope and expiry enforcement |
| [Turnkey exports](https://docs.turnkey.com/features/wallets/export-wallets) | User-targeted encrypted export |
| [Turnkey request stamps](https://docs.turnkey.com/api-reference/overview/stamps) | Direct authenticated API requests |
| [Android Credential Manager](https://developer.android.com/identity/credential-manager) | Native passkey interface |
| [Android RP association](https://developer.android.com/identity/credential-manager/prerequisites) | Domain/application setup |
| [Android Keystore](https://developer.android.com/privacy-and-security/keystore) | Storage-key protection and access controls |
| [Apple Secure Enclave](https://developer.apple.com/documentation/security/protecting-keys-with-the-secure-enclave) | Platform key protection; not proof of this implementation |
| [React Native native modules](https://reactnative.dev/docs/turbo-native-modules-introduction) | Native integration boundary |
| [React Native security](https://reactnative.dev/docs/security) | Storage cautions |
| [Wallet Core](https://developer.trustwallet.com/developer/wallet-core) | Native cryptographic primitives |
| [Chrome Native Messaging](https://developer.chrome.com/docs/extensions/develop/concepts/native-messaging) | Rejected extension/helper transport |

### Local research and implementation handoff

- [Android prototype build specification](outputs/android-wallet-signing-prototype-spec.md): implementation contract and test order.
- [Mobile signing acceptance criteria](outputs/mobile-signing-acceptance.md): mandatory physical-device evidence.
- [Wallet custody requirements](outputs/wallet-custody-requirements.md): detailed product constraints.
- [Earlier Mera hardening research](outputs/mera-signing-hardening/hardening.md): historical alternatives; its isolated-signer recommendation predates the later constraints and is superseded by the decision in this report.
- [Captured Mera npm package](work/mera-review/package/package/package.json): inspected version 0.2.0.
- [Captured Mera source security model](work/mera-review/source/mera-a3102f4fa7b89ce4e58e843a2d6da2201035ff25/docs/src/content/docs/concepts/security-model.mdx): immutable local evidence.

The selected direction moves key handling and authorization out of Earn JavaScript while keeping normal signing on the user's device. It is a justified architecture to test, with explicit recovery and platform gaps; it is not yet a demonstrated solution to all six criteria.
