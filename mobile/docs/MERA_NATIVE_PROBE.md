# P1 — Native Mera compatibility probe

Current Android scope update: the isolated P1 probe now permits Android API 28+
with valid package/certificate metadata and native passkey support. Real PRF,
signing, lifecycle and recovery acceptance remain pending. Earlier iOS-only and
Android-deferred statements below describe the previous baseline; Android
production support is not established. See [Android setup](ANDROID_SIGNING.md).

Implementation is available on `feature/mera-integration`. Real-iPhone acceptance
remains pending; the probe is intentionally isolated from demo access, portfolios,
orders and transfers. It cannot submit a transaction or accept arbitrary signing
payloads. P2 integrated access has not started.

## Run the probe

Initial release: iOS only. Apple Team ID `588X2UZY3L` is configured; Android is
deferred and does not block this release.

From `mobile/`, install dependencies with `npm ci`, then rebuild the development
client with `npm run ios`. Expo Go does not contain the native
passkey module. CocoaPods/native build tools are required for the relevant platform.

Set `EXPO_PUBLIC_PASSKEY_MODE=probe` in the local `.env` (see `.env.example`), then
run `npm start -- --port 8083`. Restart Metro after changing the mode. Alternatively:

```sh
# macOS/Linux, without changing .env
EXPO_PUBLIC_PASSKEY_MODE=probe npm start -- --port 8083
```

Use `mock` or remove the variable and restart Metro to return to the existing demo.
`native` remains reserved for P2 access and fails closed. Release builds cannot
perform probe ceremonies. The EAS production build guard remains in place.

The supplied Team ID passes local validation, which does not prove domain
association or signing. To perform the actual experiment, verify the signed iOS
bundle under that team, publish/review the Apple association file, and
run `npm run passkeys:verify-domain`. Rebuild for native identity/entitlement changes.
The probe never converts a real failure into mocked success.

## Experiment

Before domain setup, **Run offline crypto self-check** exercises Expo native
randomness and a known public BIP-39 test vector, Mera signing and viem recovery
under Hermes. It stores no wallet and calls no passkey provider. Passing this
check does not establish PRF/biometric support or production randomness quality.

1. Use an unfunded, separately created test passkey. Development and production
   share `gizu.io`, so a development build can otherwise select the same wallet.
2. Select **Create test passkey**. Mera can request a second assertion when creation
   does not return PRF output. The address is derived and the signer is ended.
3. Select **Recover same address**. The remembered credential is pinned, a fresh
   native assertion runs, and both credential ID and derived address must match.
4. Read the fixed message and select **Sign and verify test message**. Another
   assertion derives a temporary signer. Mera signs an EIP-191 digest; viem independently
   recovers the address. The signer is ended before verification, storage or UI work.
5. Restart the app, recover again, and repeat cancellation and unsupported-provider
   checks. A remembered address alone is not an authenticated session.
6. **Forget local test metadata** removes only the SecureStore entry. It cannot
   delete the provider's passkey. **Open existing test passkey** performs discovery
   when metadata is missing, including after partial creation/storage failure.

No create operation is automatically retried. Failure after registration may leave
a passkey on the provider; try opening it before creating another. Operations are
serialized until the native request settles, including after UI abandonment.

## Implementation boundaries

- Pinned Mera 0.2.0 + react-native-passkey 3.6.1; BIP-32/BIP-39 2.4.0 and viem 2.56.8.
  Expo Crypto ~57.0.3 and SecureStore ~57.0.4 were installed through Expo's matrix.
- `index.ts` loads the native secure-randomness polyfill before Mera imports.
  It uses `getRandomValues`, with no `Math.random` fallback.
- `services/nativeMeraProbe.ts` supplies Mera's native WebAuthn adapter, the frozen
  salt and RP, OS/configuration gates, foreground handling and sanitized errors.
- `services/meraProbe.ts` owns serialization, late-result abandonment and continuity.
  An inactive system sheet can return to active; a full background transition
  abandons the result. Returning to active has a bounded event-based wait.
