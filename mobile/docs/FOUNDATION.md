# Mobile foundation

## M5 verification — 2026-09-23

- Added SDK-bundled AsyncStorage 2.2.0 and Expo Clipboard ~57.0.2 using Expo's
  installer; the npm lockfile records the resolved dependency graph.
- Full `npm run check` passed: TypeScript, formatting, lint, Expo Doctor (21/21),
  and 113 tests in 13 suites. Coverage: statements 93.29%, branches 86.60%,
  functions 91.57%, lines 94.99%; all configured thresholds passed.
- All 14 account/notification functional flows also passed with the Android Jest
  preset. The Android run caught missing explicit switch accessibility semantics;
  role and checked/disabled state are now provided and the regression flow passes.
- iOS/Android JavaScript exports passed. The iOS development-client native build
  succeeded and installed on iPhone 17 Pro / iOS 26.5. Xcode reported one Expo
  development-launcher script dependency-analysis warning, with zero build errors.
- Native inspection confirmed Account rendering, successful clipboard feedback,
  notification expansion and unread count updating from 2 to 1 (including Home
  after Back), and statement frequency/disabled request presentation. No real
  credential, transfer, push permission or message submission was exercised.
- The old tunnel URL failed during launch. The new localhost launch also failed
  because Metro listened on IPv6 while its URL used IPv4. Starting Metro with
  `--lan --port 8082` and selecting that server in the development launcher restored
  the app; no application-code workaround was needed.
- Not run: Android native build/device acceptance for this change, physical-device
  clipboard/persistence, native preference changes/restart/logout, enlarged-text
  and screen-reader walkthroughs, hardware Back/gesture acceptance. Rendered tests
  cover persistence/restart-equivalent remount/cleanup and failures through mocked
  native boundaries; these are not device E2E results.

Feature outcomes and pending integrations are recorded in [ACCOUNT.md](ACCOUNT.md).
Real passkey registration/authentication is the user's requested next step.

Foundation record, updated during M1 on 2026-09-22. Dependencies are now installed
and locked. Native project generation and JavaScript compilation are distinct from
native build/device verification; see the current verification record below.

## Source and delivery boundary

The frozen frontend baseline is commit
`9c0c15ed16d69f9c2ec57839b9d18222e51d946d`, frontend tree
`773f8b428b741604feddf6a558c67d9fa5c55c2c`.
See [PARITY.md](PARITY.md) for the source-grounded behavior inventory.
Later web changes are evaluated deliberately rather than silently changing scope.

M1–M5 deliver a clearly identified demo using deterministic mock services.
Authentication, wallet access, signatures, balances, quotes, orders and transfers
are simulated. No real money, provider registration, or store submission is part
of this initial implementation. M6 introduces separately specified real services.
Functional tests initially use Jest/RNTL with mocked external boundaries only.
Native-build/manual-device verification remains distinct from those tests.

## Runtime and dependency matrix

Select Expo SDK 57, React Native's New Architecture, and the SDK's default Hermes
runtime. Use React Navigation directly; no Expo Router. The published SDK matrix
and NativeWind installation guide establish the following starting constraints.
Exact resolved package versions belong in M1's npm lockfile; do not resolve native
packages independently with unrestricted latest tags.

