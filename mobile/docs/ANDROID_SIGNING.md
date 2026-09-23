# Local Android passkey signing

This configures the development package `com.example.gizu.dev` only. Android
runtime support in the Mera probe is still deferred; signing setup alone does not
enable it. No Android SDK/emulator or APK has been built in this step.

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
