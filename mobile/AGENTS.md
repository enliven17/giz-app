# Mobile application guidance

These instructions apply to `mobile/` and its descendants. This file is the
durable source of accepted mobile product and technical decisions.
Follow repository-wide instructions as well. Explicit user instructions take
precedence; this file does not authorize work outside the requested scope.

## Confirmed product and technical decisions

- Build the Nexum mobile application with React Native and NativeWind.
- Use atomic design under `src/components/atoms`, `molecules`, `organisms`, and
  `templates`. Feature screens act as pages; do not add an `atomic-design/` root.
- Use React Navigation directly, with typed route contracts and native stacks.
  Keep navigator configuration in `src/navigation/`; do not introduce Expo Router.
- Use npm and a mobile-local `package-lock.json`; do not add pnpm or require mise.
- Use `just` for workspace shortcuts delegating to app-local npm scripts. Shared
  recipes must support Windows as well as macOS/Linux.
- Preserve the product capabilities and user journeys of `../frontend/`.
- Keep mobile source, configuration, assets, dependencies, and scripts inside
  `mobile/`. Other apps have independent top-level folders.

Accepted technical decisions include Expo development builds,
strict TypeScript, React hooks/Context, feature controllers/view models, native UI
infrastructure, and the quality/build tools listed below. The foundation is scaffolded; inspect package scripts and the verification record
before claiming a tool or native build has been validated.
Exact compatible versions and unresolved product/security integrations remain
implementation decisions. Continue independent work when an integration is blocked.

## Accepted tools and implementation boundaries

- Use Expo with expo-dev-client for iOS/Android development builds and configure
  EAS development, preview and production profiles. Select compatible dependency
  versions and use this application's own identity and release credentials.
- Use strict TypeScript, React hooks for local state, and scoped Context providers.
  Select remote-data caching separately when real fetching requires it.
- Use Reanimated with compatible Worklets, react-native-safe-area-context,
  react-native-screens, lucide-react-native and react-native-svg.
- Use expo-font, expo-asset, expo-splash-screen and expo-status-bar as their
  responsibilities arise. Keep versions compatible with the chosen Expo SDK.
- Use AsyncStorage only behind adapters for non-sensitive preferences. Normalize
  loaded values, define defaults and handle failed writes. Never use it for
  credentials, signing keys, or authoritative balances and transaction outcomes.
- Use ESLint with Expo config, Prettier, EditorConfig and Husky. Document formatting
  values during setup. Keep hooks fast, scoped and non-mutating; full checks belong
  in CI. Do not copy another repository's hardcoded hook paths.
- Use Jest with jest-expo and React Native Testing Library. Enforce full-source
  coverage with thresholds based on Nexum, not copied percentages. Include Expo
  Doctor in the main check command alongside TypeScript, format checks, lint/tests.
- Asset audits are optional later. Attribution/analytics is deferred. Do not add
  Expo Audio, Expo IAP, landscape-only layouts or game-specific navigation behavior.
- npm remains selected and mise is not required. Document compatible Node/npm/just
  versions; selected tools do not authorize installation or release outside the task.

## Foundation baseline

- The initial documented runtime target is Expo SDK 57 with React Native 0.86.3,
  React 19.2.3 and NativeWind 4.2.7/Tailwind 3.4.17. See `docs/FOUNDATION.md`
  for the SDK dependency matrix and unresolved identity/platform decisions.
- Approved development identity: Nexum Dev, `com.example.nexum.dev` on both
  platforms, scheme `nexum-dev`. Production builds remain blocked until release
  identity and integrations are selected.
- Validate this matrix when changing dependencies; published compatibility is not evidence
  of a successful install or native build. Do not bypass conflicting peers.
- Frozen frontend tree: `773f8b428b741604feddf6a558c67d9fa5c55c2c` at commit
  `9c0c15ed16d69f9c2ec57839b9d18222e51d946d`. Use `docs/PARITY.md` for journey
  coverage and explicitly reconcile later frontend changes.
- Initial parity is a labeled demo. Keep real wallet/API execution separate and
  do not infer app identifiers, redistribution rights or financial rules from fixtures.

## Current state and source of truth

