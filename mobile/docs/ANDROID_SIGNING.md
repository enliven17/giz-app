# Local Android passkey signing

This configures the development package `com.example.gizu.dev` only. Android
is now enabled in the isolated Mera probe for API 28+ with valid signing metadata
and a supported provider. Actual PRF support is established by the ceremony, not
the OS version alone. Native build and emulator/device acceptance remain pending.

## This Mac

OpenJDK 17 is installed with Homebrew. For Android commands in a new terminal:

```sh
export JAVA_HOME="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"
```

The unique local key is `mobile/.credentials/android-debug.keystore` (relative to
the repository root). It is ignored by Git and protected with owner-only file
permissions. It uses the standard development alias `androiddebugkey` and debug
password `android`; file access protects this development-only key. Never upload
or commit it, or use it for a production release.

The Expo plugin `plugins/withAndroidDevelopmentSigning.cjs` configures the generated
Gradle debug signing configuration to use this persistent key, outside `android/`.
Prebuild must not regenerate or replace it. Keep it when cleaning native folders.
Another checkout or machine needs its own deliberate signing setup; there is no
fallback to Expo's shared template debug key. EAS/Play signing is not configured here.

From `mobile/`, inspect its public fingerprint:

```sh
keytool -list -v -keystore .credentials/android-debug.keystore \
  -alias androiddebugkey -storepass android
```

Compare SHA-256 with `androidSha256Fingerprints` in `src/config/passkey-identity.json`
and the frontend's `public/.well-known/assetlinks.json`. If the key is lost or replaced,
update the public association deliberately before testing the new build.

## Deploy and verify

Deploy the frontend file at `https://gizu.io/.well-known/assetlinks.json`. It must
return HTTP 200, `application/json`, and no redirects. Preserve the Apple file.
The statements include the two relations recommended in Android's Credential
Manager prerequisites. No HTTP deep-link intent filters were added to the app.

```sh
curl --fail-with-body -i https://gizu.io/.well-known/assetlinks.json
```

An APK build and a provider test are still required to confirm the certificate
actually used by the installed app. Production will require the eventual package
and signing certificate; for Play-distributed builds use the **Play app signing**
certificate, not merely the upload certificate.

Reference: https://developer.android.com/identity/credential-manager/prerequisites

## Run the Android probe

Install Android Studio, its Android SDK, and a Google Play-enabled emulator.
Use a current API image supported by the installed Expo SDK. Start the emulator
and configure its credential provider and screen lock as needed.
After setting JAVA_HOME/PATH above, run from `mobile/` on macOS:

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$ANDROID_HOME/platform-tools:$PATH"
EXPO_PUBLIC_PASSKEY_MODE=probe npm run android
```

If Metro is already running in another mode, stop/restart it with the probe flag.
If using a separate Metro terminal, also set the flag there:

```sh
EXPO_PUBLIC_PASSKEY_MODE=probe npm start -- --port 8083
```

Run offline crypto self-check, then create an unfunded test passkey, recover the
same address, and sign/verify the fixed test message. Confirm cancellation,
unsupported PRF, backgrounding, and recovery after restart. A provider may leave
an existing passkey after partial failure; open it before creating another.
The probe never falls back to mocked success. `native` onboarding mode remains
unimplemented, and real transactions remain unavailable.

## USB connection recovery

If the development client stays blank and Metro has no connected runtime, keep
Metro running in probe mode and reconnect the phone through USB. Use the serial
reported by `adb devices`; replace `DEVICE_SERIAL` below. These commands restart
only Gizu and do not delete its data:

```sh
adb -s DEVICE_SERIAL reverse tcp:8081 tcp:8081
adb -s DEVICE_SERIAL shell am force-stop com.example.gizu.dev
adb -s DEVICE_SERIAL shell am start -a android.intent.action.VIEW \
  -d 'gizu-dev://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081' \
  com.example.gizu.dev
```

Use the same port as the active Metro server. USB forwarding avoids dependence
on phone-to-Mac Wi-Fi reachability. A connected JavaScript runtime is not itself
proof that a passkey ceremony or screen rendering succeeded.

## Credential-provider lifecycle

Android may report `background` while a passkey provider Activity is open. The
probe preserves only a pending ceremony through that transition and waits up to
five seconds after its response for the app to become active. Derivation and
signing still require foreground; unmount invalidates pending results, duplicate
requests remain blocked, and failed/abandoned results clear owned secret buffers.
AppState cannot distinguish the provider Activity from pressing Home during the
same request; this is a bounded probe policy, not production lifecycle acceptance.
After registration completes but local derivation fails, use **Open existing test
passkey** instead of registering another credential.
