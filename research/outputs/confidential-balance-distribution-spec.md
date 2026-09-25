# Confidential balance, investment-wallet distribution and destination transfer

Version: 0.8 · 25 September 2026 · Engineering specification

Wallet baseline: our [combined Android wallet prototype](../combined-wallet-prototype/README.md). Aurora provider findings below retain the evidence recorded on 22 September 2026. A separate EOA/Circle Paymaster transaction was executed on Arbitrum Sepolia on 25 September 2026. The standalone mainnet run funded C from a zero-MON Monad EOA and settled three confidential Aurora payouts to Ethereum on 25 September 2026. A corrected ownership proof then read and reconciled C's 0.098009 USDC residual through Aurora. The A1 → A3 transfer was not sent because A1's allocation was below Circle's maximum gas prefund.

This specifies the accepted Earn diagram from confidential credit through destination delivery and the subsequent A1 → A3 transfer. Requirements below are proposed application behavior. The standalone Node.js mainnet test verifies provider behavior, not the combined Android wallet integration.

## 1. Outcome and scope

The user authenticates with one passkey in our combined wallet app, deposits USDC on Monad, and selects Earn on Ethereum. Step 3 credits a user-controlled confidential account, C. Step 4 distributes part or all of its available balance through confidential Aurora Intents to N fresh investment wallets derived natively from the wallet’s independent entropy. The destination-chain settlement unshields each allocation into public Ethereum USDC. In the three-destination scenario, destination 1 (A1) then sends its USDC to destination 3 (A3) using its own USDC to pay gas through Circle Paymaster. The passkey authorizes operations; it does not derive the wallet keys. A separate teammate supplies the algorithm choosing N and each allocation amount.

Step 4 ends with confirmed destination receipts, the confirmed A1 → A3 transfer for this scenario, and a handoff to step 5. Vault approval/deposit, investment management and redemption are outside this specification. Destination gas readiness is an explicit handoff requirement, not an assumed property of receiving USDC.

The app must support partial execution, recovery after app termination or session expiry, and later reuse of C for redemption proceeds. It must not publish the wallets' common passkey ownership. The requested A1 → A3 transfer is an explicit public consolidation: it links those two destination addresses onchain and must be treated as a privacy consequence of this scenario.

## 2. Aurora feasibility and dependency decision

**Aurora can be the API used to authenticate and read the confidential balance, and to request quotes that credit or debit it. This is access to the underlying NEAR/FAR Confidential Intents system, not a separate confidential balance on Aurora EVM.** [S1–S5]

Verified Aurora API base: `https://intents-api.aurora.dev`.

| Capability | Published Aurora endpoint / behavior |
|---|---|
| Authenticate C | `POST /api/auth/authenticate/{apiKey}`; supports `erc191` |
| Refresh read session | `POST /api/auth/refresh/{apiKey}` |
| Read private balances | `GET /api/account/balances/{apiKey}` with user bearer token |
| Read private history | `GET /api/account/history/{apiKey}` with user bearer token; the tested account currently receives HTTP 400 `History is invite-only for now` |
| Quote funding or spending | `POST /api/quote/{apiKey}` with `CONFIDENTIAL_INTENTS` channel fields |
| Generate spending payload | `POST /api/generate-intent/{apiKey}`; found in official source and published package, verified live request validation |
| Submit signed spending payload | `POST /api/submit-intent/{apiKey}`; same evidence |
| Track quote | `GET /api/status/{apiKey}`; confidential response contains status only |

**Correction to v0.1:** the documentation index omitted these operations, but Aurora's official widget source and published npm package 7.24.0 call `/api/generate-intent/{apiKey}` and `/api/submit-intent/{apiKey}` on `https://intents-api.aurora.dev`. Both production routes returned operation-specific HTTP 400 validation errors for deliberately empty unsigned requests; a nonexistent control route returned HTTP 404. The generate validator explicitly accepts `erc191`. The missing-endpoint gap is closed. [S12–S14]

Aurora's quote schema explicitly requires a signed transfer intent to fund a `CONFIDENTIAL_INTENTS` source. The Aurora client generates a payload using the quote's `depositAddress`, has the user sign it, and submits it using the same Aurora API-key configuration. A deposit transaction notification is a separate operation. The 25 September mainnet test confirmed this quote → generate → sign → submit path and three Ethereum USDC receipts. The initial ERC-191 account-authentication proof returned HTTP 401. After using a timestamped versioned nonce for the public `intents.near` verifier, Aurora returned HTTP 200 for authentication and private balances. The balance was 0.098009 USDC after the three payouts. Private history returned HTTP 400 because provider access is invite-only. [S2–S5, S18]

**Standalone mainnet result (25 September 2026):** a zero-MON Monad EOA funded C with USDC, then three signed confidential payouts settled to Ethereum. The funded run used `basic`; the later `advanced` checks generated quotes and unsigned intents only. See the transaction-by-transaction test record in §9. C account authentication and its remaining balance are now verified; the A1 → A3 Ethereum transfer remains unverified.

### Chosen application boundary

Implement one internal `ConfidentialIntentsGateway`. Business logic never calls provider endpoints directly. Maintain one C account and one reconciliation model per user; do not build independent Aurora and NEAR balances.

| Deployment option | Decision |
|---|---|
| All intent/account API calls through Aurora | Selected design: quote, generate, local sign, submit, status, authentication and balance reads; history is currently invite-only |
| Direct 1Click integration | Not required to fill the endpoint gap; retain only as an explicitly chosen future alternative |

Keep quote generation, payload generation, submission and status on Aurora. The standalone test proved account authentication, private balance access and asset mapping for its C signer. The Android native adapter and private history access still need separate validation. Do not reproduce the widget's public Intents settlement watcher as a substitute for confidential status/history reconciliation.

Use a small REST adapter plus our native wallet engine. Extend the current fixed EVM self-transfer signer with validated source-token transfers and a native ERC-191 confidential-account signer; those adapters are not yet implemented. Installing Aurora's full widget is not required: its package contains NEAR/Defuse dependencies and additional public-chain behavior that this embedded-account flow need not import. Correct intent serialization/signature encoding still needs tested tooling. A separate NEAR wallet, named NEAR account, direct 1Click API client or full NEAR wallet SDK is not required by the verified endpoint flow. NEAR/FAR remains the underlying protocol dependency. [S10, S12–S14]

