# Mobile foundation

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

| Item                                                            | Current record                                                         | Owner / resolution point                          |
| --------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| Display name                                                    | Nexum Dev approved for local development                               | Product owner, before app configuration           |
| iOS bundle ID / Android application ID                          | com.example.nexum.dev approved for development; release IDs unresolved | Product owner, before M1 identity configuration   |
| Deep-link scheme / associated domains                           | nexum-dev approved for development; associated domains unresolved      | Product owner + wallet/backend integration owner  |
| Development placeholder IDs                                     | User approved Nexum Dev / com.example.nexum.dev / nexum-dev            | Approved during M1                                |
| Portrait/tablet policy and font rights                          | Response requested; provisional defaults above                         | Product owner, before layout/assets are finalized |
| Expo/EAS project ownership and signing credentials              | Unresolved; no external project created                                | Release owner, before hosted/signed builds        |
| Wallet/custody/passkeys/recovery and chain/contracts            | Unresolved                                                             | Product + backend/security owners, before M6      |
| Prices, fees, precision, limits, lockups and finality           | Fixture values only, not authoritative contracts                       | Product + backend owners, before real operations  |
| Support, statements, push delivery, eligibility and disclosures | Unresolved service/product contracts                                   | Product owner, before related integration/release |

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