- Inspect the current source, package scripts and configuration before making
  changes; do not assume scaffolding or tooling is already present.
- Use the frontend's mobile screens as the main interaction reference and inspect
  desktop screens for additional product information. Do not clone desktop layout.
- Check the current frontend revision before relying on earlier feature inventories.
- The reference uses fixtures, timer-based authentication/signing, and inactive
  controls. Treat it as a prototype, not a backend or wallet contract.
- Maintain a parity record for every visible action: implemented, simulated,
  explicitly unavailable, or awaiting a decision. Do not silently remove features.
- Clearly label demo data and simulated operations. Production must not silently
  use mocks or claim financial success from elapsed time.

## Demo access and navigation

- Demo sessions are memory-only and use an explicit `kind: "demo"` marker.
  Restart/disconnect returns to the signed-out experience. Do not persist access
  or imply that Face ID, credentials, private keys or wallet connections exist.
- Access providers are service boundaries; controllers own pending/error state,
  reject duplicate submissions, and invalidate results after cancel/unmount.
- Register protected routes only during an active demo session. Clear navigation
  history on session changes; discard signed-out protected/unknown links.
- The welcome “I have access” action opens the same demo access screen. It is not
  credential recovery. Tab placeholders must say when functionality is unavailable.
- Keep the UI preview under Settings for inspecting reusable component states.
  Motion must honor the system reduced-motion setting.

## Portfolio and vault display rules

- Keep portfolio, vaults and activity behind typed mock adapters until real service
  contracts exist. Share one session-scoped snapshot; clear it on disconnect.
- Store monetary fixture values as decimal/base-unit strings. Sum portfolio USD
  values in integer cents. Floating-point chart coordinates are presentation only.
- Label chart history as a synthetic performance index; period selection changes
  the fixture window and must not imply historical returns or executable quotes.
- Search name, ticker, strategy and manager together with risk filtering. Keep
  advanced filters visibly unavailable until additional criteria are specified.
- Share only a labeled demo vault summary through the native share dialog. Do not
  invent a public URL or claim message delivery when the dialog closes.
- Keep old snapshots visible but marked stale/offline after refresh failures.
  Service metadata determines freshness; do not infer real connectivity from a mock.
- Preserve explicit unavailable controls for future trading/transfer/notification
  slices instead of silently removing them or reporting a simulated success.

## Atomic design rules

- **Atoms:** native visual/control primitives such as Text, Button, Input, Icon,
  Badge and Spinner. No API, routing, auth, financial rules, or page margins.
- **Molecules:** small reusable control groups such as AmountField, SearchField,
  MetricRow and AddressRow. Only intrinsic control state belongs here.
- **Organisms:** composed sections such as VaultList or TransactionReview. Receive
  typed view models and callbacks; do not implement transport or wallet signing.
- **Templates:** screen structure, slots, safe areas, scrolling and keyboard layout.
  No route-specific data fetching or product decisions.
- **Pages:** feature screens that wire routing, feature hooks, data states and
  actions to templates and UI. Keep route files thin.
- Keep screens thin. Use controller hooks for meaningful orchestration and typed
  view models for complex presentation; avoid pass-through wrappers solely to
  satisfy a pattern. Pure calculations remain independently testable domain code.
- Use `src/application/AppRoot` for startup, navigation and provider composition;
  keep feature behavior in feature controllers rather than one large app controller.
- Keep persistence serialization, normalization and defaults in `src/storage/`.
  Do not treat fire-and-forget local writes as financial confirmation.
- Keep business rules in `src/domain/`, typed integration boundaries in
  `src/services/`, and feature orchestration in `src/features/`.
- Imports flow from routes/screens toward reusable UI and domain/services.
  Atoms never import molecules, organisms, features, or routes. Avoid cycles.
- Keep one-off feature UI colocated. Extract shared UI when reuse or a stable
  primitive justifies it; do not add wrappers or empty folders for taxonomy alone.

## Styling and native behavior

- Use NativeWind classes and shared semantic tokens for ordinary styling. Use
  native style objects where required by dynamic values or a native library;
  avoid duplicating the theme in those objects.
- Match the frontend's dark/green visual identity and information hierarchy.
  Accessibility and native usability take priority over decorative fidelity.