**Release gate:** prove both funding C and spending/refunding C before enabling real-money funding. Balance access alone is insufficient.

## 3. Accounts, asset identity and responsibility

| Item | Ownership / responsibility |
|---|---|
| F | Owned source funding account derived by the native wallet engine |
| C | Distinct native wallet signing identity controlling the private ledger balance; its derivation and protocol account mapping must be versioned and verified |
| A1…AN | Fresh investment accounts allocated from the same independent wallet root by the native engine |
| Account registry | Native encrypted derivation indices, roles, chain, operation and addresses, covered by the extended recovery format |
| Allocation algorithm | Teammate-owned wallet-count and amount calculation |
| Orchestrator | Application requests and displays progress; native code validates allocations, owns account/budget reservations and enforces execution authority |
| Gateway | Provider APIs, schema normalization, credential handling and capability checks |
| Native signer | Validates account ownership proofs, spending intents, destination EIP-7702 authorizations, USDC permits and user operations; signs within a passkey-authorized operation; no wallet secrets enter React Native JavaScript |

C is an Intents account identifier, not an Ethereum USDC balance. Resolve its implicit ECDSA account identifier using the supported account model. Do not register the funding wallet as a public common owner of A1…AN. Use unique derivation indices per role and operation; never send the root or private keys to the backend. [S10, W1–W3]

Maintain exact identifiers for source-chain USDC, the credited confidential token, the quote asset used to spend that token, and destination-chain USDC. Do not identify assets by `USDC` alone or collapse distinct chain representations. The live Aurora-generated unsigned private spend named an `imt:<shard-id>:<quote-asset-id>` token under `intents.far`. Aurora's authenticated balance endpoint instead returned the underlying quote asset ID with `source: private`. Match the read balance by that asset ID and source, while validating the distinct IMT-wrapped ID in the generated spend. Do not collapse these IDs or map solely by symbol.

All monetary values are integer strings in token base units. Convert display decimals exactly; never use floating-point arithmetic. USDC examples assume six decimals only after metadata verification.

### Current native baseline and required extensions

The combined Android app generates 32-byte entropy independently of the passkey and derives six EVM accounts at `m/44'/60'/0'/0/{index}`, indices 1–6, using Trust Wallet Core 4.8.3. The existing policy permits only twelve zero/one-wei self-transfers on chain 31337, with a delayed second batch. It persists signed transactions before broadcast. It does not yet sign ERC-20 transfers, ERC-191 protocol messages, EIP-7702 authorizations, EIP-2612 permits, ERC-4337 user operations or arbitrary destination routes. The signing module is the accepted starting point; this revision makes no new device-test claim. [W1–W2]

Keep wallet secrets and derivation in Kotlin/native code. The RN bridge supplies typed operation requests and receives public accounts, balance/progress views and redacted errors. Add native validation for F’s token transfers, C’s authentication/spending messages and A1’s destination-chain authorization, permit and user operation. A provider-generated payload is untrusted input until parsed, bound to the approved quote/plan and checked for allowed actions, assets, amounts, nonce and expiry. Pin the destination chain, USDC contract, EntryPoint, paymaster and delegated account implementation before signing; reject unexpected existing EOA delegation. Do not add a generic `signDigest` or arbitrary-calldata bridge method.

Before generalizing the six accounts, define a versioned role/index registry for F, C, Ai and future return wallets. Preserve existing account paths and allocate atomically; no role mapping is implied by the current indices. Bind native confirmation and passkey authorization to a normalized operation ID/revision, recipients and aggregate debit/fee limits. The current operation challenge binds ID/revision/action; variable manifests require corresponding immutable native state and validation before authority is granted. Quote refreshes must stay within approved bounds or request fresh approval.

The current backup uses passkey PRF output only to AES-GCM wrap the existing entropy and fixed six-account metadata. Restore requires both that encrypted file and the original passkey, and currently starts with an empty operation journal. Extend the backup/recovery contract for dynamic account indices, C’s protocol identity and the state needed to discover balances/positions and reconcile pending spends. Stale backups must not reset spent nonces or replay distributions. Second-phone restoration and independent RP access remain unverified; the prototype RP uses a temporary tunnel. Native Keystore storage uses application-level passkey gating, not hardware-enforced per-signature authentication. [W1, W3]

## 4. Step 3 — credit and reconcile the confidential balance

### Inputs and outputs

Inputs: user operation ID, F, C, source chain/USDC asset, confidential target asset, authorized source spend, refund address F, fee/slippage policy and a valid native operation session when a signature is needed.

Output: confirmed confidential funding record with C, exact private token ID, reconciled amount, route references and current spendable balance. A source transfer receipt is not itself evidence of private credit.

### Sequence

1. Derive or restore C and its encrypted registry entry inside the native engine. Verify this is the same C used by the user's existing funds.
2. Authenticate using an ownership message validated and signed natively by C, with fresh nonce, valid deadline, correct signing domain and no spending intents. Use Aurora's `erc191` envelope and required signature encoding. For account authentication, sign an empty-intent payload for the public `intents.near` verifier with its current four-byte salt and a versioned nonce containing both an expiry and creation timestamp; private spending remains bound to `intents.far`. Store access/refresh tokens in native secure storage, separately from app login credentials; expose balance views instead of bearer tokens through the RN bridge. [S2, S18]
3. Request the funding quote using the fields below. Quote asset IDs come from the validated asset mapping, not UI symbols.
4. Validate the returned source chain, deposit address, amount, recipient C, asset, refund F and confidentiality against the approved operation.
5. For the source test, use F's available Monad USDC up to a 10 USDC cap and simulate its transfer through Pimlico's ERC-20 Paymaster using EIP-7702 and EntryPoint v0.8. Quote Aurora funding for `selected USDC budget − required USDC gas prefund`, re-simulate against the returned deposit address and repeat until the funding amount plus its own fee cap equals that budget at token precision. Pimlico fronts native gas and collects the gas charge in USDC from F; the application does not intentionally fund or subsidize this transaction. Confirm provider billing liability for failed USDC collection before production. The intended route requires no MON top-up or app gas reserve. Check the source EOA's existing delegation and pin the token, paymaster and account implementation. After native confirmation and passkey authorization, sign the bounded operation and persist the exact signed UserOperation before submission or retry. Use the application's Pimlico API key for mainnet paymaster access; the key authenticates the offchain request and is not a gas sponsorship policy. Check the returned onchain paymaster data for any app-specific marker before treating it as unlinkable to other onchain operations. [S17]
6. Track source confirmation and provider processing. An optional provider deposit notification accelerates discovery; it does not move the funds.
7. Reconcile the exact funding route status with C's authenticated private balance response. The balance response includes `tokenId`, `available` and `source: private`; the history endpoint is a separate, optional source of transaction-level detail because access is currently invite-only. Do not assume net credited amount equals the gross source deposit. [S3, S5, S6]
8. Mark C spendable only when the route and account evidence agree. A current balance proves how much C can spend at the time of the read, but does not by itself prove which funding operation produced every unit. If credit attribution is uncertain, enter reconciliation state; do not infer this operation's credit from an unrelated balance increase.

