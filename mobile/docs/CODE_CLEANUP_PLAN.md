# Gizu mobile cleanup and structural improvement

## Scope and current status

Preserve existing Gizu screens, navigation and visual design. Product integration
follows [M6.1](../PLAN.md#m61--real-passkey-and-wallet-behavior-in-the-existing-gizu-app);
this plan improves ownership and maintainability around it. No new wallet tab,
dashboard or parallel product journey.

Completed preparatory change: isolated wallet, signer/transfer diagnostics and UI
playground under `src/development/`; removed the playground from Settings and
product routes. Explicit debug commands preserve access. Shared wallet controllers,
adapters and transfer validation remain reusable outside that directory.

Everything below is planned, not implemented by this separation.

## 1. Make application composition explicit — alongside M6.1a

- Give app composition explicit demo/native service sets and supported capabilities.
  Current providers have mock defaults; real sessions must never accidentally use
  those defaults. Keep backend authentication separate from local wallet access.
- Replace the temporary native-session rendering slot with normal navigation when
  real adapters are wired. Retain standalone debug composition independently.
- Keep session, account/chain data and pending operation lifetimes explicit. Clear
  stale reads and navigation when identities change.
- Exit: normal native access reaches existing MainTabs, no feature reads debug
  code, and functional tests prove native sessions cannot receive fixture finances.

## 2. Consolidate wallet and transaction ownership — alongside M6.1b–d

- Reuse wallet balance/clipboard and transfer reconciliation services in existing
  Home, Account, Transaction and Activity controllers. Avoid copying the harness
  forms into product screens.
- Separate access, balance RPC and formatting responsibilities in
  `src/services/nativeWallet.ts` when integration gives them distinct consumers.
  Keep amount/chain/address rules in domain code, transport in adapters.
- Make the native journal the authoritative local outgoing-operation record.
  Do not maintain a second mock-ledger-shaped version of live transfers.
- Keep one account-scoped owner for balance/history refresh and cancellation.
  Share real behavior, not pass-through hooks or generic signing abstractions.
- Exit: account changes invalidate stale responses, unknown submissions reconcile
  without resubmission, and missing historical fields remain explicitly missing.

## 3. Decompose native orchestration carefully — after M6.1

- Inspect Android `TransferActivity.kt` and iOS `NativeTransfers.swift` for
  separable RPC transport, journal persistence, lifecycle and native review work.
  Extract one responsibility per change with existing behavior preserved.
- Keep intent validation, sender binding, limits, expiry and signing authorization
  in the trusted native/core boundary. Never create a generic JS-callable signer.
- Preserve write-before-broadcast and pending/unknown reconciliation semantics.
  Avoid moving cryptographic material or approval decisions into JavaScript.
- Exit: native/core tests plus builds pass; device acceptance separately verifies
  approval, cancellation, restart recovery and one-unlock batches when resumed.

## 4. Tighten boundaries and documentation

- Keep dependency direction: development → features/services/domain/shared UI;
  product code must not import development modules. Test entry selection, route
  availability and behavior rather than relying on brittle source-text snapshots.
- Replace obsolete controller re-exports with imports from the actual domain owner.
  Remove dead code only after checking callers and retained debug journeys.
- Keep the implementation roadmap in PLAN, setup commands in README, and native
  security contracts/evidence in signer docs. Mark historical evidence and
  incomplete acceptance explicitly instead of maintaining competing checklists.
- Audit production bundle/native debug gates before enabling release builds.
  Runtime hiding alone is not proof of code exclusion or production readiness.

## Delivery and checks

Use small changes in the order above; do not combine native refactoring with new
transaction capabilities or dependency upgrades. Preserve current public/native
contracts until a deliberate migration is covered.

For each stage, run typecheck, lint, formatting and relevant functional/unit tests.
Use full coverage for integration milestones and required CI. Native changes also
need Rust/native tests and platform builds. Report live device checks separately;
mocked tests do not prove biometric or on-chain behavior. Manual acceptance cases
previously skipped remain unverified, not passed.
