# Gizu mobile implementation plan

Status: M0 baseline recorded; M1 implementation has not started.
Created: 2026-09-22. M0 recorded: 2026-09-22.
Frozen source: `9c0c15ed16d69f9c2ec57839b9d18222e51d946d`, frontend tree
`773f8b428b741604feddf6a558c67d9fa5c55c2c`.
Durable outputs: [foundation decisions](docs/FOUNDATION.md) and
[action-level parity baseline](docs/PARITY.md). Identity and device/font questions
remain explicitly unresolved where noted; no mobile dependencies are installed.

## 1. Product goal and decision status

Build a cross-platform crypto investment application with the same product
capabilities as the frontend website, adapted to native mobile interaction.

### Confirmed by the user

- React Native is the mobile application foundation.
- NativeWind is the styling foundation.
- Atomic design is the component architecture, using `src/components/atoms`,
  `molecules`, `organisms`, and `templates`; feature screens serve as pages.
- Use React Navigation directly with typed routes and native stack navigation.
- Use npm with a mobile-local `package-lock.json`.
- Introduce `just` for workspace commands, with Windows-compatible recipes.
  Package scripts remain the source of truth for each app.
- Feature parity with the existing frontend is the product target.
- The mobile application lives in `mobile/`, alongside `frontend/`, `backend/`,
  and `landing/`.

### Accepted foundation

The user accepted the recommended adoptions from the Toddy reference inventory.
These are selected technologies and principles, not installed dependencies or
completed implementation. Exact compatible versions remain a foundation task.

| Area             | Selected approach                                                                 | Reason                                                                           |
| ---------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Platforms        | iOS and Android from one codebase                                                 | Interpret cross-platform as native mobile; the existing web app remains separate |
| Language         | Strict TypeScript                                                                 | Typed screen contracts, financial values, and service boundaries                 |
| Runtime          | Expo with development builds                                                      | Native integrations without relying on Expo Go's fixed library set               |
| Styling versions | Stable NativeWind 4 with its supported Tailwind 3 configuration                   | Avoid adopting the NativeWind 5 release candidate by accident                    |
| State            | Local React state for controls; explicit session provider; typed service adapters | Keep UI, session, and remote data responsibilities separate                      |
| Delivery         | Mock-backed feature parity, then real integrations                                | The reference frontend has no real backend or wallet integration                 |

Select and record a compatible Expo/React Native/NativeWind/Reanimated version
matrix during foundation work. Do not install independently chosen latest versions.
Use the chosen Expo SDK's supported native dependency versions. NativeWind's
current stable documentation uses Tailwind 3; its v5 instructions are a separate
release-candidate path. Recheck at implementation time.

Other library selections (remote-data cache, forms, decimal arithmetic, charts,
bottom sheets, wallet SDK, and device E2E runner) remain open.
Jest with jest-expo and React Native Testing Library are selected for automated
unit/component and mocked integration testing.
Choose one solution per responsibility when needed and record the rationale.

### Accepted tools and adoption boundaries

| Area                                    | Accepted selection                                         | Application to Gizu                                                                                      |
| --------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Native runtime                          | Expo development builds and expo-dev-client                | iOS/Android native development; select a compatible stable SDK matrix rather than copying Toddy versions |
| Language                                | Strict TypeScript                                          | Typed domain, component, service and navigation contracts                                                |
| Local state                             | React hooks and Context                                    | Control state and scoped providers initially; remote cache choice remains separate                       |
| Motion                                  | React Native Reanimated and compatible Worklets            | Native motion with reduced-motion support; no game-specific transition policy                            |
| Native layout/navigation infrastructure | react-native-safe-area-context and react-native-screens    | Safe areas and React Navigation native stacks                                                            |
| Icons and vectors                       | lucide-react-native and react-native-svg                   | Shared icon primitives and native SVG rendering                                                          |
| Preferences                             | AsyncStorage behind storage adapters                       | Non-sensitive preferences only; never credentials, signing keys, or authoritative financial state        |
| Startup/assets                          | expo-font, expo-asset, expo-splash-screen, expo-status-bar | Add when their font, asset, launch or system-bar responsibilities are implemented                        |
| Static checks                           | ESLint with Expo configuration; strict TypeScript checks   | Include both in the main check command                                                                   |
| Formatting                              | Prettier and EditorConfig                                  | Select and document formatting values at setup; tooling adoption does not mandate Toddy's exact values   |
| Commit hooks                            | Husky                                                      | Fast, scoped, non-mutating format/lint/focused-test gate; full checks stay in CI                         |
| Automated tests                         | Jest, jest-expo, React Native Testing Library              | Unit, mocked integration and accessible user-interaction tests                                           |
| Coverage                                | Full-source coverage with enforced thresholds              | Establish Gizu's own meaningful baseline; do not copy Toddy's percentages                                |
| Dependency health                       | Expo Doctor                                                | Include in the main check command                                                                        |
| Builds                                  | EAS development, preview and production profiles           | Configure profiles at foundation; builds/submissions require their own task scope and credentials        |
| Tool versions                           | Document and enforce compatible Node/npm/just versions     | Retain npm; no required mise or pnpm migration                                                           |

