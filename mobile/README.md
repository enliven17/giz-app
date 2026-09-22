# Nexum mobile

Expo SDK 57 development app for iOS and Android. The current slice includes
welcome, simulated passkey/external-wallet access, a protected four-tab shell,
and disconnect. Demo sessions live only in memory. No real funds, authentication,
biometrics or wallet connection are performed.

From welcome, choose **Get started** or **I have access**, then **Try demo passkey**
or a provider under **Choose demo wallet**. Settings offers **Open UI preview**
and **Disconnect demo**. Home now shows the demo portfolio, holdings and chart periods. Browse all four
vaults, search by name/ticker/strategy/manager, filter risk, and open vault details
or activity. Exchange and transfers remain unavailable until the trading slice.

## Prerequisites

- Node 24.15.0 and npm 11.12.1 (npm is the package manager).
- Optional workspace shortcuts: just **1.40.0** on PATH. The root justfile uses
  `sh` on macOS/Linux and `cmd.exe` on Windows. No Bash is required on Windows.
- Android: Android Studio, SDK/platform tools, an emulator or USB device and
  JDK 17. Configure `ANDROID_HOME` and `JAVA_HOME` for your installation.
- iOS: macOS, Xcode 26.4+ with an installed iOS simulator runtime, Xcode command-line
  tools and CocoaPods. Physical devices require Apple signing setup.
- Use a development build, not Expo Go, for native validation.

## Install and run

From the repository root:

```sh
npm --prefix mobile ci
npm --prefix mobile run android
# macOS only:
npm --prefix mobile run ios
```

These commands generate ignored native projects and build/install a development
client. After that, start Metro with `npm --prefix mobile start` and open the
installed development app. Rebuild after native dependency/config changes.
`just mobile-install`, `just mobile-android`, `just mobile-ios` and
`just mobile-start` are equivalent shortcuts.

Approved local identity: **Nexum Dev**, `com.example.nexum.dev` on both platforms,
URL scheme `nexum-dev`. These are development placeholders, not registered release
identifiers. `app.config.ts` rejects the EAS production profile. Development and
preview profiles exist in `eas.json`; hosted builds still need an explicitly
selected EAS owner/project and credentials. Nothing has been submitted or published.
System fonts and a solid-color splash avoid unlicensed frontend font assets.
Custom icons, fonts and launch artwork remain future product work.

## Commands

Run inside `mobile/`, or use `npm --prefix mobile` from the root.

| Command                                                                                          | Scope                                                          |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `npm run typecheck`                                                                              | Strict TypeScript, including tests/config                      |
| `npm run lint`                                                                                   | Expo ESLint plus atom import boundaries; no warnings           |
| `npm run format:check`                                                                           | Non-mutating Prettier check                                    |
| `npm run format`                                                                                 | Explicit formatting write                                      |
| `npm test`                                                                                       | All unit and functional tests                                  |
| `npm run test:functional`                                                                        | Full screen-flow suite                                         |
| `npm run test:functional -- --runTestsByPath tests/functional/access/access.functional.test.tsx` | Focused journey                                                |
| `npm run test:coverage`                                                                          | All tests and full-source coverage thresholds                  |
| `npm run doctor`                                                                                 | Expo project and dependency health; network access required    |
| `npm run check`                                                                                  | Typecheck, formatting, lint, Doctor and complete test coverage |
| `npm run export`                                                                                 | Compile iOS/Android JS and bundled assets; not a native build  |
| `npm run prebuild -- --no-install`                                                               | Generate ignored iOS/Android projects                          |
| `npm run hooks:install`                                                                          | Opt-in repository hook setup; refuses to replace other hooks   |
| `npm run precommit`                                                                              | Check changed mobile files without rewriting them              |

`just mobile-check` delegates to `npm run check`. CI runs it on Linux and Windows,
then separately compiles Android Debug and an unsigned iOS simulator build.
Configure these jobs as required branch checks in repository settings to enforce
merge protection; the workflow alone cannot change branch protection.

Pre-commit checks formatting/lint for staged paths using working-tree contents;
CI checks the committed revision. Run affected tests during development. Installing
hooks is explicit because this repository contains independently managed apps.
Husky on Windows requires Git for Windows (including its `sh`).
Formatting: two spaces, semicolons, double quotes, 100-column width, LF endings.

## Structure and testing

`src/application` composes startup/providers; `src/navigation` owns typed routes;
`src/features` owns screens; `src/components/atoms` and `templates` hold reusable UI.
Add molecules/organisms when meaningful reuse exists. Colors have one source in
`src/theme/colors.json`, consumed by Tailwind and native navigation.

Functional tests render real screens, navigation and session/controller logic.
Services are injected to test loading, rejection, failure, retry and cancellation;
unavailable native animation/linking boundaries are mocked. Tests also cover cold
and runtime protected deep links, modal cancellation, tabs and disconnect. Unit
tests cover render-error recovery and disabled actions.
Follow [AGENTS.md](AGENTS.md) for permanent testing and architecture policy.
Initial coverage floors are 80% statements/functions/lines and 70% branches,
based on this small foundation's measured coverage; include all source files and
raise floors as the app grows. These tests do not verify native gestures, keyboard
presentation, real biometrics, network operations or on-chain settlement.

See [docs/FOUNDATION.md](docs/FOUNDATION.md) for version decisions and the validation
record, and [docs/PARITY.md](docs/PARITY.md) for the frozen product scope.

## Portfolio and vaults

All M3 values come from mobile-local typed mock adapters. Portfolio totals sum
integer cents; chart samples are synthetic performance indexes, never trade prices.
Period buttons select deterministic 1D/1W/1M/1Y/All fixture windows. Search combines
case-insensitive name/ticker/strategy/manager matching with the selected risk band.
Advanced filters are explicitly unavailable. Vault sharing opens the native share
sheet with a labeled demo summary and no fabricated public URL.

Refresh preserves the previous snapshot on failure and labels stale/offline data.
An empty portfolio, missing vault and empty activity have explicit states. Service
adapters can inject those states in tests; no real network or OS connectivity is
inferred. Disconnect clears the snapshot and invalidates pending requests.

Notifications, buy/sell and deposit/withdraw are identified by availability notes.
They do not simulate a successful operation.

Balance and vault price lead their screens; demo disclosure remains visible while
its timestamp expands on tap. Refresh uses a quiet action. Search/risk filters sit
near the top and Clear filters appears only when needed. Header Back preserves the
previous screen and falls back to the relevant tab for direct entry. Settings →
UI preview demonstrates shared actions, metrics, filters and feedback states.

The iPhone 17 Pro / iOS 26.5 development app was inspected at standard and enlarged
text sizes, including native sharing and software keyboard search. Smaller native
displays, VoiceOver, reduced motion, gestures and Android QA remain pending; see
the foundation record for the exact scope.
