# Local Android passkey signing

This configures the development package `com.example.gizu.dev` only. The former Android Mera probe is retired. Its signing configuration is retained
for the implemented native signer; see [the retirement record](NATIVE_SIGNER.md#retired-javascript-probe).

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

## Run after the legacy probe removal

The old JavaScript Mera probe and its raw native PRF bridge were removed on
2026-09-24. Use `EXPO_PUBLIC_PASSKEY_MODE=mock` for the demo. Neither `probe` nor
`native` is currently available. Keep the local signing key and association
configuration for the native signer described in [N0](NATIVE_SIGNER.md).

Rebuild and replace existing Android development clients with `npm run android`
after clearing an old probe-mode environment setting. Metro reload alone does not
remove the bridge embedded in a previously installed APK. The native replacement
has not been implemented, and no old provider passkeys are deleted by this change.