Optional/deferred/excluded decisions remain explicit:

- **Optional later:** custom asset audit/optimization scripts adapted to Gizu,
  not copied with game-specific budgets or rules.
- **Deferred:** Tenjin or any other attribution/analytics SDK until a concrete
  requirement and data policy exist.
- **Excluded initially:** Expo Audio, Expo IAP, landscape-only framing, game
  navigation resets/disabled gestures, and game-specific purchases or progression.
- **Not selected:** pnpm or mandatory mise. The user's npm choice and existing
  decision to avoid requiring mise remain in effect.
- **Selective adoption:** architecture checks enforce real import/ownership
  boundaries; avoid tests that merely match source text or exact filenames.

## 2. Reference behavior and feature parity

The frontend is a visual and interaction reference, not a production financial
contract. `src/data.ts` contains fixtures and synthetic chart series;
`src/content.ts` contains static account content and notifications. Authentication
and transaction success are driven by timers. Several visible buttons have no
handler. Mobile must not interpret those timers or labels as working integrations.

Paths in this table are relative to `../frontend/`.

| Area                   | Reference                                            | Mobile parity target                                                                                           | Current limitation / follow-up                                                                                     |
| ---------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Entry and access       | `src/components/Onboarding.tsx`, `Auth.tsx`          | Welcome, passkey-only path, cancel/back, access to app                                                         | Simulated authentication; real session, recovery, and wallet providers unselected                                  |
| App navigation         | `src/App.tsx`, `src/components/BottomNav.tsx`        | Home, Vaults, Exchange, Settings tabs; detail and secondary screens; native back behavior                      | Web currently uses component state rather than native routes                                                       |
| Portfolio              | `src/components/Home.tsx`                            | Portfolio value, performance chart, holdings, vault shortcuts, activity, notifications, deposit/withdraw entry | Values are fixtures; period controls are currently presentation only                                               |
| Vault discovery        | `src/components/Vaults.tsx`, `VaultCard.tsx`         | Search, risk filters, cards, no-results state, detail navigation                                               | Search currently matches name/ticker/strategy despite manager-search placeholder; advanced-filter icon is inactive |
| Vault detail           | `src/components/VaultDetail.tsx`                     | Price/performance, APY, TVL, lockup, allocation, strategy, minimum, buy/sell entry                             | Chart periods and share action are inactive; metrics are fixtures                                                  |
| Exchange               | `src/components/Exchange.tsx`                        | Amount input, vault selection, pay/receive preview, fee/rate summary, recent activity, confirmation flow       | Floating-point estimate and timed success; percentage, direction, and see-all controls need specified behavior     |
| Buy and sell           | `src/components/SwapSheet.tsx`                       | Native sheet/modal, correct asset units, review, signing/result states, cancellation                           | No quote, balance enforcement, real signature, or execution                                                        |
| Deposit and withdrawal | `src/components/TransferSheet.tsx`                   | Amount, wallet/network summary, review, queued/pending/result states                                           | Monad, USDC, fees, and settlement text are display fixtures, not agreed integration contracts                      |
| Signing feedback       | `src/components/SignOverlay.tsx`                     | Shared pending, rejected, failed, and success feedback                                                         | Timer-driven demo; signature success is not settlement                                                             |
| Notifications          | `src/components/Notifications.tsx`, `src/content.ts` | Feed, categories, mark-read/mark-all, unread presentation, empty/error/loading states                          | Static feed with working local read-state updates; OS push delivery is separate                                    |
| Settings               | `src/components/Settings.tsx`                        | Account summary, address, security/preferences/support navigation, alerts, disconnect                          | Alerts toggle is local state; clipboard and persistence need implementation                                        |
| Secondary pages        | `src/components/SubPage.tsx`, `src/content.ts`       | Passkey wallet, transaction signing, currency, statements, contact desk, terms/disclosures, activity           | Most rows/actions are static; documents, recovery, support, and policy changes need contracts                      |

Parity means preserving these user journeys and information, not copying inert
buttons or incorrect calculations. During each feature milestone, list every
visible action as implemented, simulated, explicitly unavailable, or awaiting a
product decision. Do not silently omit actions. Mock/service status remains explicit
in engineering documentation and test fixtures. M3.2 removes demo disclosures from
the app interface; it does not implement real integrations. Release completion requires real behavior
for each supported action or an explicitly agreed scope change.