- `services/meraDerivation.ts` uses the official recipe, clears owned PRF/seed/key
  buffers and calls `session.end()` in `finally`. No signer is stored in React state.
  BIP-39 strings and library/runtime copies cannot be guaranteed erased; this is
  software wallet-key derivation, not Secure Enclave isolation of the EVM key.
- `storage/probeWallet.ts` persists an explicit projection of credential ID, address,
  RP and derivation version, under `gizu.mera.probe.metadata.v1`. It uses device-only
  Keychain accessibility on iOS and rejects malformed/mismatched metadata. No PRF,
  mnemonic, seed, private key or test signature is persisted. Clearing/uninstalling
  the app does not guarantee iOS Keychain removal.
- The probe screen and controller expose only public results. No fixture investment
  provider or backend session is composed into this app entry.

## Acceptance matrix

| Check                                                   | Status                                                                  |
| ------------------------------------------------------- | ----------------------------------------------------------------------- |
| Pinned install, TypeScript and SDK dependency health    | Implemented; see verification record below                              |
| Offline derivation/signature and rendered flow tests    | Automated, using synthetic secrets and mocked native/storage boundaries |
| iOS simulator native build with Hermes/New Architecture | Passed; this is not physical-device passkey acceptance                  |
| iOS/Android JavaScript exports                          | Passed, with transitive Noble export-resolution warnings                |
| Physical iPhone create/get/address/signature            | Pending: signed physical iPhone and verified Apple association hosting  |
| Android native build and physical-device checks         | Deferred by product decision; not an initial-release gate               |
| Real provider PRF, cancellation, sync and recovery      | Not run; must be verified on each target platform/provider              |

Metro warns that viem/ox's transitive Noble v1 package resolves `crypto.js` through
file fallback. Exports completed and the iOS runtime reached the probe screen;
the dependency warning is retained as a compatibility limitation, not hidden by
disabling package exports globally. Existing native dependencies also emit build
warnings; no native compile errors remained in the successful iOS builds.

Tests exercise the actual Mera SDK/native adapter with the platform module mocked,
plus a known public BIP-39 vector, independent signature recovery, metadata projection,
wrong-account rejection, cancellation/PRF failure, double taps, late results,
backgrounding and persistence failures. They do not establish OS biometric or
passkey-provider correctness. P1 stays unchecked until a physical iPhone
passes the real experiment. Android is deferred.

## Historical native verification — before the iOS-only scope update

- Passed: full `npm run check` — TypeScript, formatting, lint, Expo Doctor 21/21,
  and 138 tests in 18 suites with coverage thresholds satisfied.
- Passed: all five probe functional flows with the Android Jest preset; these
  remain rendered tests with mocked native boundaries, not Android device tests.
- Passed: final iOS/Android JavaScript exports, iOS native development build,
  simulator probe rendering, empty SecureStore read and offline crypto self-check.
- Blocked/not run: real native create/get/sign on physical iPhone and Android;
  Android native build; real association hosting and signed-device verification.

The iPhone 17 Pro / iOS 26.5 simulator ran a newly rebuilt development client.
The initial unsigned build rendered the screen but could not read SecureStore;
rebuilding with normal local ad-hoc simulator signing resolved the read failure.
No real Apple Team ID or provider credential was invented to bypass association.
The signed simulator app read empty metadata successfully, showed the configuration
blocker with disabled native actions, and completed the offline crypto self-check.
No native create/get/sign ceremony was attempted with placeholder configuration.

Metro was left running in `probe` mode on port 8083 for inspection. This command's
environment does not change `.env` or the default mode of future `npm start` runs.

Sources: [Mera native recipe](https://mera.category.xyz/recipes/use-mera-with-react-native/),
[official derivation](https://github.com/category-labs/mera/blob/main/demos/shared/src/hd.ts),
[Expo Crypto](https://docs.expo.dev/versions/latest/sdk/crypto/),
[Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/).