- Use native primitives, safe areas, keyboard-aware forms, accessible labels,
  disabled/loading states, text scaling, and reduced-motion behavior.
- Verify Android back, iOS gestures, modal dismissal, and background/resume.
- Do not import DOM components, browser globals, Framer Motion web components,
  or browser-only WebGL/CSS assumptions from `frontend/`.
- Choose native equivalents for charts, icons and animation when needed. Confirm
  font embedding rights before bundling the frontend's font files.
- Validate each screen on both target platforms; web rendering is not native QA.

## Data and financial behavior

- Use typed service interfaces and separate mock/real adapters. Keep fixtures out
  of production data paths and never invent backend endpoints as agreed contracts.
- Separate transient UI state, session state, and remote state. Do not maintain
  competing copies of balances or operation status in unrelated components.
- Amounts carry asset/network identity and precision. Use decimal strings or
  base-unit integers with explicit rounding for financial calculations; do not
  copy the frontend's floating-point calculations into transaction authority.
- Validate malformed, zero/negative, over-precision and over-balance amounts;
  enforce agreed minimums, limits, fees, quote expiry and lockup rules.
- Keep review, signature, submission, pending, confirmation, rejection, failure,
  and unknown outcomes distinct. Closing the UI does not cancel a submission.
- Prevent duplicate submission. Reconcile uncertain results before retrying;
  use backend-supported idempotency once the mutation contract exists.
- Never report settlement solely because signing succeeded. Read confirmation
  from the agreed authoritative service/chain contract.
- Do not infer chain IDs, custody, recovery, settlement guarantees, or eligibility
  rules from demo labels such as Monad, USDC, Face ID, or instant settlement.

## Session, wallet, and configuration

- Authentication, device biometrics, passkeys, and transaction signing are
  separate capabilities. Keep provider-specific behavior behind adapters.
- Do not store or log signing keys or seed phrases. Store session credentials
  through an appropriate platform secure-storage adapter after auth is designed.
- Never put secrets in bundled/public configuration, fixtures, logs or analytics.
- Validate deep-link and wallet-return inputs; preserve auth boundaries and handle
  rejection, interruption, expiry, and unsupported wallet/network states.
- Clear account-scoped caches and credentials on disconnect according to the
  chosen session model. Do not leave another account's financial data visible.

## Dependencies and implementation workflow

- Use LOR before substantive work with the repository root as workspace; use
  relevant matches only. Reuse already loaded guidance when applicable.
- Use Context7 for current library/API/setup guidance. Record version-sensitive
  choices and verify compatibility before installing native dependencies.
- Prefer stable releases; do not mix NativeWind v4/Tailwind 3 instructions with
  NativeWind v5 instructions. Recheck the supported matrix at bootstrap.
- Use Expo development builds for native integrations and choose
  dependency versions supported by that SDK; Expo Go is not the release test target.
- Keep npm scripts as the command source of truth and add a thin root `justfile`
  during foundation work. This selected workspace helper does not authorize
  migrating other apps or introducing package workspaces.
- Configure an explicit Windows shell supported by the selected `just` version.
  Prefer single npm invocations with `--prefix` over shell-specific command chains.
  Avoid Bash-only syntax and POSIX utilities in shared recipes; use Node scripts
  for complex portable tasks. Document prerequisites and verify on Windows/CI.
- Local iOS builds and simulators require macOS/Xcode even though `just` itself
  supports Windows. Label platform-specific tasks and report untested platforms.
- Implement the assigned work in vertical slices. Report actual completion,
  relevant decisions, verification evidence and remaining blockers.
- Do not claim a proposed library, mock flow, or unrun check is production-ready.

## Functional testing

Use Jest, jest-expo and React Native Testing Library for screen-flow functional
tests. The initial requirement uses mocked services only; native device automation
and live backend/testnet testing are outside this requirement.

### Coverage and test boundaries

- Require functional coverage for every meaningful user flow when introduced or
  changed. Add a regression test for every user-visible bug fix whose behavior
  can be exercised at this layer.
- Render real screens with the navigation and providers needed for the journey.
  Exercise real feature controllers, validation and state transitions.
- Mock external boundaries: API services, wallet/signing providers, persistence
  and unavailable native APIs. Do not mock the feature logic under test.
