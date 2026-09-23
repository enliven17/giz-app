# Frozen frontend parity baseline

Baseline commit: `9c0c15ed16d69f9c2ec57839b9d18222e51d946d`.
Frontend tree: `773f8b428b741604feddf6a558c67d9fa5c55c2c`.
Inspected 2026-09-22. Paths below are relative to `../../frontend/src/`.
This is a source inspection, not browser/device verification. Mobile status is tracked below. Functional regression tests must follow AGENTS.md.

Legend: **working** = local UI handler exists; **simulated** = fixtures/timers;
**inactive** = displayed control without an action. None implies a real service.

## Journeys and observed behavior

| ID  | Journey / actions                                                                         | Source                                                                     | Observed baseline                                                                           | Mobile acceptance / milestone                                                                        |
| --- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| P01 | Welcome -> access; back                                                                   | components/Onboarding.tsx, Auth.tsx, App.tsx                               | Working screen-state navigation                                                             | Complete forward/back journey, M2                                                                    |
| P02 | Create passkey wallet                                                                     | components/Auth.tsx                                                        | Simulated timed access; no native credential                                                | Explicit demo access, protected routes, failure fixture, M2                                          |
| P03 | External wallet selector and dismissal                                                    | components/Auth.tsx                                                        | Lists MetaMask, Rainbow, Ledger, WalletConnect; selecting any calls onDone                  | Mock provider selection and cancel without pretending to connect, M2                                 |
| P04 | Home/Vaults/Exchange/Settings tabs; detail/subpage back; disconnect                       | App.tsx, components/BottomNav.tsx                                          | Working local routing; tabs hidden outside main app                                         | Typed native routes; native back and auth boundary; clear account state on disconnect, M2/M5         |
| P05 | Portfolio value, chart, holdings, vault shortcuts                                         | components/Home.tsx, data.ts                                               | Fixture values/series; vault shortcuts work                                                 | Equivalent information and navigation with mock states, M3                                           |
| P06 | Home notification, activity, see-all-vaults, deposit/withdraw links                       | components/Home.tsx                                                        | Working handlers                                                                            | Reach intended destinations and return, M3/M4                                                        |
| P07 | Vault search and All/Low/Medium/High filters                                              | components/Vaults.tsx                                                      | Working case-insensitive name/ticker/strategy search; no manager search despite placeholder | Preserve filters/no-results; resolve placeholder mismatch before M3 completion                       |
| P08 | Vault detail, allocation, strategy, minimum, price/APY/TVL/lockup, buy/sell               | components/VaultDetail.tsx, data.ts                                        | Fixture metrics; back and buy/sell work                                                     | Correct selected vault and buy/sell direction, M3/M4                                                 |
| P09 | Exchange amount and vault selection, receive estimate, recent list                        | components/Exchange.tsx                                                    | Local floating-point estimate and static recent trades                                      | Decimal-safe mock quote, validation and visible fixture history, M4                                  |
| P10 | Buy/sell review and confirm                                                               | components/SwapSheet.tsx                                                   | Buy USDC -> units, sell units -> USDC; timed simulated result                               | Correct asset units, review, mock result/reject/retry; prevent duplicate submit, M4                  |
| P11 | Deposit/withdraw amount, wallet/network summary, confirm                                  | components/TransferSheet.tsx                                               | Fixture wallet/balance/Monad/fees; simulated queued result                                  | Validation, review and explicit mock pending/result; no real transfer, M4                            |
| P12 | Signature cancellation and feedback; sheet dismissal                                      | components/SignOverlay.tsx, SwapSheet.tsx, TransferSheet.tsx, Exchange.tsx | Timer cancellation sets failed; overlays close/reset later                                  | Explicit rejection/recovery; UI dismissal never represented as canceling a submitted transaction, M4 |
| P13 | Notifications: open row, mark all, back                                                   | components/Notifications.tsx, content.ts                                   | Working local read-state updates; static feed, reset on remount                             | Read/unread and mark-all flows tested; persistence remains a feature decision, M5                    |
| P14 | Settings alerts toggle, secondary navigation and disconnect                               | components/Settings.tsx                                                    | Local toggle; subpage links work; disconnect returns to onboarding                          | Same journeys; preferences adapter, no claim of OS push registration, M5                             |
| P15 | Passkey wallet, signing policy, currency, statements, contact desk, terms, activity pages | components/SubPage.tsx, content.ts                                         | Static content; back works, rows/actions inactive                                           | Show corresponding information, classify every action explicitly, M5                                 |

## Inactive controls and decisions due before feature completion

These remain in scope for explicit resolution. They are not silently deleted or
considered implemented. Product owner decides behavior with the implementing
engineer at the listed milestone. Default until resolved: visibly unavailable with
an explanation, rather than a clickable no-op or invented service response.