### Visual and native experience

- Retain the frontend's dark surfaces, green accent, typography hierarchy,
  rounded cards, charts, and investment information hierarchy.
- Start token extraction from `../frontend/tailwind.config.ts` and
  `../frontend/src/index.css`: ink `#050706`, soft ink `#0b100d`, accent `#31c47e`.
- Adapt spacing, scrolling, safe areas, keyboard avoidance, sheets, and navigation
  to iOS and Android. Do not copy browser fixed positioning or viewport units.
- Verify font embedding rights and native font loading before copying font assets;
  use a documented fallback until resolved.
- Replace web-only Framer Motion, DOM/SVG, CSS blur, and WebGL effects with native
  implementations or simpler approved equivalents. Decorative effects are lower
  priority than readable data, accessible controls, and smooth scrolling.
- Support screen readers, text scaling, reduced motion, platform-appropriate touch
  targets, and statuses distinguishable without color alone.

## 3. Selected code structure and atomic boundaries

This is a target structure, not a request to create empty folders immediately.
Create folders as their first implementation is added. React Navigation is selected;
use explicit navigator modules rather than Expo Router file-based routes.

```text
mobile/
  AGENTS.md
  PLAN.md
  App.tsx                      # Thin entry point
  src/
    application/               # AppRoot and provider/startup composition
    navigation/                # Typed route params, auth stack, tabs, detail/modals
    components/
      atoms/                   # Text, Button, Input, Icon, Badge, Spinner
      molecules/               # AmountField, SearchField, MetricRow, AddressRow
      organisms/               # PortfolioSummary, VaultList, TransactionReview
      templates/               # Screen, DetailScreen, FormScreen layouts
    features/
      auth/                    # screens/, controller hooks, viewModels as needed
      portfolio/
      vaults/
      trading/
      transfers/
      notifications/
      settings/
      activity/
    domain/                    # Pure models, amount rules, operation states
    services/                  # Typed interfaces and mock/remote adapters
    storage/                   # Serialization, normalization and persistence adapters
    providers/                 # Session and application-level wiring
    theme/                     # Shared semantic tokens and variants
    config/                    # Validated public runtime configuration
    fixtures/                  # Deterministic demo data, clearly isolated
    utils/                     # Only genuinely shared utilities
  assets/                      # Approved fonts and static images
  tests/                       # Cross-feature and device test support
  package.json
  package-lock.json
```

| Layer                          | Owns                                                                   | Must not own                                                         |
| ------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Atoms                          | Basic visual/control behavior and accessible defaults                  | API calls, navigation, session checks, financial rules, page spacing |
| Molecules                      | A small reusable control composed of atoms; intrinsic input state      | Feature workflows or remote-data ownership                           |
| Organisms                      | Larger sections composed of UI pieces and passed view models/callbacks | Wallet signing implementations, API clients, settlement decisions    |
| Templates                      | Screen structure, safe areas, slots, scrolling and keyboard layout     | Fetching, auth policy, route-specific content                        |
| Feature screens (atomic pages) | Bind routes, feature hooks, data states, templates and actions         | Duplicated UI primitives or inline transport/signing code            |
| Domain/services                | Pure rules, typed data boundaries, integration adapters                | Rendering and route navigation                                       |

Navigators register thin feature screens. Controller hooks coordinate meaningful
screen behavior; typed view models expose presentation-ready data and callbacks.
Use these patterns for complexity that warrants them, not mandatory pass-through
hooks or wrapper files on every screen. Keep pure calculations in domain modules.
`src/application/AppRoot` composes startup, navigation and providers; individual
features retain their own orchestration rather than accumulating in one controller.
Persisted preferences pass through `src/storage/` for serialization, normalization
and defaults. Handle write failures; do not copy fire-and-forget persistence into
financial operations. Financial state is reconciled with authoritative services.
UI layers depend on lower-level UI and shared types, never on route modules.
Keep one-off feature UI beside its feature, classified by responsibility; promote
it to shared components when reuse is demonstrated. Avoid wrapper chains made
only to satisfy the taxonomy. Dependency cycles are not allowed.

Do not import browser components directly from `frontend/`. Initially keep the
mobile package independent. Extract shared platform-neutral contracts or tokens
only when both apps need them and the repository change is in scope.

### Workspace command contract

`just` supports Windows, macOS, and Linux. Adopt it as a thin root-level command
runner, while npm scripts remain independently runnable inside each app. No pnpm
or mise dependency is introduced by this decision.

- Add the root `justfile` during M1 when the mobile scripts exist. The planned
  `mobile-dev`, `mobile-check`, `mobile-android`, and `mobile-ios` recipes delegate
  to app-local npm scripts; these commands do not exist yet.