- Perform user interactions and query accessible roles, labels and visible text.
  Assert visible results, enabled/disabled actions and navigation outcomes.
- Assert service calls when needed to verify request contents or prevent duplicate
  submissions. Avoid assertions about internal hook state or component structure.
- Use deterministic fixtures and reset state between tests. Do not use real
  network calls, arbitrary sleeps or broad snapshots as the primary assertion.
- These tests verify rendered application behavior, not real biometrics, native
  gesture delivery or on-chain execution. Describe their evidence accordingly.

### Required journeys and organization

For each journey, cover the success path and applicable validation, empty, loading,
rejection, failure, cancellation and recovery paths. Do not add meaningless cases
solely to fill a checklist.

- Onboarding, simulated access, protected navigation and disconnect.
- Portfolio navigation, vault search/filtering, vault details and activity.
- Exchange and buy/sell: amount validation, review, signing rejection, retry,
  pending/result states and duplicate-submit prevention.
- Deposit/withdrawal: validation, confirmation, rejection and recovery.
- Notifications, settings and supported secondary-page actions.

Place tests in `mobile/tests/functional/<feature>/*.functional.test.tsx`, with
shared fixtures and render helpers in `mobile/tests/support/` (repository-relative
paths). Group cross-feature journeys by their primary user intent. Keep functional
flows distinct from isolated unit tests and adapter integration tests.

### Commands and enforcement

The scaffolded tooling must continue to:

- Provide `npm run test:functional` for the complete functional suite, supporting
  focused file selection.
- Include the complete suite in `npm run check` and require it to pass in PR CI.
- Run affected tests during development; keep pre-commit checks scoped and fast.
- Make `just mobile-check` delegate to the npm check command.
- Report passed, failed, blocked and not-run checks separately. Do not present
  these commands as available before implementation.

## Screen hierarchy and native usability

- Prioritize the balance or vault identity/price before secondary metadata. Group
  supporting metrics and stack them on narrow displays or enlarged system text.
- Keep the demo/no-real-funds disclosure visible; timestamp details may expand on
  demand. Stale/offline/error information must remain visible without expansion.
- Use primary actions for the main task, secondary actions for alternatives, quiet
  actions for metadata/navigation, and destructive styling for disconnect/removal.
  Disabled actions must look unavailable; future features may use explicit notes.
- Keep discovery search and filters near the top. Show Clear filters only when it
  has an effect, and preserve filters and chart selections across navigation.
- Use the shared header Back action with a sensible direct-link fallback. Avoid a
  duplicate content back action; retain modal cancellation and native gestures.
- Keep chart periods adjacent to the graph and expose numeric start/end summaries
  with an explicit synthetic-data disclosure.
- Preserve feature state when system text size changes. Native text must remeasure
  on inactive screens as well as active screens; verify this on a simulator/device.
- Keep Settings UI preview useful for action, typography, metric, filter, vault,
  loading, empty, stale/offline and error states.
- Record native display size/OS and actual accessibility, keyboard, sharing and
  navigation checks separately from rendered tests. A single iOS pass does not
  establish Android, Windows, VoiceOver or reduced-motion behavior.

## Verification and delivery

- Once scaffolded, define and document package scripts for typecheck, lint,
  focused tests, and platform runs. Before that, do not claim those commands exist.
- Follow the Functional testing policy above for screen-flow coverage, suite
  organization and PR CI enforcement. Keep the device E2E runner choice open
  until separately selected.
- Add selective dependency/ownership checks without brittle source-text assertions.
- CI must enforce full-source coverage thresholds and the main check command;
  report platform build/device evidence separately from JavaScript test results.
- Test financial parsing, rounding, state transitions, retry behavior and adapter
  contracts. Test user-visible interactions rather than implementation details.
- Verify critical flows on iOS and Android, including keyboard, safe areas,
  accessibility, rejection, offline behavior, and background/resume.
- Run checks appropriate to the change. Documentation-only edits need document
  consistency/link checks, not fabricated application test results.
- Apply the same verification reporting categories to all checks.
- Keep accepted product and technical decisions current in this file. Update
  affected guidance whenever an accepted decision changes.