| Package / tool                                      | M0 constraint                                               | Selection evidence / resolution rule                                     |
| --------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| Expo                                                | 57.0.24                                                     | npm stable version verified; no beta/canary                              |
| React Native                                        | 0.86.3                                                      | SDK 57 bundled modules snapshot                                          |
| React                                               | 19.2.3                                                      | SDK 57 bundled modules snapshot                                          |
| NativeWind                                          | 4.2.7                                                       | Stable installation guide explicitly documents SDK 57 support            |
| Tailwind CSS                                        | 3.4.17                                                      | NativeWind v4 configuration; no v5/Tailwind 4 migration                  |
| react-native-reanimated                             | 4.5.1                                                       | SDK 57 bundle                                                            |
| react-native-worklets                               | 0.10.1                                                      | SDK 57 bundle; install together with Reanimated                          |
| react-native-safe-area-context                      | ~5.7.0                                                      | SDK 57 bundle                                                            |
| react-native-screens                                | ~4.26.0                                                     | SDK 57 bundle                                                            |
| react-native-svg                                    | 15.15.4                                                     | SDK 57 bundle                                                            |
| @react-native-async-storage/async-storage           | 2.2.0                                                       | SDK 57 bundle; preferences only                                          |
| expo-dev-client                                     | ~57.0.19                                                    | SDK 57 bundle                                                            |
| expo-font / expo-asset                              | ~57.0.4 / ~57.0.18                                          | SDK 57 bundle; add only when needed                                      |
| expo-splash-screen / expo-status-bar                | ~57.0.9 / ~57.0.1                                           | SDK 57 bundle                                                            |
| jest-expo / eslint-config-expo                      | ~57.0.5 / ~57.0.2                                           | SDK 57 bundle                                                            |
| @react-navigation/native, native-stack, bottom-tabs | Stable 7.x family                                           | Accepted explicit navigator approach; resolve matching peers in M1       |
| lucide-react-native                                 | Stable release compatible with React 19.2.3 and SVG 15.15.4 | Resolve peers in M1; do not copy frontend's web icon package             |
| TypeScript / Jest / RNTL                            | Strict TS; Jest + jest-expo + React Native Testing Library  | Resolve versions against SDK 57 and React 19.2.3 in M1; no peer bypasses |
| Prettier / EditorConfig / Husky / Expo Doctor       | Selected tools                                              | Resolve stable compatible releases and record versions in M1             |
| Node / npm                                          | 24.15.0 / 11.12.1 local baseline                            | Meets documented SDK minimum Node 22.13.x; retain npm                    |
| just                                                | Stable Windows-capable release, selected during M1          | Pin/document a version supporting the recipe syntax actually used        |

The non-SDK tooling rows are explicit M1 resolution tasks, not independently
verified compatibility claims. If npm peers disagree, reconcile the matrix and
record the change; do not use force or legacy-peer-deps to hide a conflict.

Sources checked on 2026-09-22:

- [Expo SDK runtime and OS matrix](https://docs.expo.dev/versions/latest/)
- [SDK 57 bundled module versions](https://raw.githubusercontent.com/expo/expo/sdk-57/packages/expo/bundledNativeModules.json)
- [NativeWind stable installation](https://www.nativewind.dev/docs/getting-started/installation)
- [React Navigation native stack](https://reactnavigation.org/docs/native-stack-navigator/)

## Platform and visual defaults

- iOS and Android phones are the accepted initial platform baseline.
- Runtime floors selected from SDK 57: iOS 16.4+, Android 7/API 24+.
  Android compile/target SDK 36; local iOS tooling Xcode 26.4+.
- Portrait-first and no dedicated tablet layout are proposed defaults pending
  the user's device-scope response. Do not describe those as user-confirmed yet.
- Use system fonts provisionally. Font files in the frontend do not establish
  mobile redistribution rights; no license evidence was found in its font folder.
  Preserve hierarchy, spacing and numeric readability while rights are unresolved.
- NativeWind semantic colors follow the frontend: ink #050706, soft ink #0b100d,
  accent #31c47e. Keep native safe areas, accessible controls and text scaling.
- Windows supports shared npm/just tasks and Android tooling; local iOS work
  requires macOS/Xcode. A Windows execution check remains an M1 task.

## Identity and unresolved decisions

| Item                                                            | Current record                                                        | Owner / resolution point                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------- |
| Display name                                                    | Gizu Dev approved for local development                               | Product owner, before app configuration           |
| iOS bundle ID / Android application ID                          | com.example.gizu.dev approved for development; release IDs unresolved | Product owner, before M1 identity configuration   |
| Deep-link scheme / associated domains                           | gizu-dev approved for development; associated domains unresolved      | Product owner + wallet/backend integration owner  |
| Development placeholder IDs                                     | User approved Gizu Dev / com.example.gizu.dev / gizu-dev              | Approved during M1                                |
| Portrait/tablet policy and font rights                          | Response requested; provisional defaults above                        | Product owner, before layout/assets are finalized |
| Expo/EAS project ownership and signing credentials              | Unresolved; no external project created                               | Release owner, before hosted/signed builds        |
| Wallet/custody/passkeys/recovery and chain/contracts            | Unresolved                                                            | Product + backend/security owners, before M6      |
| Prices, fees, precision, limits, lockups and finality           | Fixture values only, not authoritative contracts                      | Product + backend owners, before real operations  |
| Support, statements, push delivery, eligibility and disclosures | Unresolved service/product contracts                                  | Product owner, before related integration/release |

M0 records these unresolved decisions explicitly; it does not manufacture identity
or security decisions. They do not block independent UI work, but any dependent
M1 configuration must wait for an actual choice or an authorized temporary value.

## M1 implementation and verification

Installed Expo 57.0.24 / RN 0.86.3 / React 19.2.3 with NativeWind 4.2.7.
The mobile npm lockfile is authoritative. Expo Doctor required **TypeScript 6.0.3**,
replacing the provisional 5.9 tool choice during installation. No peer bypasses.
Testing uses Jest 29.7.0, jest-expo 57.0.5, RNTL 13.3.3 and matching React test
renderer 19.2.3. RNTL 13 is retained with this renderer/preset combination rather
than mixing the newer RNTL 14 test-renderer engine into the initial scaffold.
ESLint 9.39.5 follows Expo config 57.0.2; Prettier 3.9.8; Husky 9.1.7;
Expo Doctor 1.20.4. just 1.40.0 is the documented/tested recipe syntax target.
Its explicit `windows-shell` setting is supported in this pinned version.

AsyncStorage, bottom tabs and custom font/asset packages are deferred until used.
System UI support is installed for native dark appearance. The platform orientation
is unrestricted for now; dedicated tablet design remains unresolved.

- Passed: dependency install and peer resolution, strict TypeScript, lint,
  functional navigation and unit recovery tests, full-source coverage thresholds.
- Passed: Expo Doctor (21 checks), Expo dependency-version check, native prebuild
  generation for both platforms, Metro/Hermes export for iOS and Android.
- Passed: full `just mobile-check` on macOS in the managed source layout (three
  tests; 100% statements/functions/lines, 85.71% branches). The functional journey
  also passes with the Android Jest preset. These are rendered tests, not devices.
  Windows execution is delegated to CI and is not a local success claim.
- A check with generated native directories correctly failed Doctor because
  CocoaPods is missing. Native generation artifacts were moved outside the repo;
  the managed-source check does not certify native tooling.
- Blocked locally: native compilation and device interaction. Xcode 26.6 exists,
  but no available simulator devices or CocoaPods were found. Android SDK and a
  Java runtime are absent. No simulator/device OS version can be reported.
- Not run: Windows CI, hosted native build CI, EAS builds and physical-device QA.
  CI jobs are configured, not remotely executed by this change.
- Dependency audit: 11 moderate findings, no high/critical findings. These stem
  from `uuid` through Expo/Xcode build tooling. npm proposes incompatible SDK
  downgrades for most affected packages; no forced downgrade or override applied.
  Reassess with the next compatible Expo patch. npm also reports deprecation notices.

M1 native runtime exit criteria remain open until both platform builds and actual
screen/navigation checks pass. NativeWind appearance, keyboard, safe areas, Android
back, iOS gestures, accessibility and background/resume still need device QA.

## M2 implementation and verification

M2 adds React Navigation bottom tabs and replaces the foundation demo screens with
welcome, access, wallet selection, a protected tab shell and a Settings UI preview.
Typography, button variants, notices and an animated SVG brand mark share the
existing theme. The Reanimated entry animation honors system reduced motion.
No additional font or splash assets were needed.

Sessions are explicitly simulated, held only in memory and reset on disconnect or
restart. Access controllers ignore late completions after cancellation/unmount.
Native stacks handle access back navigation and the wallet modal; protected routes
are not registered without a session. See PARITY.md for the P01–P04 status.

- Passed: full `npm run check`, including TypeScript, format, lint, 21 Expo Doctor
  checks and 20 tests. Coverage: 97.8% statements, 93.93% branches, 95.23% functions,
  100% lines. Coverage floors are unchanged.
- Passed: all 18 functional tests with the Android Jest preset, including the
  access/tab/disconnect journey and cold/runtime deep-link protection.
- Passed: iOS and Android Metro/Hermes exports after installing bottom tabs.
- Native motion/worklets are mocked using the installed Worklets Jest resolver
  and official mocks. Navigation, screens, session state and controllers are real
  in the functional suite; no live wallet/API requests occur.
- Blocked/not run: device rendering, actual Android back and iOS swipe gestures,
  native modal dismissal, and hosted native CI, for the same M1 platform prerequisites.
  M1's open checklist items are intentionally unchanged.

## M3 implementation and verification

Portfolio, holdings, vault discovery/details and activity now use one session-scoped
mock snapshot. Chart windows, manager search, risk filters and labeled native sharing
are implemented. Empty/loading/error/retry/stale/offline states are explicit; late
loads cannot restore a disconnected account's data. No packages were added.

- Passed: full `npm run check` (TypeScript, format, lint, all 21 Expo Doctor checks,
  38 tests). Full-source coverage: 96.66% statements, 92.61% branches,
  91.08% functions and 99.49% lines. Existing thresholds remain unchanged.
- Passed: all 30 functional tests with the Android Jest preset.
- Passed: Metro/Hermes exports for iOS and Android.
- Not run: native share-sheet interaction, small-display and large-text visual QA,
  native navigation gestures and hosted CI. Existing native-tooling prerequisites
  remain unresolved; JavaScript exports and rendered tests are not native builds.

The chart and monetary fixtures remain demonstration data. Search/chart/share
choices follow the proposed M3 defaults documented in PARITY.md. M4 trading and
transfers and M5 notifications remain explicitly unavailable in their controls.

## M3.1 usability and native validation — 2026-09-22

This record supersedes the earlier local iOS availability limitation: an iPhone 17
Pro simulator running iOS 26.5 now runs the development app. It does not retroactively
certify all M1/M2 platform exit criteria or hosted CI.

The update prioritizes balance/price, groups supporting metrics, makes timestamps
optional while preserving demo/freshness warnings, improves discovery placement,
adds action hierarchy and shared header navigation, and expands the UI preview.

- Native passed: standard-text Home/Vaults/detail hierarchy; enlarged text up to
  accessibility-extra-large; responsive stacked detail metrics; header Back;
  native demo share-sheet opening and dismissal without sending; software keyboard
  typing, filtering and Search-key dismissal.
- Native regression found and fixed: changing system text size while a screen was
  inactive left cached text heights and clipped content. Atomic text nodes now
  remeasure on font-scale changes while feature/navigation state is retained.
  Tab header text is capped at 1.3 scale; screen content continues to scale.
- The original preferred text size was restored after the inspection.
- Blocked during this run: reliable coordinate gesture validation. Computer
  repeatedly returned `noWindowsAvailable` during drag/swipe attempts. Keyboard
  Search dismissal was verified, but drag dismissal was not.
- Not run: smaller native display, VoiceOver, reduced motion, native swipe-back and
  wallet-modal swipe dismissal, Android device QA, Windows and hosted native CI.
  Rendered tests and JavaScript exports must not be reported as those checks.

- Automated passed: full `npm run check`, including TypeScript, formatting, lint,
  all 21 Expo Doctor checks and all 41 tests (33 functional). Coverage: 96.62%
  statements, 92.38% branches, 97.19% functions and 99.54% lines.
- Automated passed: all 33 functional tests with the Android Jest preset and
  Metro/Hermes exports for both iOS and Android. Exports emitted only a conflicting
  terminal color-environment warning.
- The initial sandboxed Doctor run could not reach Expo metadata; its network-enabled
  rerun passed. There are no remaining failed automated checks.

Tests mock external boundaries; text-size regression coverage verifies state
retention, not native text measurement or glyph layout.

## Headerless navigation — 2026-09-22

All top stack/tab headers are hidden. Back actions now live in scrolling screen
content with the previous direct-entry fallback destinations. Wallet cancellation
and bottom tabs remain available. Screen owns safe-area insets and uses the top
inset for its keyboard offset; it no longer depends on navigator header height.
This supersedes the earlier shared-header design and capped header-title styling.

- Passed: full npm check, all 41 tests, all 21 Expo Doctor checks, formatting,
  TypeScript and lint. The initial sandboxed Doctor metadata failure was resolved
  by the network-enabled rerun.
- Passed native: iPhone 17 Pro / iOS 26.5 Settings and UI preview have no title bar,
  content clears the status bar, and the content Back action returns to Settings.
- Not run for this change: native keyboard, large-text, swipe/modal gesture,
  Android-device and smaller-display checks. Earlier verification is historical,
  not proof of these behaviors after the header change.

## M3.2 frontend design parity — 2026-09-22

Implementation adds shared Surface, Badge, IconButton, GroupedRow, Balance, AccessCard
and Sparkline components, responsive vault tiles, portfolio ordering, grouped details,
account rows, a static entry background and a floating tab capsule. It removes the
remaining brand mark and in-app demo disclosures. Mock adapters, memory-only sessions
and share-payload provenance remain intact. No packages or font assets were added.

- Passed: full npm check, all 21 Expo Doctor checks and 42 tests, including 34
  functional tests. Coverage: 95.88% statements, 91.01% branches, 90.62% functions,
  98.4% lines. Thresholds are unchanged.
- Passed: all 34 functional tests with the Android preset; iOS and Android Hermes
  exports. Exports emitted only terminal color-environment warnings.
- Passed native: iPhone 17 Pro / iOS 26.5 entry/access/Home/Vaults/detail rendering,
  detail Back, safe-area clearance and capsule placement, native search input and
  Search-key keyboard dismissal. Four preferred-text-size increments changed the
  vault grid to a readable single column; the original size was restored.
- Font embedding blocked: repository inspection found Helvetica files but no mobile
  redistribution licence. System typography is the selected fallback.
- Gesture inspection blocked: Computer returned `noWindowsAvailable` during scroll
  attempts. Native full-screen scrolling, swipe-back and modal gesture QA remains open.
- Not run: matched-size frontend/native screenshot comparison, smaller native device,
  VoiceOver, Android device QA, Windows/hosted CI, and physical-device testing. Static
  artwork has no motion, but system reduced-motion settings were not exercised.
- Initial sandboxed Expo metadata checks could not reach the network; the permitted
  network-enabled check passed. No failed automated checks remain.

The simulator still uses the previously installed development binary (displaying
Nexum Dev in its developer menu); it loaded the current Gizu JavaScript successfully.
A fresh native build is needed to reflect the renamed development identity in that menu.

## Tab selection motion — 2026-09-23

The capsule uses a measured sliding pill plus a 1.14-scale icon pop on newly
selected tabs. Navigation state drives both effects. Initial placement/geometry
changes snap; active-tab taps do not replay the pop. Reanimated animations respect
system Reduce Motion and navigation is never delayed for animation completion.

- Passed: full check, all 21 Expo Doctor checks and 43 tests. The new navigation
  test covers prevented presses, repeated selection, long presses and relayout.
- Passed: 34 functional tests with the Android preset.
- Passed native smoke: current bundle reloaded on iPhone 17 Pro / iOS 26.5, tab
  switching works and the indicator settles at the selected Settings destination.
- Not verified: animation frame timing/smoothness, rapid native tap interruption,
  native Reduce Motion setting, and Android device rendering. Mocked Jest motion
  and settled screenshots do not establish those results.

## Tab background crossfade — 2026-09-23

Tab changes retain the sliding pill and icon pop, with one stationary outgoing
background fading out in 150 ms and the moving pill fading in over 180 ms. Rapid
changes replace the outgoing layer rather than accumulating highlights. Initial
placement and geometry changes snap without fading. Both backgrounds ignore
pointer input and are hidden from accessibility; all motion uses system Reduce Motion.

Native crossfade timing, smoothness and reduced-motion behavior have not been
visually verified for this change. Jest validates navigation behavior with mocked
animations; it does not establish intermediate animation frames.

## M3.3 frontend reconciliation — 2026-09-23

- Adopted logo, welcome headline, confidential-vault headings, Swap placeholder,
  roomier vault sparklines and account-row alignment from frontend `64d7cf2`.
- Retained both passkey and external-wallet access by user decision. Request access
  is a separate guest modal using an injected development mock with no persistence,
  network, invitation email or real waitlist registration.
- Passed: TypeScript, ESLint, formatting, 49 tests across 7 suites with coverage.
  After the final responsive form-layout adjustment, TypeScript, ESLint and all
  5 request-access functional tests passed again.
- Native: inspected welcome/logo, Swap placeholder and two-column form on iPhone
  17 Pro / iOS 26.5. Entered a synthetic email, selected investment range/platform,
  and completed the mocked request through the native UI.
- Not run for this update: Android, small-device/enlarged-text visual checks,
  software-keyboard coverage, VoiceOver, reduced-motion and Expo Doctor.
- Trading/transfers and notification/account functionality remain M4/M5 work.

### Swap placeholder layout correction — 2026-09-23

- Fixed heading clipping by matching explicit line height to responsive font size.
  Added a fixed-content option to the screen template; only Swap opts out of scrolling.
- Passed: TypeScript and 21 access/navigation functional tests. On iPhone 17 Pro /
  iOS 26.5 after reload, the complete heading is visible and a scroll attempt leaves
  the content stationary. Android and enlarged-text native checks were not run.

### Coming-soon Lottie heading — 2026-09-23

- Added a separate coming-soon animation asset and feature-local heading renderer;
  retained a single accessible heading and native text fallback. No dependencies added.
- Passed: TypeScript and lint for the new components/asset. Native preview was
  interrupted by simulator window/element-reference errors; appearance and motion
  on iOS/Android still require verification. Existing Lottie text-font resolution
  remains platform-dependent; rendering failure falls back to native text.

### Coming-soon overlay correction — 2026-09-23

- Simulator inspection found the scan-only Lottie asset replaced the heading text,
  leaving an empty area between pulses. Native text now remains rendered at all
  times, with Lottie positioned above it as a decorative overlay. Recentered the
  fragments and reduced their thickness, opacity and movement.
- Passed: TypeScript, focused lint and 23 access/navigation functional tests,
  including text presence with reduced motion enabled and disabled. iPhone 17 Pro /
  iOS 26.5 screenshots confirm the complete heading and stable spacing. Android
  and frame-by-frame animation timing were not verified.

### Stronger coming-soon glitch — 2026-09-23

- Replaced subtle scan-only motion with three clipped native text bands, opposing
  horizontal offsets and colored edges. Shape-only Lottie fragments follow the
  same Reanimated progress clock: two 400 ms bursts per five-second loop, with
  readable pauses. Native text remains rendered; reduced motion, enlarged text,
  inactive navigation/app state and animation failure retain static behavior.
- Reviewed [Lottie's supported features](https://github.com/airbnb/lottie/blob/master/supported-features.md)
  and the [RGB-split reference](https://lottiefiles.com/marketplace/rgb-split-alphabet).
  Use native glyphs plus shape transforms/opacity to avoid animation font dependencies;
  no third-party animation assets or dependencies were added.
- Passed: TypeScript, focused ESLint and all 23 access/navigation functional tests.
  iPhone 17 Pro / iOS 26.5 screenshots show both the clean heading and the visible
  chromatic text-tear burst after navigating to Swap. These spot checks do not
  establish frame pacing. Android, device reduced-motion and full-suite checks
  were not run for this visual adjustment.

### Welcome motion — 2026-09-23

- Added a feature-local native-text tear on “Stealth” and a slow transform/opacity
  cycle on the existing SVG wave. No dependencies or copied assets added. Native
  text remains rendered; motion pauses off-screen/background and honors reduced
  motion. Non-default font scaling uses the original wrapping heading.
- Passed: TypeScript, focused ESLint and 30 tests across access/request-access
  functional suites, including readable welcome content and both entry actions
  with reduced motion enabled and disabled via native-boundary mocks.
- iPhone 17 Pro / iOS 26.5: inspected resting layout and wave positions; opened
  Get started and Request access, then returned successfully. Screenshots did not
  capture a tear burst, so native burst timing/frame pacing remains unverified.
  Android, device reduced-motion/large-text checks and full-suite coverage were
  not run for this adjustment.

### Welcome brand artwork replacement — 2026-09-23

- Replaced the chart-like wave with a large Gizu symbol using the existing logo
  path, a green gradient sweep and occasional small horizontal offsets. Removed
  the unused wave component. Grouped artwork and headline closer together while
  retaining fixed bottom actions and a non-scrolling layout. Compact/large-text
  layouts omit decorative artwork. Reduced motion uses a static gradient.
- Passed: TypeScript, focused ESLint and 30 access/request-access functional tests.
- Native visual verification is pending: simulator was inside a session and
  automatic approval review rejected Disconnect because sign-out was not explicitly
  authorized. No alternate sign-out route was attempted. Android and device
  reduced-motion checks were not run.

### Passkey-only access — 2026-09-23

- Supersedes the earlier dual-access decision. Access now has one full-width
  passkey card and passkey-specific copy. Removed the wallet picker, navigator
  route and external-provider type variants; the controller requests only the
  development passkey method. Authentication remains a memory-only mock.
- Verification: TypeScript, full ESLint and the full Jest coverage command passed.
  Functional coverage includes the absent wallet action, passkey request payload,
  success, rejection/retry, cancellation, duplicate prevention and unknown
  wallet-picker links. Native appearance was not verified: simulator is signed in
  and the earlier automatic approval block on Disconnect remains unresolved.

## M4 trading and transfers — 2026-09-23

- Implemented Swap asset/direction selection, vault buy/sell, Home deposit/withdraw,
  exact amount validation, fee-aware percentages/Max, quote review, signing,
  submission and shared pending/unknown/result feedback. Retired the Swap
  coming-soon screen and its dedicated animation. Account remains passkey-only.
- Added session-scoped mock ledger/service boundaries and operation status retained
  across navigation. Only confirmed adapter responses change balances/holdings;
  status reconciliation uses the original key. Activity includes current receipts.
  Exact prototype balances, fees, lockups and rounding are in TRADING.md.
- Passed: TypeScript, full ESLint, repository formatting checks, all 90 tests across
  10 suites and configured coverage thresholds (92.16% statements, 86.49% branches,
  89.86% functions, 93.87% lines). All 20 new functional flow tests also passed with
  the Android Jest preset. These are rendered tests using mocked native boundaries.
- Passed: iOS and Android Metro/Hermes exports. Expo Doctor initially could not
  fetch remote metadata in the sandbox; the network-enabled retry passed 21/21.
- Native iPhone 17 Pro / iOS 26.5: inspected Swap selection/layout, buy amount form,
  the fee-aware 25% control and quote review with fees/lockup. No native submission
  was performed during this check. Full native success/rejection/cancellation,
  software keyboard, large-text and swipe/hardware-back acceptance remains open;
  Android device verification was not run. JS exports are not native builds.
- M4 implementation is present; its native acceptance checkbox remains open.
  Real credentials, live quotes, backend idempotency and durable/on-chain
  reconciliation remain M6. No live transactions or new dependencies were added.

### Swap coming-soon restoration — 2026-09-23

- Restored the previously accepted fixed Swap presentation with semantic native text,
  clipped chromatic glyph bands and synchronized Lottie accents. Reduced-motion,
  background, focus and enlarged-text guards remain in place.
- The Exchange route/deep link remains stable, but it no longer exposes order entry.
  M4 buy/sell remains available from vault details; Home retains deposit/withdraw.