The funded run initially used a narrower temporary rule after an HTTP 401: a confirmed source receipt plus `SUCCESS` on the exact funding route authorized spending no more than the quote's `minAmountOut`. All three intents settled. The corrected authentication proof later read the exact 0.098009 USDC residual and matched the quote's expected credit minus those debits. New production flows should use the authenticated reconciliation gate above rather than treating the historical fallback as sufficient.

Funding quote configuration:

| Field | Value |
|---|---|
| `depositType` | `ORIGIN_CHAIN` |
| `recipientType` | `CONFIDENTIAL_INTENTS` |
| `recipient` | C |
| `refundType` | `ORIGIN_CHAIN` |
| `refundTo` | F |
| `swapType` | `EXACT_INPUT` for the authorized source funding amount |
| `confidentiality` | Explicitly `advanced`; never omitted or `public` |

Both non-public enum values are documented as confidential execution. This prototype selects `advanced` to match Aurora's current confidential swap example. Aurora and NEAR do not publish a precise difference between `basic` and `advanced`; do not infer extra amount masking, delays or batch behavior from the name. [S4]

Account reads use the user's bearer token. Partner API credentials alone do not authorize reading or spending user funds. Access-token expiry should refresh the read session; a new spend still requires a spend signature.

### Step 3 states

`CREATED → QUOTED → AWAITING_SOURCE_SIGNATURE → SOURCE_SUBMITTED → PROCESSING → CREDIT_RECONCILING → CREDITED`

Exceptional states: `QUOTE_EXPIRED`, `SOURCE_STATUS_UNKNOWN`, `INCOMPLETE_DEPOSIT`, `REFUND_PENDING`, `REFUNDED`, `FAILED`, `NEEDS_RECONCILIATION`, `NEEDS_USER_UNLOCK`.

Never resubmit a new source payment because a status call timed out. Late/under/over-funding follows the actual quote's rules. Refund completion requires evidence, not merely a local timer.

## 5. Allocation algorithm contract — teammate-owned

The teammate supplies allocation logic. Our implementation supplies a versioned interface, validates output, binds wallet slots to native wallet accounts, and executes the plan. It must not silently substitute an equal split or change N.

Recommended packaging: a pure module running client-side, receiving amounts and constraints. It needs no passkey secrets, wallet addresses, user identity or provider credentials. If supplied as a service instead, document the extra exposure of allocation metadata.

### Request contract

| Field | Meaning |
|---|---|
| `requestId` | Stable identifier for this planning request |
| `sourceAsset` | Exact confidential quote asset ID and decimals |
| `destinationAsset` | Destination chain, token contract, quote asset ID and decimals |
| `availableSourceAtoms` | Reconciled available amount after existing app commitments |
| `maxTotalSourceDebitAtoms` | User-approved maximum debit for the entire operation |
| `requestedAmountAtoms` | Requested distributable amount, interpreted by `amountBasis` |
| `amountBasis` | `SOURCE_INPUT` or `DESTINATION_OUTPUT`; mandatory |
| `constraints` | Supported wallet-count range, route minima/maxima when known, fee cap, gas provision budget, slippage limit and operation expiry |
| `quoteFeedback` | Optional structured infeasibility/cost information for a revised plan |

### Response contract

| Field | Meaning |
|---|---|
| `algorithmVersion` | Version of teammate's allocation logic |
| `planId` | Unique, persistable plan identity |
| `walletCount` | Number of destination wallets N |
| `amountBasis` | Same meaning as request |
| `allocations[]` | `{ allocationId, walletSlot, amountAtoms }` |
| `unallocatedAtoms` | Amount intentionally left unallocated, in the plan's amount basis |
| `validUntil` | Latest time this plan can start execution |
| `decision` | `EXECUTABLE` or `INFEASIBLE`, with machine-readable reason when infeasible |

V1 has one USDC allocation per wallet: wallet slots are exactly `0…N-1`, each used once. Gas routes are separate child operations and do not alter this count. If a later algorithm requires multiple USDC intents for one wallet, version the contract explicitly.

`SOURCE_INPUT` means each `amountAtoms` is a confidential source debit and maps to `EXACT_INPUT`. Destination receipts vary with fees and execution bounds. `DESTINATION_OUTPUT` means each amount is the target receipt and maps to `EXACT_OUTPUT`, subject to route support and confirmed quote semantics. Reject an unsupported amount basis rather than reinterpret it.

Validation requirements:

- Integer amounts are positive, representable at the asset precision and within supported route bounds.
- N is within configured product/provider constraints and equals allocation count.
- Slots and allocation IDs are unique; no unknown recipient address can enter via algorithm output.
- Sum of allocation amounts plus `unallocatedAtoms` equals `requestedAmountAtoms` in the selected amount basis.
- The sum of actual maximum source commitments, gas-funding commitments and reserves fits both C's spendable amount and the user-approved maximum debit.
- Plan validity and quote validity overlap with enough time to obtain required signatures.
- Persist the accepted plan. If randomized internally, recovery reuses that stored result instead of rerunning the algorithm.