- Use explicit Windows shell configuration supported by the selected `just`
  version. Prefer a single npm invocation per recipe, such as
  `npm --prefix mobile run check`, over shell-specific command chains.
- Avoid Bash-only syntax, POSIX-only utilities, and inline environment assignment
  in shared recipes. Put complex portable tasks in Node scripts when necessary.
- Document the required Node, npm, and just versions plus Windows shell setup.
  Test on actual Windows or Windows CI; a macOS dry run is not Windows evidence.
- Windows supports the command runner, but that does not make every native task
  cross-platform: local iOS builds/simulators require macOS and Xcode. Mark that
  recipe accordingly; document Android SDK/JDK requirements separately.

## 4. Data, wallet, and transaction boundaries

- Define interfaces for session/access, wallet capabilities, portfolio, vaults,
  quotes/orders, transfers, activity, notifications, and preferences. Implement
  deterministic mock adapters first; do not invent backend endpoints.
- Keep mock selection explicit in application wiring. Production configuration
  must not silently fall back to mock credentials, balances, or success states.
- Keep remote state out of UI atoms. Add a remote-data cache when real fetching
  begins; invalidate/refetch relevant portfolio and activity after confirmed
  operations rather than manufacturing settlement locally.
- Model amounts with asset identity, network, and precision. Use decimal strings
  or base-unit integers with explicit rounding; never JS floating-point values
  as the authority for orders, balances, or fees.
- Validate empty/malformed amounts, multiple decimal separators, zero/negative
  values, precision, balance, minimum, lockup, and applicable limits. Distinguish
  currency display precision from settlement precision.
- Proposed operation flow: editing -> reviewing -> awaiting signature -> submitted
  -> pending -> confirmed. Include rejected, failed, expired-quote, and unknown
  outcomes. Reconcile an unknown submission before retrying; prevent duplicate
  taps and require backend-supported idempotency for real mutations.
- Review must show source/destination assets, network, recipient when relevant,
  amount, fees, and quote expiry. Signing, broadcasting, and settlement are
  different events. A submitted operation cannot be canceled by closing a sheet.
- Session authentication, device biometrics, passkeys, and transaction signing
  are separate capabilities. Do not copy the frontend's secure-enclave claims
  without verifying the chosen provider's actual key and recovery model.
- Keep signing keys/seed phrases out of application storage and logs. Use an
  appropriate platform secure-storage adapter for session credentials once the
  authentication design is settled. Public app configuration contains no secrets.
- Wallet SDK, account/custody model, supported chains/assets, recovery, backend
  contracts, and settlement authority must be settled before real-money flows.

## 5. Implementation milestones

M0–M4 implementation progress is recorded below; outstanding native acceptance remains explicit. Complete a vertical slice on both platforms before
expanding it; do not equate a bundler start with a verified native application.

### M0 — Confirm foundation and freeze parity baseline

- [x] Refresh the source inventory and freeze the frontend revision/tree in `docs/PARITY.md`.
- [x] Record platform/runtime scope, the documented SDK dependency matrix and OS
      floors in `docs/FOUNDATION.md`; record identity/font/device decisions as
      unresolved or provisional rather than inventing user approval.
- [x] Separate demo parity from real-service scope and inventory inactive actions
      with an owner and resolution milestone before their screens are completed.

Exit evidence: foundation and parity records are present. Published compatibility
is documented, not install/build-tested. Production identifiers and device/font
responses remain unresolved; dependent configuration must wait. M1 must resolve
remaining tool versions, install checks and native build verification.

### M1 — Native foundation

- [x] Scaffold the mobile-local TypeScript package without changing other apps.
- [x] Configure NativeWind, aliases, theme tokens, assets, navigation, safe areas,
      keyboard handling, and error boundaries.
- [x] Add documented npm install/run/typecheck/lint/test scripts and lockfile.
- [ ] Introduce a root `justfile` wrapping app-local npm scripts; validate recipes
      on Windows and macOS/Linux and document platform-specific prerequisites.
- [ ] Set up Expo development builds on iOS and Android, plus EAS development,
      preview and production profiles (configuration, not store submission).
- [x] Configure ESLint/Expo, Prettier, EditorConfig, Husky, Jest/jest-expo and
      React Native Testing Library; document each command and its scope.
- [x] Add `check` to run TypeScript, formatting checks, lint, Expo Doctor and tests;
      add CI coverage with Gizu-specific thresholds and native build validation.
- [x] Record Node/npm/just versions and verify native dependency compatibility.

Exit: a styled screen and navigation run on both iOS and Android; typecheck and
lint pass. Record device/simulator versions and any unavailable verification.

