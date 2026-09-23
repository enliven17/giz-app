# Apple passkey association on gizu.io

The frontend publishes `public/.well-known/apple-app-site-association` unchanged
at `/.well-known/apple-app-site-association`. It authorizes the Gizu development
iOS app (`588X2UZY3L.com.example.gizu.dev`) to use passkeys for `gizu.io`.
It does not implement web passkey login or authorize a future production app ID.

## Deploy on Render

Deploy the frontend from `main` using the existing build and publish settings.
Vite includes the file in `dist/.well-known/apple-app-site-association`.

For a Render Static Site, add this rule under **Headers** in the service dashboard:

| Path | Name | Value |
| --- | --- | --- |
| `/.well-known/apple-app-site-association` | `Content-Type` | `application/json` |

The file must be served directly on `gizu.io` with valid HTTPS and HTTP 200.
Do not redirect this URL to `www`, a `.json` URL, or the application's index page.
If this deployment uses a Web Service instead, configure the same behavior in
its HTTP server. A file in `public/` cannot configure production HTTP headers.

After deployment, check without following redirects:

```sh
curl --fail-with-body -i https://gizu.io/.well-known/apple-app-site-association
```

Confirm HTTP 200, `Content-Type: application/json`, and the JSON from the source
file. Apple caches domain associations, so a successful deployment may not be
immediately reflected in passkey requests. The native app must also be correctly
signed and declare `webcredentials:gizu.io` in its Associated Domains entitlement.

Preserve existing app entries when adding future app IDs. Update this public file
deliberately when the accepted mobile identity changes.

References: [Render headers](https://render.com/docs/static-site-headers),
[Apple associated domains](https://developer.apple.com/documentation/xcode/supporting-associated-domains).

## Android local development association

`public/.well-known/assetlinks.json` contains the package and public certificate
fingerprint for the local Android development build. Deploy it alongside the
Apple file at `https://gizu.io/.well-known/assetlinks.json`, returning HTTP 200 and
`application/json` without redirects. Add a matching Render header rule for this
path if needed. Preserve both files and any future approved signing identities.

Only the public fingerprint is published; the private keystore stays on the
developer's Mac. This does not configure Play production signing or enable the
currently iOS-only mobile probe. See `mobile/docs/ANDROID_SIGNING.md` in the repo.
