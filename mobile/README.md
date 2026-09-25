# Gizu mobile

Expo SDK 57 development app for iOS and Android. Normal startup now uses native
passkey access and the existing Gizu tabs. Home shows Account 0's Monad testnet MON
balance; Account shows its address, copy, local preferences and disconnect.
Wallet secrets remain in the native signer. This is local wallet access, not
backend authentication; production and physical-iOS acceptance remain pending.

From welcome choose **Get started**, then **Continue with passkey** and create or
open a passkey through the native prompt. Vault services, notifications, fiat
valuations and performance history are unavailable. Deposit shows the receiving address, Withdraw uses native approval, and Activity
reconciles outgoing transfers recorded on this device. Incoming and external
activity are not indexed. Pending/unknown submissions must be reconciled before retry.

Run `npm run start:demo` for the historical M2–M5 fixture flows described below.
Those simulated balances/orders are isolated from native wallets.

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
npm --prefix mobile run android -- --no-bundler
# macOS only:
npm --prefix mobile run ios -- --no-bundler
```

These commands generate ignored native projects and build/install a development
client. After that, start Metro with `npm --prefix mobile start` and open the
installed development app. Rebuild after native dependency/config changes.
`just mobile-install`, `just mobile-android`, `just mobile-ios` and
`just mobile-start` are equivalent shortcuts.

Approved local identity: **Gizu Dev**, `com.example.gizu.dev` on both platforms,
URL scheme `gizu-dev`. These are development placeholders, not registered release
identifiers. `app.config.ts` rejects the EAS production profile. Development and
preview profiles exist in `eas.json`; hosted builds still need an explicitly
selected EAS owner/project and credentials. Nothing has been submitted or published.
System fonts and a solid-color splash avoid unlicensed frontend font assets.
Custom icons, fonts and launch artwork remain future product work.

## Commands

Passkey identity and manual domain checks are documented in
[PASSKEY_CONFIGURATION.md](docs/PASSKEY_CONFIGURATION.md). The frontend owns the
hosted association files; deployment does not happen from mobile scripts.
The [former P1 probe](docs/NATIVE_SIGNER.md#retired-javascript-probe) has been removed. Native mode uses
the native signer; raw PRF is never exposed to JavaScript. Rebuild older clients
to remove the old bridge and install the current signer.

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

Home shows the vault-summary discovery list only when the account has no holdings.
Accounts with holdings see their holdings list without the duplicate vault summaries;
the full discovery catalog remains available from the Vaults tab.

Notifications, buy/sell and deposit/withdraw are identified by availability notes.
They do not simulate a successful operation.

Balance and vault price lead their screens; demo disclosure remains visible while
its timestamp expands on tap. Refresh uses a quiet action. Search/risk filters sit
near the top and Clear filters appears only when needed. Content Back preserves the
previous screen and falls back to the relevant tab for direct entry. Settings →
UI preview demonstrates shared actions, metrics, filters and feedback states.

The iPhone 17 Pro / iOS 26.5 development app was inspected at standard and enlarged
text sizes, including native sharing and software keyboard search. Smaller native
displays, VoiceOver, reduced motion, gestures and Android QA remain pending; see
the foundation record for the exact scope.

All top navigator bars are hidden, including access and modal screens. Each screen
owns its content title; detail/access screens provide a scrolling Back action and
the wallet picker retains Cancel. Bottom tabs remain available on main screens.
The shared Screen template applies safe-area insets and keyboard spacing directly.

## Frontend design parity (M3.2)

The interface now uses layered rounded surfaces, compact vault tiles with sparklines,
change badges, grouped holdings/terms/account rows, paired access cards and a floating
bottom-tab capsule. All top navigation bars remain hidden. The capsule floats over a
transparent overlay, with its measured height reserved in scroll-content bottom padding
so the last items can scroll clear of it. Narrow/large-text vault layouts use one column.

User-facing demo banners and prefixes are removed. The app still uses isolated mock
services and memory-only sessions; this visual update adds no live wallet, signing,
market feed or backend. Share payloads retain fixture provenance. M4 enables mock
trading/transfers; M5 adds account pages, preferences and the in-app inbox. Timestamp details,
error/retry and stale/offline feedback remain available.

System fonts are used because no mobile redistribution licence was found for the
frontend Helvetica assets. Decorative artwork is static and supports reduced motion.
See docs/FOUNDATION.md for the exact native and automated validation record.

## Latest frontend reconciliation (M3.3)

Welcome now uses the Gizu logo and “DeFi in Stealth Mode” headline. Portfolio and
vault discovery use “Confidential vaults”; the Swap tab shows the animated coming-soon
presentation. Vault details provide buy/sell through M4 mock services. Access supports
passkeys only.

Request access opens a guest form with email, investment range and platform choices.
Its isolated mock service sends and stores nothing and does not grant access or
create a real waitlist entry. Functional tests cover validation, submission, retry,
duplicate prevention and dismissal. Notifications use the M5 mock inbox.

## Trading and transfers (M4)

Home opens Deposit/Withdraw; vault details open Buy/Sell. The Swap tab remains a
coming-soon presentation. Every available operation requires amount validation and quote review. After
submission, Check status reconciles the same operation; closing the modal does
not cancel it. Home and Activity can reopen status. The session-scoped mock ledger
updates cash, units and activity only on confirmed responses and resets at sign-out.

See [docs/TRADING.md](docs/TRADING.md) for exact fee, minimum, lockup, rounding,
scenario and dismissal rules. These interfaces are mock contracts, not production
API specifications or real wallet/signing integrations.

## Account and notifications (M5)

Home's notification button opens the inbox with read/unread and mark-all controls.
Account opens passkey/signing information, push-alert preferences, currency,
statements, contact desk and disclosures. Copy address uses the native clipboard.
Only non-sensitive preferences persist in AsyncStorage; explicit disconnect clears
this account's preferences and all session state. USD is the only supported display
currency. Recovery, push delivery, FX, document downloads and support channels are
explicitly unavailable pending their integrations. Real passkeys are next.

See [docs/ACCOUNT.md](docs/ACCOUNT.md) for availability and persistence rules.
M5 adds native storage/clipboard modules: rebuild an existing development client
with `npm run ios` or `npm run android` from `mobile/` before testing this version.

## Developer diagnostics

Normal startup uses real native passkey access in the existing Gizu app and has no UI-preview route, wallet
harness or signer probe:

    npm start

The diagnostics remain in `src/development/`. Open one explicitly in a development
build, from `mobile/`:

    npm run debug:wallet -- --port 8086
    npm run debug:signer -- --port 8085
    npm run debug:ui -- --port 8087

Stop the previous Metro process or open the development-client URL for the selected
port. Restart Metro when changing entry points. These Node-based commands work on
Windows and macOS/Linux and set both debug selection and passkey mode. Normal
`npm start` clears inherited debug settings. The old
`EXPO_PUBLIC_PASSKEY_MODE=native npm start` command no longer opens the harness.

- **wallet:** existing native passkey create/open, Account 0 balance, transfer and
  local outgoing-history harness.
- **signer:** native signature probe and restricted batch-transfer diagnostics.
- **ui:** standalone atomic-component and animation playground.

Debug selection is rejected outside `__DEV__`; no product route or deep link opens
these screens. This is an entry/navigation boundary, not a claim that diagnostic
code has been audited out of a release binary. Native authorization remains
responsible for enforcing signing policy.

Rebuild the native client after signer changes. Use Monad test tokens only.
The normal app uses native services for access, balance and account identity.
Existing Deposit/Withdraw and Activity now use native wallet services. For fixture flows,
launch `npm run start:demo` explicitly.

See [native wallet access](docs/NATIVE_SIGNER.md) for signer scope,
[the implementation plan](PLAN.md#current-implementation)
for product integration, and [structural improvements](PLAN.md#structural-improvements).

## Wallet integration organization

Wallet adapters are grouped in `src/services/wallet/`; pure amounts, proposals and
public contracts live in `src/domain/wallet/`. Features depend on those interfaces,
not generated cryptographic bindings. Native RPC, journal and transfer UI sources
are separated by responsibility. See the [native signer module guide](modules/gizu-signer/README.md)
for ownership, external dependencies, generated artifacts and rebuild instructions.