Implementation is scaffolded. Native run validation and Windows CI execution remain
open; see `docs/FOUNDATION.md` for passed, blocked and not-run evidence.

### M2 — Design system and access slice

- [x] Implement the minimum atoms, molecules, and screen templates used by entry
      and main tabs, with accessible loading/disabled/error variants.
- [x] Wire Reanimated/Worklets, Safe Area Context, Screens, Lucide and SVG into
      the design system; add the selected Expo startup/asset utilities as needed.
- [x] Build onboarding, simulated access, session state, disconnect, and tab shell
      with React hooks/Context, thin screens, controller hooks and view models.
- [ ] Ensure unauthenticated deep links cannot expose protected screens and that
      Android back, iOS gestures, and modal dismissal behave consistently.

Exit: onboarding -> demo access -> tabs -> disconnect works on both platforms;
reusable UI has a small preview surface. M3.2 supersedes the original visible-demo-label requirement.

M2 implementation covers the complete demo journey and UI preview. Protected
links and cancellation are covered by functional tests. The final navigation/device
checkbox remains open until hardware back, native gestures and modal dismissal are
verified on devices/simulators; M1's pending platform checks remain unchanged.

### M3 — Portfolio and vaults

- [x] Implement portfolio, holdings, charts, vault discovery/search/risk filtering,
      vault detail, and activity using typed mock adapters.
- [x] Implement empty, loading, error/retry, and stale/offline presentations.
- [x] Resolve chart period, manager-search, advanced-filter, and share behavior
      against the parity inventory instead of reproducing silent no-ops.

Exit: users can browse from portfolio to a filtered vault and back, understand
metrics and holdings, and navigate activity; screens survive small displays and
large text settings without hiding essential content.

M3 implementation and rendered functional coverage are complete. M3.1 below records
subsequent iOS verification; small-display and remaining native checks are still
open. Earlier platform checkboxes remain unchanged. Chart/search/share choices use
the documented M3 defaults.

### M3.1 — Usability and native validation

- [x] Prioritize portfolio balance and vault identity/price; group secondary metrics.
- [x] Keep demo disclosure visible; make timestamp details optional and refresh quiet.
- [x] Move search and risk filters earlier, make clearing contextual, use singular
      result copy and subdued notes for unavailable features.
- [x] Distinguish primary, secondary, quiet, destructive and unavailable actions.
- [x] Keep chart periods adjacent to the chart with synthetic disclosure and start/end values.
- [x] Use a shared header Back action with direct-link fallback; remove redundant
      content back actions and preserve discovery state.
- [x] Expand Settings UI preview with metrics, actions, filters, vault and feedback states.
- [x] Fix text remeasurement after system font-size changes without resetting feature state.
- [x] Validate iPhone 17 Pro / iOS 26.5 normal and enlarged text, header back,
      native share-sheet opening/dismissal, software keyboard input and Search dismissal.
- [ ] Validate a smaller native display, VoiceOver and reduced motion, native swipe
      back/modal dismissal and drag-to-dismiss keyboard.
- [ ] Complete Android device and Windows checks; do not infer these from Jest/export.

Implementation is complete. Native validation is partial: Computer control returned
intermittent `noWindowsAvailable` errors during coordinate gestures. The iOS text-size
setting was restored after inspection. See docs/FOUNDATION.md for the validation record.

### M3.2 — Frontend design parity

Status: implementation complete; native validation remains partial. See
`docs/FOUNDATION.md` for passed and outstanding checks.
Reference: frontend at repository commit `42c51e2341e2c5a45def140a5da2a137b147bd10`.
Use the frontend mobile layouts as the primary reference. The committed delta since
M0 is mainly Gizu naming and logo removal; existing visual gaps are included here.
This phase supersedes M3.1's visible demo disclosures and retains the subsequent
headerless-navigation decision.

#### Accepted decisions

- Remove in-app demo disclosures: banners, no-real-funds notices, demo/simulated
  prefixes in titles, actions and metrics, and repetitive synthetic-data notices.
  Use clean product-facing copy. Keep mock adapters, fixture isolation and accurate
  engineering records. Do not replace removed notices with unsupported claims of
  real biometrics, created wallets, live market history or completed settlement.
  Keep necessary loading, error, stale/offline and unavailable-feature feedback.
- Keep trading/transfers in M4 and notifications/account functionality in M5.
  Unimplemented actions remain visibly unavailable, including newly styled controls.
- Build reusable surfaces, badges, icon buttons, vault tiles and grouped rows within
  the existing atomic structure. Screens and controllers retain feature ownership.
- Verify font redistribution rights before embedding the frontend Helvetica files.
  If rights cannot be established, use system typography and record the visual gap.
- Adapt decorative effects for native performance and reduced motion. Keep balances
  and essential labels stable; no glitch effects on financial information.