Illustrative fixture only, not the allocation algorithm: for 12,000 USDC of `SOURCE_INPUT` distribution budget after separate reserves, an output could be N=4 and `[3,500; 3,100; 2,900; 2,500]`. Sum = 12,000. Net destination receipts follow their quotes. No equal-split or privacy strategy is imposed by this fixture.

If quoting makes the plan infeasible, return structured feedback to the algorithm. Replanning creates a new version; it never silently edits already signed or executing allocations. A plan needing broader consent pauses for that consent.

## 6. Step 4 — execute distribution

### Preconditions

C is authenticated and reconciled; a working signed-spend provider path is enabled; the algorithm plan passes validation; the user has authorized the operation's budget and destination; native account allocation and the required protocol signing adapters are available. The current six-account self-transfer demo alone does not meet these preconditions.

### Sequence

1. Atomically reserve fresh derivation indices and persist `planId + walletSlot → accountRef/address`. Concurrent calls or workers must not allocate the same index. Once an address is exposed in a quote, do not recycle it into another plan.
2. Bind each allocation to its derived destination wallet Ai. The algorithm never supplies private keys or arbitrary recipients.
3. Request a quote per allocation. Initial quote discovery may be parallel; actual execution concurrency is bounded and provider-tested.
4. Validate all quotes and maximum source commitments before submitting any spend. Reserve the approved commitments against C in an app ledger. Quotes themselves do not necessarily reserve liquidity.
5. Generate each unsigned spending payload with Aurora `POST /api/generate-intent/{apiKey}`, body `{ type: "swap_transfer", standard: "erc191", signerId: C, depositAddress: quote.depositAddress }`. The client source expects `{ intent, correlationId }`. Compare signer C, allowed operations, quote binding, asset IDs, amounts, recipient/refund bindings where represented, domain, deadline and nonce against the accepted plan. An opaque mismatch is rejected, never blindly signed.
6. C signs exact validated payload bytes inside the native engine using its bounded operation session. The native adapter constructs the ERC-191 signing input and enforces the approved manifest; JavaScript cannot request an arbitrary digest signature. Package `erc191` signatures in the provider's format; a raw wallet hex signature is not automatically the final wire format. Keep authentication proofs and spending messages distinct.
7. Persist the intent identity and encrypted signed payload, then submit to Aurora `POST /api/submit-intent/{apiKey}`, body `{ type: "swap_transfer", signedData }`. The client source expects `{ intentHash, correlationId }`. Use the same payload/nonce when safely retrying an uncertain submission; first query its status. Do not create a second spend just because the first response was lost.
8. Track every child route, reconcile private debits/refunds and independently confirm the destination receipt.
9. Prepare a handoff record for step 5 when that wallet's receipt meets the approved bounds and chain-finality policy. In the three-destination scenario, hold the A1 and A3 handoffs until their post-delivery transfer is confirmed, then publish their reconciled balances. USDC arrival and gas readiness are separate fields.

Payout quote configuration:

| Field | Value |
|---|---|
| `depositType` | `CONFIDENTIAL_INTENTS` |
| `recipientType` | `DESTINATION_CHAIN` |
| `recipient` | Ai, allocated by our native account registry |
| `refundType` | `CONFIDENTIAL_INTENTS` |
| `refundTo` | C |
| `originAsset` | Validated quote asset corresponding to C's spendable token |
| `destinationAsset` | Exact target-chain USDC asset |
| `amount` / `swapType` | Derived from algorithm amount basis |
| `confidentiality` | Explicitly `advanced`, matching the funding quote |

For this source type, quote `depositAddress` denotes an internal account to fund by signed intent. Do not send an ERC-20 transaction to it. [S4, S8]

### Budget accounting

For every asset, maintain commitments across all native operations/workers. A conservative decision uses the reconciled provider snapshot plus local movements not yet reflected in that snapshot. Track whether each pending debit is already reflected; never subtract the same commitment twice. Serialize reservation changes and reconcile after each result. Do not count an expected refund until confirmed.

Do not add an estimated fee again if it is already included in quoted input/output. Use maximum quoted source requirements for exact-output routes. The later A1 → A3 user operation spends gas from A1's destination USDC balance; its fee is distinct from Aurora bridge/swap fees and must not be debited from C a second time. Unspent confidential residual value stays in C.

### Completion evidence and handoff

Confidential public status returns only execution status, not destination transaction details. Use authenticated account history where available plus destination-chain reads/confirmed token transfer logs. Bind receipts to the dedicated allocation address, correct token contract and execution window; deduplicate `(chain, txHash, logIndex)`. A dust transfer or unconfirmed balance increase cannot complete the allocation. If attribution or amount is unresolved, retain reconciliation state. [S5, S6]

Handoff record: `operationId`, `planId`, `allocationId`, `accountRef`, recipient, chain ID, token contract, confirmed received atoms, receipt evidence, finality state, gas readiness, and approved vault target reference.

Step 4 delivery may finish while gas is pending; step 5 cannot execute until its gas/sponsorship and signing requirements are met. In this scenario, A1 and A3 handoff amounts are reconciled again after their public transfer. The vault adapter must use the correct account signer and share receiver.

### States and partial completion

Per allocation: `PLANNED → QUOTED → AWAITING_SIGNATURE → SIGNED → SUBMITTED → PROCESSING → DELIVERY_RECONCILING → DELIVERED`.

Exceptional states: `QUOTE_EXPIRED`, `SUBMISSION_UNKNOWN`, `REFUND_PENDING`, `REFUNDED`, `FAILED`, `NEEDS_RECONCILIATION`, `NEEDS_USER_UNLOCK`.

Aggregate operation: `PLANNING`, `READY`, `EXECUTING`, `PARTIALLY_DELIVERED`, `COMPLETED`, `ACTION_REQUIRED`, `CANCELLED_BEFORE_SUBMISSION`.

Completion means every required allocation is delivered and, for the three-destination scenario, the A1 → A3 transfer is confirmed. Refunded allocations are not deliveries. Retry only failed/unsubmitted allocations after resolving old signatures and commitments; never repeat successful payouts. Sent/signed work cannot be assumed cancellable. Application execution is non-atomic.

### Post-delivery transfer — A1 to A3 with USDC-paid gas