| Controls                                                                  | Reference                          | Decision / milestone                                                                                    |
| ------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1D/1W/1M/1Y/All chart periods                                             | Home, VaultDetail                  | Define deterministic per-period fixtures and selection behavior, M3                                     |
| Manager-search wording; advanced-filter button                            | Vaults                             | Align search text/fields; specify filters beyond risk or explicitly defer advanced filters, M3          |
| Share vault                                                               | VaultDetail                        | Define native share payload and valid destination; do not invent public URL, M3                         |
| 25%/50%/75%/Max                                                           | Exchange, SwapSheet, TransferSheet | Define available mock balances, fee reserve and rounding rules, M4                                      |
| Direction arrow and asset-selector buttons                                | Exchange, SwapSheet                | Define allowed pairs/direction and whether selectors are editable; preserve buy/sell semantics, M4      |
| Recent trades see-all                                                     | Exchange                           | Decide link to Activity and data/filter semantics, M4                                                   |
| Copy account address                                                      | Settings                           | Use a complete synthetic address and native clipboard feedback, M5                                      |
| Recovery/backup and signing-policy rows                                   | SubPage/content                    | Mock/unavailable classification until security contract exists, M5/M6                                   |
| Currency selection                                                        | SubPage/content                    | Decide display-only formatting versus fixture FX conversion; settlement unchanged, M5                   |
| Statement frequency/archive/request; support channels/message; legal PDFs | SubPage/content                    | Define mock documents/actions or explicit unavailable states; no invented live links or messages, M5/M6 |

## Data and release boundary

Vaults/holdings/chart series come from `data.ts`; account details, security claims,
limits, statement entries, support promises and notification copy are fixtures in
components and `content.ts`. Do not promote them into backend contracts.

M1–M5 acceptance is labeled demo parity plus meaningful functional tests using
mocked boundaries. Required loading/empty/error states can be supplied by fixtures
even where the web prototype has only a success view. M6 production acceptance
requires authoritative session/wallet/API contracts and confirmed financial state.

## Change control

Compare future frontend changes against the frozen tree before extending parity.
Record changed journey IDs and scope decisions here. Keep durable implementation
rules in AGENTS.md; this baseline can survive removal of the initial work plan.

## M2 mobile status

- P01: implemented welcome -> access and back. The formerly inactive “I have
  access” control opens demo access; no existing credential is claimed.
- P02: simulated passkey access, memory-only demo session, loading/cancel,
  failure/rejection recovery and duplicate-submit protection. No biometrics or keys.
- P03: simulated MetaMask/Rainbow/Ledger/WalletConnect selection in a native modal,
  cancellation and invalidation of late results. No external app opens.
- P04: Home/Vaults/Exchange/Settings shell, protected navigation and disconnect
  implemented. Content and subpages remain with M3–M5; visible placeholders say so.
- P05–P15: product content remains pending except the P14 disconnect action.
- Cold/runtime signed-out protected links are discarded; the access link retains
  welcome as its back destination. No pending protected URL is stored as session data.
- Native gesture delivery, Android hardware back and device rendering still need
  platform QA; rendered functional tests do not establish those results.

## M3 mobile status and defaults

- P05: portfolio total, illustrative daily change, holdings, synthetic chart periods
  and vault shortcuts implemented with typed mobile mock data. USD totals use exact
  integer cents; units/price strings are display data, not execution authority.
- P06: vault discovery and activity navigation implemented. Deposit/withdraw and
  notifications have explicit availability notes for future slices (M4/M5).
- P07: name/ticker/strategy/manager search plus All/Low/Medium/High filtering, empty
  results and clear filters implemented. Search and risk compose; filters survive
  detail/back navigation. Advanced filtering is explicitly unavailable.
- P08: selected-vault price/change/APY/TVL/lockup, allocations, manager, strategy,
  minimum/redemption and fixture fees implemented. Buy/sell await M4.
- P15 activity: September/August fixture history is reachable from Home, including
  empty/error/retry states. Account secondary pages otherwise remain with M5.
- Chart periods use trailing 8/16/32/48/all samples for 1D/1W/1M/1Y/All respectively.
  The graph is explicitly synthetic; those samples are not sourced market candles.
- Default share behavior: native text summary with demo labeling and no URL; errors
  can retry, and dismissal never claims that the summary was delivered.
- Loading, empty, error/retry, stale/offline snapshots and disconnect invalidation
  are implemented. Offline/freshness is adapter metadata, not a new OS integration.
- These choices apply the proposed M3 defaults; no additional advanced-filter
  requirements or public share destination were supplied.
- M3.1 improves hierarchy, contextual filter clearing, optional timestamps and
  grouped responsive metrics. Content Back replaces top navigation bars;
  chart windows, filter state, disclosure and sharing semantics are preserved.