- Keep all top navigator bars hidden. Retain bottom tabs, content Back/Cancel actions,
  protected routes, direct-entry fallbacks and state preservation.

#### Implementation sequence

1. Shared visual foundations and copy
   - [x] Add layered dark surfaces, subtle borders, rounded corners, spacing,
         typography roles and positive/negative badges using shared tokens.
   - [x] Remove demo disclosures throughout visible screens and actions; update
         accessible names and affected functional assertions consistently.
   - [ ] Resolve Helvetica embedding rights; retain readable contrast, touch targets
         and scalable text rather than copying tiny/low-contrast web labels.
2. Floating bottom tabs
   - [x] Replace the full-width strip with a rounded capsule and green selected-icon
         background. Preserve accessible names, selected state and tab behavior.
   - [x] Float the capsule over a transparent overlay and reserve its measured
         height in scroll-content bottom padding so the last controls can scroll
         clear of it. iOS transparency was visually verified; native bottom-scroll
         and Android verification remain open.
3. Vault cards and discovery
   - [x] Add ticker badge, change badge, sparkline, vault name, TVL and APY to one
         pressable tile. Use two columns when readable; one column for narrow
         displays or large text. Do not force square cards that clip content.
   - [x] Match search and risk-chip styling while retaining manager search,
         contextual clearing, result counts, empty/error/retry and filter state.
4. Portfolio
   - [x] Add member/greeting composition, prominent balance with subdued cents,
         change badge and compact action row using clearly isolated fixture data.
   - [x] Place private vaults before holdings; render holdings in grouped rows.
         Preserve working holding navigation and accessible full monetary values.
5. Vault details
   - [x] Add ticker/manager identity, price/change pairing, compact responsive metrics,
         allocation bar with textual values and grouped terms rows.
   - [x] Style Back and Share as content icon buttons; keep share retry behavior.
         Buy/sell now use the M4 mock service. Retain functional chart periods and
         numeric summaries without implying live market data.
6. Welcome and access
   - [x] Remove remaining logo marks; use the split-color headline and paired access
         cards, stacking as needed. Preserve cancellation, rejection and retry.
   - [x] Add a restrained native decorative background with a static reduced-motion
         fallback. Avoid web-only effects and unsupported credential claims.
7. Account presentation
   - [x] Use Account heading, fixture profile card, grouped settings rows and
         destructive disconnect styling. Retain Settings UI preview access.
   - [x] Keep unimplemented rows explicitly unavailable; add their behavior in M5.
8. Guidance and validation
   - [x] Reconcile permanent guidance, README and parity records with accepted copy,
         headerless layout and design decisions; retain accurate mock/test status.
   - [x] Expand UI preview for the new shared primitives and their feedback states.
   - [x] Run functional coverage for navigation, filters, chart periods, access,
         disconnect and recovery; run full check and Android-preset functional tests.
   - [ ] Compare frontend/mobile screenshots at matched sizes; inspect a small
         display, enlarged text, keyboard, bottom-tab overlap, screen-reader labels,
         reduced motion, back gestures and modal dismissal on native platforms.

Font decision: no redistribution licence was found in the repository. System
typography is used; custom embedding remains blocked on rights evidence. Static
SVG artwork provides the restrained background without motion/GPU dependencies.

Exit: existing mobile journeys visually follow the frontend, with no top navigation
bars or in-app demo disclosures, no loss of working behavior, and no hidden content
at supported text sizes. Report passed, failed, blocked and not-run validation
separately. This phase does not certify real wallet/backend execution or complete
M4/M5. Font rights are a dependency only for custom-font embedding.

### M4 — Trading and transfers

- [x] Implement vault-detail buy/sell, Home deposit/withdraw, amount validation,
      review and shared operation feedback through mock service interfaces. Keep the
      Exchange route presented as the animated Swap coming-soon screen.
- [x] Resolve percentage/Max, asset direction, balance/minimum/lockup rules, and
      pending-operation dismissal behavior explicitly in `docs/TRADING.md`.
- [x] Add deterministic rejection, failure, quote expiry, delayed confirmation,
      unknown submission, and duplicate-submit scenarios.
- [ ] Complete native iOS/Android acceptance for every success/rejection flow,
      keyboard, large text, hardware Back and gesture dismissal. Automated rendered
      tests and JS exports do not certify these native behaviors.

Implementation is available through mock services. Exit remains native acceptance
on both platforms: malformed amounts cannot advance and no UI timer is treated
as evidence of a real transaction. Real signing, networks and settlement remain M6.

### M5 — Account, notifications, and secondary pages

- [x] Implement notifications, account details, clipboard, preferences, disconnect,
      passkey/signing information, currency, statements, support, and disclosures.