This is a separate, public Ethereum operation after Aurora's confidential payouts settle. The `CONFIDENTIAL_INTENTS → DESTINATION_CHAIN` route remains in a non-public Aurora mode, but each resulting Ethereum USDC receipt is public. That receipt is the unshielding point; no separate destination-wallet unshield transaction is implied by the selected quote. Do not mark a wallet delivered from Aurora status alone. [S4–S6]

1. Require confirmed Ethereum USDC receipts for A1 and A3, the exact destination token contract and adequate finality. A1 and A3 are the first and third native-derived wallets in the same accepted plan; reject externally supplied substitute addresses. If either Aurora payout is pending or refundable, keep this transfer blocked.
2. Simulate a candidate A1 → A3 user operation with the bundler/paymaster. Calculate the required USDC paymaster prefund from the quoted gas limits, capped gas price and conversion, then set the transfer to `A1 confirmed USDC − required paymaster prefund`. Re-simulate that amount and repeat until the final transfer amount plus its own required prefund equals A1's confirmed USDC balance at token precision; reject the transfer if no positive amount satisfies that check. Do not add an app-defined gas reserve. Recompute if the quote or gas price changes before signing, and show the final transfer amount and maximum USDC charge for explicit passkey-authorized confirmation. Circle refunds any unused prefund only after execution, so that refund remains in A1 and must be reconciled; the exact final gas cost cannot be known beforehand. A3's final balance is its own delivered allocation plus the confirmed A1 receipt, subject to other recorded movements.
3. Use the existing A1 EOA key and address. If A1 has no compatible delegation, sign a chain-bound EIP-7702 authorization to a pinned ERC-4337-compatible account implementation. Check the onchain code first; never overwrite an unknown delegation. A1 also signs a bounded EIP-2612 USDC permit for Circle Paymaster and the exact ERC-4337 user operation that transfers USDC to A3. All three signatures are validated and produced by the native engine under the approved operation. No ETH top-up from F or an app-controlled wallet is required. [S15–S16]
4. Use Circle's permissionless v0.8 USDC Paymaster on Ethereum (`0x0578cFB241215b77442a541325d6A4E6dFE700Ec`) with EntryPoint v0.8, subject to live contract and bundler checks at execution time. Verify the bundler supports the required EntryPoint and 7702 authorization, simulate the final transfer amount and fee together, enforce the quoted USDC prefund as the fee cap, then submit. The bundler sends the chain transaction and the paymaster charges A1 up front and refunds the difference after actual gas is known. The paymaster is shared infrastructure; do not configure an app-owned sponsorship policy. [S15]
5. Persist the authorization target and nonce, permit bound, user-operation hash, transfer amount, A3 address and submission state before retry decisions. Reconcile the user-operation receipt, Ethereum transaction status, A1 → A3 USDC `Transfer` log, Circle fee charge/refund and both balances. A lost response triggers status lookup, not a new authorization or duplicate transfer. Only then mark the post-delivery transfer complete and update A1/A3 handoffs.

Per-transfer states: `WAITING_FOR_RECEIPTS → READY → AWAITING_A1_AUTHORIZATION → SIMULATED → SUBMITTED → TRANSFER_RECONCILING → COMPLETE`; exceptional states: `FEE_QUOTE_EXPIRED`, `BUNDLER_UNAVAILABLE`, `SUBMISSION_UNKNOWN`, `FAILED`, `NEEDS_RECONCILIATION`, `NEEDS_USER_UNLOCK`. A3 needs no gas to receive USDC. Any later spend by A3 needs its own compatible gas path.

**Privacy consequence:** the public A1 → A3 `Transfer` directly associates those two wallets and combines their balances at A3. A common permissionless paymaster avoids an app-specific gas-sponsor address; it does not hide that association, the transfer amount or timing. The app must show this consequence before authorization and must not describe the post-unshield transfer as confidential. The bundler can also observe the submitted user operation. [S15–S16]

**Evidence boundary:** the EOA/7702/Circle route succeeded on Arbitrum Sepolia with zero ETH: 0.01 test USDC transferred and 0.023702 test USDC net gas charge. The standalone Aurora mainnet route and three Ethereum payouts also succeeded. The A1 → A3 Ethereum mainnet paymaster leg remains untested onchain because the A1 allocation cannot cover Circle's current maximum gas prefund. The combined Android native engine has not executed this route. [S16]

## 7. User experience, security and persistence

The user sees deposit progress and Earn progress, aggregated amounts, fees and actionable recovery. The A1 → A3 confirmation separately shows the transfer amount, maximum USDC gas charge and public address-linking consequence. Internal account counts and provider terminology need not appear in the main flow. Material budget changes require authorization even when technical wallet details stay hidden.

The combined wallet opens a 15-minute native session after native confirmation and a fresh verified passkey assertion. Within the approved operation, the engine can create multiple signatures, including delayed signatures. Expiry or invalidation requires another unlock before fresh signing; submitted work may still settle, and an already issued signature is not revoked by locking the app. Native execution must reconcile that work before resuming. The backend must never obtain the wallet entropy to avoid this constraint. [W1–W3]

Store operation/plan versions, encrypted account registry, allocation bindings, quotes/expiry, signing payload hashes, necessary encrypted submission records, reservations, provider references and receipt/refund evidence. Do not put bearer tokens, secrets, full recipient arrays or source-to-recipient mappings into public logs or analytics.

Keep partner credentials backend-side. A backend proxy handling account sessions can read their private data; acknowledge this trust boundary. Prefer short-lived handling and scoped internal access. Private ledger execution does not make the app operator blind to requests it processes.

No silent fallback to public Aurora routes, no public common-owner registration, and no direct gas funding from F to Ai. The requested A1 → A3 operation is an explicitly authorized public transfer after unshielding. Neither wallet-count selection nor splitting proves unlinkability; this transfer additionally creates a direct A1/A3 link.

## 8. Acceptance criteria and provider release gates