- iPhone 17 Pro / iOS 26.5 standard/enlarged text, header Back, native share-sheet
  opening/dismissal and software keyboard search were inspected. Smaller displays,
  VoiceOver/reduced motion, gestures and Android remain pending; see FOUNDATION.md.

## M3.2 visual parity update

The mobile frontend layouts at repository commit
`42c51e2341e2c5a45def140a5da2a137b147bd10` guide the new surfaces, vault tiles,
portfolio ordering, grouped details/account rows, entry/access cards and bottom capsule.
The prior top-header removal remains in effect. In-app demo disclosures and prefixes
are removed by user decision; internal mocks and share-payload provenance remain.

Search/manager/risk composition, chart periods, refresh/retry, holdings/detail/activity,
access cancellation and disconnect retain their implemented behavior. Profile content
is an isolated presentation fixture without a connected address. New deposit/withdraw,
buy/sell, notification and account-row controls are disabled and explicitly unavailable.
M4/M5 scope is unchanged. No web-only glitch/blur animation or unlicensed font is copied.

## M3.3 frontend reconciliation — 2026-09-23

Compared frontend `42c51e2` to `64d7cf2`. Adopted Gizu logo, welcome headline,
confidential-vault terminology, roomier charts, aligned account rows and the Swap
coming-soon treatment. The existing Exchange route/deep link remains stable.

P01 now has a separate Request access modal with email, investment range, platform
multiselect and optional Other. Submission uses an injected development mock, with
no network, persistence or real waitlist enrollment. Validation, pending, failure/retry,
dismissal, completion and stale-result handling are part of the new functional journey.
P02/P03 retain both passkey and external-wallet access by explicit user decision;
the frontend's passkey-only change is not adopted. No real credentials are created.

M4 buy/sell and transfers remain pending; use the frontend sell tone and explicit
confirmation labels when implementing them. M5 notifications remain pending; prefer
a native screen/sheet over the desktop dropdown. Preserve native navigation, reduced
motion support, readable type and no top navigation bars.

## Product and interaction decisions retained from agent guidance

These feature-specific decisions live here so engineering instructions can remain
focused on reusable approaches. They supplement the journey statuses above.

- Access sessions remain memory-only with `kind: "demo"`. Restart/disconnect clears
  the session; signed-out protected/unknown links are discarded. The UI preview
  remains available under Settings. Keep both passkey and external-wallet entry.
- Keep user-facing copy free of demo/simulated prefixes and repetitive banners.
  Preserve engineering mock provenance and labeled native share summaries; do not
  claim actual biometrics, credential creation, connectivity or settlement.
- Use a session-scoped investment snapshot. Charts are performance indexes using
  fixture windows, not market history or executable quotes. Preserve old snapshots
  with stale/offline feedback after refresh failure; metadata comes from adapters.
- Search combines name, ticker, strategy, manager and risk. Preserve search/filter
  and chart selections across navigation; show Clear only when applicable. Advanced
  filters remain unavailable until specified. Share text without inventing a public
  URL or treating share-sheet dismissal as delivery.
- Hide all top navigator headers. Place accessible screen titles and Back controls
  in content, with safe direct-link fallbacks. Keep bottom tabs on main screens.
- Bottom navigation is a floating capsule over a transparent overlay. Reserve its
  measured height in scroll padding and pass touches through outside the capsule.
  Selection uses a centered measured circle, icon pop, outgoing fade (150 ms) and
  incoming fade (180 ms). Motion follows accepted navigation, retargets on interruption,
  honors reduced motion and does not replay on repeated selection.
- Prioritize balances or vault identity before metadata. Vault tiles show ticker,
  change, chart, name, TVL and APY; use one column for narrow/large-text layouts.
  Keep financial values readable and feature state intact during text-size changes.
- Request access validates email, one investment range and at least one platform
  or Other. The range is not a commitment. Preserve answers on retry, lock controls
  while pending, ignore late results on dismissal and clear answers on reopening.
  Completion is user-dismissed. Its mock creates no real waitlist entry or session.
- Exchange keeps its route/deep link but is presented as Swap coming soon. Trading
  and transfers remain M4; notifications/account actions remain M5. Use a distinct
  sell tone with explicit confirmation labels; do not make sale success look like failure.
- Swap's coming-soon placeholder uses a fixed, non-scrolling viewport centered
  above the measured tab bar. Its heading scales for screen width with explicit
  line height to prevent glyph clipping; other content screens remain scrollable.
- Swap's “coming soon” heading now has a dedicated Lottie glitch: brief cyan/mint
  text offsets and scan accents in a five-second loop. Swap and body copy stay still.
  The effect runs only on the focused tab while the app is active; reduced motion,
  enlarged text and animation failure use native text. The screen remains fixed.