- [x] Persist non-sensitive preferences through an AsyncStorage adapter; specify
      defaults, normalization, write-error handling and account-scoped logout cleanup.
- [x] Classify backup/recovery, document downloads, support actions, and push
      permissions/delivery as mock, implemented integration, or unavailable.

Implemented outcomes and boundaries are recorded in `docs/ACCOUNT.md`: native
clipboard, account-scoped persistent preferences, session inbox and explicit
unavailable states for unconnected integrations. Automated acceptance covers these
outcomes; native verification limits are recorded in `docs/FOUNDATION.md`.

Exit: every parity row and visible action has an explicit tested outcome. Do not
claim that a local alerts toggle registers a device for push notifications.

Next requested step: real passkey registration/authentication, followed by the
remaining M6 integrations after their provider and backend contracts are selected.

### M6 — Real integrations

The first integration is now Mera-based native passkey wallets (user decision,
2026-09-23). See [Mera passkey integration plan](docs/MERA_PASSKEY_PLAN.md) for
the researched feasibility, proposed phases, device gate and unresolved choices.
Wallet creation, backend authentication and live investment execution are separate
deliveries; selecting Mera does not complete any of them.

Depends on backend contracts, wallet/security architecture, supported networks,
and product decisions listed below. UI milestones can proceed before these exist.

- [ ] Add validated API adapters and session lifecycle handling.
- [ ] Integrate the chosen wallet/passkey provider and verified callback/deep-link
      flow, including rejection, app backgrounding, return, and recovery behavior.
- [ ] Connect quotes, orders, transfers, receipts, reconciliation, balances,
      activity, notifications and supported account operations.
- [ ] Exercise contract tests and end-to-end testnet scenarios on physical devices.

Exit: real integration evidence replaces simulation for each supported feature;
pending operations reconcile after app restart and retries do not double-submit.

### M7 — Release readiness

- [ ] Finish the parity checklist and document agreed deviations.
- [ ] Verify accessibility, native lifecycle, offline recovery, startup/scroll
      performance, deep links, permissions, and production configuration.
- [ ] Test signed release builds on iOS and Android physical devices.
- [ ] Finalize product copy, distribution metadata, support/privacy documents,
      crash reporting with redaction, and the release/rollback process.

Exit: no simulated financial behavior in a production build, critical journeys
pass on both platforms, and remaining limitations are explicitly accepted.
Store submission and deployment are separate tasks, not part of this planning work.

## 6. Verification strategy

Initial functional coverage follows `AGENTS.md`: every meaningful screen flow,
mocked services only, `tests/functional/<feature>/*.functional.test.tsx`, full suite
in `npm run check` and PR CI. Native automation/live-service suites below apply
only to later integration/release work and are not initial functional requirements.

Use Jest with jest-expo and React Native Testing Library. Organize unit, mocked
integration, UI and shared-support suites distinctly. Rendered UI tests are not
native device E2E. Query by accessible role/label and visible text; broad snapshots
and implementation-state assertions are not substitutes for behavior checks.
Include unimported production source in coverage and establish Gizu-specific
thresholds once representative behavior exists. Add selective architecture checks
for dependency direction and domain/UI separation, not brittle source-string tests.
The main npm `check` command includes TypeScript, format checking, lint, Expo Doctor
and tests. `test:coverage` runs in CI with thresholds; keep pre-commit checks scoped
and fast. Neither command exists until M1 implementation.

- Unit tests: money parsing/rounding, quote expiry, filters, and operation state
  transitions including retry and duplicate-submit handling.
- Component tests: amount forms, accessible controls, disabled actions, pending
  states, and recovery/error messaging. Avoid snapshots as the only evidence.
- Contract tests: mock/real adapter shapes, session expiry, API error mapping,
  idempotency and reconciliation once backend contracts exist.
- Device E2E: access -> portfolio -> vault -> buy/sell; deposit/withdraw;
  rejected signing; settings/disconnect; wallet callback; background/resume.
- Visual/device checks: iOS and Android, small and large phones, safe areas,
  keyboard, large text, reduced motion, screen readers, and slow/offline network.
- CI: mobile-scoped typecheck/lint/tests and native build validation at appropriate
  milestones. Report passed, failed, blocked, and not-run checks separately.

## 7. Open product decisions and dependencies