1. On app restart with local state intact, the native wallet reloads F, C, allocated destinations and operation progress. After device/data loss, the encrypted backup plus the original passkey restores the same keys and extended account metadata; protocol and pending-operation reconciliation completes before new spending. Passkey sync alone is insufficient. The current fixed-six-account backup must be extended and second-device recovery tested.
2. A timestamped, versioned ERC-191 ownership proof authenticated the standalone C through Aurora and enabled its private balance read. The Android signer must reproduce the format; other-account, wrong-domain and expired proof rejection still needs validation.
3. Funding reaches the intended private token balance, reconciles fees and never becomes spendable on source confirmation alone. In the source test, F holds no MON. The selected budget is its available USDC, capped at 10 USDC; the verified Monad USDC paymaster quote and final UserOperation keep the combined source transfer and gas prefund within that budget. F pays its own gas charge in USDC; no app-funded gas sponsorship is configured. The paymaster fee is rechecked before signing, and a changed quote stops the spend for re-quoting; the funded mainnet receipt confirms the API-key-authenticated ERC-20 paymaster route and its 0.001704 USDC actual charge. [S17]
4. Confidential token IDs map correctly to spendable quote asset IDs; no symbol-only matching occurs.
5. A generated signed spend debits C and delivers the correct token to the intended wallet; a refundable failure returns value to C.
6. An authenticated confidential quote → generate → sign → submit → settle/refund test passes entirely through Aurora-hosted intent/account APIs. The standalone funded quote → generate → sign → submit → settle path now passes for three destinations. The corrected ERC-191 proof passed through Aurora, and the private balance reconciled. History access remains invite-only, and refundable failures plus Android-native signing remain release gates. No direct 1Click request is required in this test.
7. Algorithm fixtures cover varying N, source-input and destination-output semantics, invalid sums, excessive fees, infeasible small transfers and unavailable routes. No fixed equal-split fallback exists.
8. Concurrent native calls/workers cannot double-reserve funds or reuse derivation indices. Duplicate callbacks/submissions do not duplicate payouts.
9. Quote expiry and lost submission responses recover without creating a second spend. Partial success preserves successful allocations.
10. Confidential status redaction is handled; confirmed recipient receipts are required for delivery. Chain reorgs/finality policy and unrelated dust are covered.
11. App termination/session expiry preserves tracking and allocations; fresh signing waits for native passkey authorization. No wallet entropy, private keys, PRF output or backup plaintext crosses the RN bridge or reaches backend services. Wrong-recipient, wrong-chain, wrong-domain, over-budget and replayed requests fail native policy checks.
12. Step 5 receives the correct per-wallet receipt and gas state. USDC funding is never represented as an already-created vault position.
13. A1 remains an EOA at the same address and can submit its first Ethereum user operation with a chain-bound EIP-7702 authorization, USDC permit and Circle v0.8 Paymaster while holding zero ETH. A mainnet integration test verifies the chosen implementation, EntryPoint, paymaster, bundler and fee cap; the Arbitrum Sepolia proof alone does not satisfy this gate.
14. A1 → A3 transfers only after both confidential payouts become confirmed public receipts. The app calculates the required USDC paymaster prefund from simulation, sets the transfer to A1's confirmed balance minus that prefund, and verifies that the final simulated transfer plus its prefund equals the balance at token precision. It adds no discretionary gas reserve and recomputes if the quote changes. It shows the public linkage, signs under native/passkey policy, confirms the exact USDC transfer and fee/refund logs, and updates both handoffs. Retries cannot duplicate the transfer; any paymaster refund left in A1 is reported accurately.

These are required integration outcomes, not claims that they have already passed. The teammate's algorithm implementation and valid Aurora credentials/test funding are external inputs to implementation. Endpoint discovery no longer blocks the Aurora-only API design.

## 9. Test record and current evidence

These experiments used the standalone [`confidental-routing` runner](../confidental-routing/README.md) and test EOAs from its local `.env`; they did not use or validate the Android native signer. Its ignored `.local` state holds signed operations, quote references and C's key. Do not copy those secrets into this specification or public logs. Funding the source wallet publicly was outside the test scope.

### 22 September — Aurora signed-spend endpoint discovery

Aurora's published widget source and npm package 7.24.0 call the production `/api/generate-intent/{apiKey}` and `/api/submit-intent/{apiKey}` endpoints. Deliberately empty requests with an invalid key returned operation-specific HTTP 400 validation while a nonexistent control route returned 404; `erc191` appeared among supported signing standards. This established the hosted API path, not authenticated settlement. The complete probe record is in the [endpoint verification note](aurora-signed-spending-verification.md). The later mainnet payout test below used a valid Aurora API key for quote, generation and submission; C account authentication was still failing at the time of that test and was corrected afterward.

### 25 September — USDC-paid gas tests before mainnet routing