| Decision                                                              | Needed by                     | Current position                                                                      |
| --------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------- |
| Minimum OS versions and tablet support                                | M0/M1                         | SDK 57 floors: iOS 16.4+, Android API 24+; portrait/tablet defaults awaiting response |
| Wallet provider, custody/account model, passkey recovery              | M6                            | Unselected; frontend copy is not a security specification                             |
| Network, chain IDs, assets, contract addresses and decimals           | M4 contracts / M6 integration | Monad and USDC appear in demo copy only                                               |
| Pricing, fees, minimums, limits, redemption/lockup and finality rules | M4/M6                         | Require authoritative product/backend contracts                                       |
| Backend ownership, auth/API schemas, pagination and errors            | M6                            | `backend/` is currently a placeholder                                                 |
| Eligibility/onboarding requirements before real investment            | Before real-service release   | Not implemented in the reference; product must define applicable requirements         |
| Statements, support, document destinations, real push delivery        | M5/M6                         | Static frontend references; service behavior unselected                               |
| Currency conversion and supported languages                           | M5                            | English/USD reference; currency rows are not an FX implementation                     |
| Distribution identifiers, signing accounts, release ownership         | M1/M7                         | Product owner response requested; explicit unresolved record in foundation document   |

Do not invent answers to these from fixture values. Record decisions here with
date, status, rationale, and affected milestones, then mirror durable rules in
`AGENTS.md`. A pending integration decision should not block independent mock UI work.

## 8. Decision log

| Date       | Status            | Decision                                                                                                                                                                           | Basis                                                           |
| ---------- | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 2026-09-22 | Confirmed         | React Native + NativeWind + atomic design; frontend feature parity; mobile-local app                                                                                               | User request                                                    |
| 2026-09-22 | Confirmed         | React Navigation directly; npm; `components/` with atomic subfolders; cross-platform `just` workspace commands                                                                     | User selections after Toddy reference inspection                |
| 2026-09-22 | Confirmed         | iOS/Android baseline, strict TypeScript, Expo development builds, React hooks/Context                                                                                              | User accepted recommended adoptions                             |
| 2026-09-22 | Confirmed         | Stable NativeWind 4/Tailwind 3 foundation; exact compatible versions selected at bootstrap                                                                                         | Accepted foundation; revalidate versions                        |
| 2026-09-22 | Confirmed         | Mock parity milestones followed by real integrations                                                                                                                               | Accepted plan; current frontend is simulated                    |
| 2026-09-22 | Confirmed         | Feature ownership, thin screens/controllers, typed view models, application composition, storage adapters, tokens, accessibility, behavior tests and selective architecture checks | User accepted recommended principles                            |
| 2026-09-22 | Confirmed         | Reanimated/Worklets, Safe Area Context/Screens, Lucide/SVG, AsyncStorage for preferences and Expo startup/asset utilities as needed                                                | User accepted runtime recommendations                           |
| 2026-09-22 | Confirmed         | ESLint/Expo, Prettier, EditorConfig, Husky, Jest/jest-expo, React Native Testing Library, coverage thresholds, Expo Doctor and EAS profiles                                        | User accepted quality/build recommendations                     |
| 2026-09-22 | Deferred/excluded | Custom asset audits optional; attribution deferred; Audio/IAP and game-specific behavior excluded initially; no required mise/pnpm                                                 | Preserve original recommendation limits and explicit selections |

## 9. Technical references

Checked through Context7 and official documentation on 2026-09-22. Revalidate
version-sensitive installation details before scaffolding.

- [NativeWind installation and stable/RC distinction](https://www.nativewind.dev/docs/getting-started/installation)
- [just settings and Windows shell support](https://just.systems/man/en/settings.html)
- [React Navigation native stack](https://reactnavigation.org/docs/native-stack-navigator/)
- [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)
- Repository product references: `../frontend/src/App.tsx`,
  `../frontend/src/components/`, `../frontend/src/data.ts`,
  `../frontend/src/content.ts`, `../frontend/tailwind.config.ts`.

## Headerless navigation update

- [x] Hide every top navigator bar while retaining bottom tabs.
- [x] Move Back actions into scrolling content with direct-entry fallbacks; retain
      wallet cancellation, protected routes and native navigation configuration.
- [x] Apply safe-area and keyboard spacing in the shared screen template.
- [x] Keep one content title per screen and update permanent guidance.

This supersedes M3.1's shared header Back design. Existing native QA gaps remain
open; headerless verification is recorded in docs/FOUNDATION.md.

## Frontend reconciliation follow-up (M3.3)

- [x] Adopt Gizu logo, “DeFi in Stealth Mode”, confidential-vault wording,
      Swap coming-soon presentation, chart spacing and account row alignment.
- [x] Use passkey-only access; supersedes the earlier decision to retain external wallets (2026-09-23).
- [x] Add a guest request-access modal backed by an isolated development mock,
      including validation, loading, retry, duplicate prevention and dismissal.
- [x] During M4, use a dedicated sell tone and explicit Confirm buy / Confirm sell.
- [x] During M5, add native notification read/unread and mark-all behavior.
- [ ] Replace the request-access mock with an agreed real submission service before production.