| Network and check | Observed result |
|---|---|
| Ethereum Sepolia, no-key Pimlico ERC-20 Paymaster, EIP-7702 EOA and EntryPoint v0.8 | SOURCE started with 20 test USDC and 0 ETH. It sent 1 test USDC to DEST1; the paymaster charged 0.735409 test USDC. SOURCE ended with 18.264591 test USDC and 0 ETH. [Transaction](https://sepolia.etherscan.io/tx/0x3531cd07961f183da0ff4cd971b6c2f53d2d46f1d0b8f746a84a9ac3674ecf06); UserOperation `0x5eee78f53e27b6580f0e0aeb4e6250c30b3bd2022f8abcf2d7c5db2734bc0042`. Preview and signed maximum gas charges were 1.740856 and 1.549274 test USDC, under the script's 2 USDC ceiling. This proves the no-key *testnet* path only. |
| Monad testnet, public Pimlico endpoint | EntryPoint v0.8 and paymaster contract existed, but `pimlico_getTokenQuotes` returned no quote for canonical testnet USDC. No funded USDC-paid operation was possible there. |
| Robinhood testnet, Thru | The published Robinhood *mainnet* addresses had no code on testnet. No verified Thru testnet deployment was found; unpublished addresses cannot be ruled out. `https://thru.family/docs/` returned 404 in this check. |
| Arbitrum Sepolia, Circle Paymaster with EIP-7702 | A zero-ETH EOA sent 0.01 test USDC and paid 0.023702 test USDC net gas, preserving its EOA address. [Transaction](https://sepolia.arbiscan.io/tx/0x765d8458dfcd3f4e1e7f9b3d3c3893bae7cf5f9b19ad5438a76dc901c67e8b84). This verifies the mechanism on Arbitrum Sepolia, not on Ethereum mainnet. |

### 25 September — funded Monad → confidential C → three Ethereum payouts

The source wallet began with 9.807581 USDC and 0 MON. The runner capped its selected budget at 10 USDC, used a Pimlico API key for the Monad mainnet ERC-20 paymaster request and paid the gas charge from SOURCE's own USDC. It sent 9.804795 USDC into Aurora's confidential route in [Monad transaction `0x033ce57c…de49f1`](https://monadscan.com/tx/0x033ce57c6817b25209ad9560d2eb106600ba82b7ee1d89567c78c89ff8de49f1). The actual source gas charge was 0.001704 USDC, leaving 0.001082 USDC and 0 MON in SOURCE. Aurora reported the funding route `SUCCESS`.

The funding quote expected 9.800873 USDC in C and guaranteed a 9.702864 USDC minimum. Aurora's initial ERC-191 `auth/authenticate` call returned HTTP 401 (`Signature verification failed`). That proof used `intents.far` and a random nonce without the required timestamps. At the time of payout, private balance and history could not be read. The test conservatively spent only the quote minimum, split by **source amount** 30/30/40 across three child payouts; it did not claim exact 3/3/4 destination receipts. The generated payout payloads named the `intents.far` confidential verifier and an `imt:<shard-id>:<quote-asset-id>` token. All three signed intents were accepted and reached `SUCCESS`.

| Destination | Public Ethereum USDC receipt | Native ETH |
|---|---:|---:|
| A1 | [2.303576 USDC](https://etherscan.io/tx/0x8a043dfad059c6904b5e3cf5ae62eb15f87931940fec110645048564521aa569) | 0 |
| A2 | [2.303576 USDC](https://etherscan.io/tx/0x2c407a151041523216b1e78f6d23e08028b4ccb605923ee45dfc6b52b45de42b) | 0 |
| A3 | [3.271435 USDC](https://etherscan.io/tx/0x5522268c236f7803c5b31f1537ca1e60777f7801f99855ced83097d92d811a5d) | 0 |

Each receipt is a public destination-chain transfer and the point where its allocation leaves the confidential balance. An Etherscan label such as “NEAR Intents” names underlying settlement infrastructure; it does not by itself show whether the private signed spend was exposed. Neither this test nor the provider documentation establishes absolute unlinkability against timing and amount analysis.

The funded run used `confidentiality: "basic"`. The runner was then changed to `"advanced"`; Aurora accepted a funding quote and three payout quotes, and generated unsigned payout intents in that mode. **No advanced-mode funding or payout was broadcast**, so the mainnet transactions above are evidence for `basic`, not `advanced`. Aurora and NEAR document both values as Confidential Intents handling but do not publish a verified behavioral distinction. Do not claim that `advanced` offers stronger privacy until the provider specifies the difference and a funded run tests it.

### 25 September — ownership proof fix and private balance reconciliation

**Why the first read failed:** Aurora's generic HTTP 401 (`Signature verification failed`) did not identify the malformed field. The first ownership proof reused `intents.far`, the verifier seen in confidential spending payloads, and used an unstructured random nonce. A later versioned-nonce attempt still omitted its creation timestamp. NEAR's direct auth endpoint gave the more useful `timestamp validation failed` response. The final proof followed the official SDK's nonce layout: the current public `intents.near` contract salt, a versioned 32-byte nonce with a five-minute expiry and creation timestamp, an empty `intents` array, and C's ERC-191 signature. That proof returned HTTP 201 on direct 1Click and **HTTP 200 through Aurora**. Because both verifier and nonce format changed between the first and successful Aurora requests, the initial 401 cannot be attributed to one field alone. [S2, S18]

**What caused confusion:** the three `intents.far` spending signatures succeeded while the separate `intents.near` ownership proof failed. Successful spending therefore did not show that C could authenticate for account reads. After authentication was fixed, private balances and private history still produced different results: the balance endpoint was available, but history required an invitation. The balance response also used the underlying quote asset ID whereas generated spend payloads used its `imt:<shard-id>:<quote-asset-id>` form. These are distinct API surfaces and identifiers, not evidence of two different balances.

Aurora `GET /api/account/balances/{apiKey}` returned HTTP 200 with one matching private entry: asset ID `nep245:v2_1.omni.hot.tg:143_2dmLwYWkCQKyTjeUPAsGJuiVLbFx`, `available: "98009"` atoms, `source: "private"`. For the verified six-decimal asset, that is **0.098009 USDC**. The funding quote expected 9.800873 USDC and the three private debits totaled 9.702864 USDC; their difference is exactly 0.098009 USDC. This reconciles the current available balance for the standalone C account. The balance API reports the quote asset ID, while generated spend payloads use its `imt:<shard-id>:<quote-asset-id>` form; the runner now handles them as distinct IDs.

These are **two separate endpoints with different access results**. The authenticated `GET /api/account/balances/{apiKey}` succeeded (HTTP 200) and directly reported C's current private available balance of 0.098009 USDC. The authenticated `GET /api/account/history/{apiKey}` returned HTTP 400 `History is invite-only for now`, so it did not provide individual private credit and debit records. The 0.098009 USDC figure comes from the successful balance response, not from history. Its equality to the funding quote's expected output minus the three recorded payout debits is a consistency check; without history, it is not an independent transaction-by-transaction audit of the private ledger. No new transfer was signed or submitted during these reads.

### A1 → A3 preview and remaining work

Circle's Ethereum mainnet paymaster required a 2.819883–2.874467 USDC **maximum prefund** in live previews, more than A1's entire 2.303576 USDC receipt. The runner stopped before signing or submitting A1 → A3. This is a maximum amount collected before execution, with unused USDC refunded afterward; the final cost cannot be inferred from a failed preview. The previous approach of reserving 0.000001 USDC based on the largest simulated transfer was corrected to calculate the maximum prefund from EntryPoint v0.8 gas limits and Circle's live `fetchPrice()`, `feeSpread()` and `additionalGasCharge()` values. No discretionary reserve is added.

Open validation items: obtain provider access if private history is required; execute and inspect a funded `advanced` route if retained; perform an Ethereum mainnet A1 → A3 test only when the source allocation can cover the full prefund; test refundable failures; and implement the same constrained signing and recovery behavior in the combined Android wallet. The Sepolia and standalone Node.js results do not satisfy those production integration gates.

## 10. Official sources

- S1: [Aurora Confidential Intents](https://docs.intents.aurora.dev/confidential-intents)
- S2: [Aurora signed-user authentication](https://docs.intents.aurora.dev/api-reference/confidential-swaps-api-reference/authenticate-user-with-signed-data) and [refresh](https://docs.intents.aurora.dev/api-reference/confidential-swaps-api-reference/refresh-access-token)
- S3: [Aurora private balances](https://docs.intents.aurora.dev/api-reference/confidential-swaps-api-reference/get-user-token-balances)
- S4: [Aurora quote schema](https://docs.intents.aurora.dev/api-reference/swap-api-reference/request-a-quote)
- S5: [Aurora authenticated account history](https://docs.intents.aurora.dev/api-reference/confidential-swaps-api-reference/get-transaction-history)
- S6: [Aurora status](https://docs.intents.aurora.dev/api-reference/swap-api-reference/get-swap-status)
- S7: [Aurora published API index](https://docs.intents.aurora.dev/llms.txt) and [deposit notification](https://docs.intents.aurora.dev/api-reference/swap-api-reference/submit-a-deposit)
- S8: [1Click signed intent execution](https://docs.near-intents.org/integration/distribution-channels/1click-api/quickstart/signed-intent-execution)
- S9: [NEAR/FAR confidential architecture](https://docs.near-intents.org/integration/market-makers/confidential-intents)
- S10: [Intents account model](https://docs.near-intents.org/integration/verifier-contract/account-abstraction) and [signing formats](https://docs.near-intents.org/integration/verifier-contract/signing-intents)
- W1: [Combined wallet README](../combined-wallet-prototype/README.md) and [bridge contract](../combined-wallet-prototype/specs/NativeWallet.ts).
- W2: [Native wallet engine](../combined-wallet-prototype/android/app/src/main/java/com/walletsigningprototype/WalletEngine.kt), [signer](../combined-wallet-prototype/android/app/src/main/java/com/walletsigningprototype/WalletCoreSigner.kt) and [passkey gate](../combined-wallet-prototype/android/app/src/main/java/com/walletsigningprototype/PasskeyGate.kt).
- W3: [Backup codec](../combined-wallet-prototype/android/app/src/main/java/com/walletsigningprototype/RecoveryBackupCodec.kt) and [encrypted store](../combined-wallet-prototype/android/app/src/main/java/com/walletsigningprototype/EncryptedWalletStore.kt).
- S12: [Aurora generate/submit implementation](https://github.com/aurora-is-near/intents-swap-widget/blob/efce388a8078f912d5f80dff25163d37b2f578c1/packages/intents-swap-widget/src/utils/intents/oneClickIntentApi.ts) and [API host configuration](https://github.com/aurora-is-near/intents-swap-widget/blob/efce388a8078f912d5f80dff25163d37b2f578c1/packages/intents-swap-widget/src/network.ts)
- S13: [Aurora quote-to-signature-to-submit integration](https://github.com/aurora-is-near/intents-swap-widget/blob/efce388a8078f912d5f80dff25163d37b2f578c1/packages/intents-swap-widget/src/hooks/useMakeIntentsTransfer.ts)
- S14: [Published Aurora widget 7.24.0](https://www.npmjs.com/package/@aurora-is-near/intents-swap-widget/v/7.24.0); source and compiled package both contain the two Aurora endpoint calls. Live validation evidence from 22 September 2026 is recorded in the [accompanying verification note](aurora-signed-spending-verification.md).
- S15: [Circle Paymaster overview](https://developers.circle.com/paymaster), [v0.8 EOA/7702 quickstart](https://developers.circle.com/paymaster/pay-gas-fees-usdc) and [chain-specific deployments](https://developers.circle.com/paymaster/addresses-and-events).
- S16: [Arbitrum Sepolia EIP-7702/Circle Paymaster transaction](https://sepolia.arbiscan.io/tx/0x765d8458dfcd3f4e1e7f9b3d3c3893bae7cf5f9b19ad5438a76dc901c67e8b84), executed 25 September 2026. The EOA held 20 test USDC and 0 ETH before execution; one 7702 authorization was included; 0.01 USDC reached the recipient; A1-equivalent retained 0 ETH and paid a net 0.023702 USDC gas charge.
- S17: [Pimlico ERC-20 paymaster](https://docs.pimlico.io/references/paymaster/erc20-paymaster), [Monad token support](https://docs.pimlico.io/guides/how-to/erc20-paymaster/supported-tokens), [v0.8 contract address](https://docs.pimlico.io/references/paymaster/erc20-paymaster/contract-addresses), [public endpoint limits](https://docs.pimlico.io/references/bundler/public-endpoint) and [paymaster architecture](https://docs.pimlico.io/references/paymaster/erc20-paymaster/architecture). Read-only Monad mainnet checks on 25 September 2026 found deployed code at the documented paymaster, USDC and EntryPoint addresses; the no-key public endpoint returned a Monad USDC quote and paymaster stub. An unfunded no-key UserOperation reached simulation and failed on token execution. Pimlico documents the contract as permissioned and its public endpoint as requiring an API key for mainnet paymaster support. The authenticated funded operation now confirms the zero-MON ERC-20 paymaster path; the standalone source wallet's USDC balance fell from 9.807581 to 0.001082 after its 9.804795 USDC transfer.
- S18: [NEAR user authentication guide](https://docs.near-intents.org/integration/distribution-channels/1click-api/authentication), [official versioned nonce builder](https://github.com/defuse-protocol/sdk-monorepo/blob/d287210315f3ff1ae2263df9702ee1d84a2d8385/packages/intents-sdk/src/intents/expirable-nonce.ts) and [ERC-191 signer](https://github.com/defuse-protocol/sdk-monorepo/blob/d287210315f3ff1ae2263df9702ee1d84a2d8385/packages/intents-sdk/src/intents/intent-signer-impl/intent-signer-viem.ts). The successful live authentication and balance read were observed on 25 September 2026.
