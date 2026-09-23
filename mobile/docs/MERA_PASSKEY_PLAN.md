# Mera passkey wallet integration plan

Status: P0 local identity/configuration implemented; signing and hosted association
verification remain blocked. P1 probe implemented; real iPhone acceptance remains pending.
Initial release is iOS-only (user decision). Android is deferred and is not an acceptance gate.
Apple Team ID: `588X2UZY3L` (user supplied; signing/hosting still require verification).
See [native compatibility probe](MERA_NATIVE_PROBE.md).
See [P0 configuration record](PASSKEY_CONFIGURATION.md).
Researched: 2026-09-23. Local baseline: `ed5a2b3`.
User decision: use Mera with React Native, starting with passkey-created wallets.
Confirmed follow-up: one EVM wallet, metadata-only persistence, a fresh passkey
request when signing is needed, and separation from mock balances/transactions.
The user supplied `gizu.io` and authorized mock configuration for missing inputs.
The user confirmed `gizu.io` for both development and production and shared
web/mobile wallet recovery using the same passkey and derivation. Other
recommendations below remain proposals.

## Feasibility and what Mera provides

This is a strong fit for a supported-device prototype, with production readiness
conditional on recovery, domain ownership, device testing and security review.
Mera has an official native adapter and an Expo mobile demo. Our Expo 57.0.24,
React Native 0.86.3 and React 19.2.3 are close to the demo's SDK 57 / RN 0.86
stack. That is compatibility evidence, not proof that our exact build works.

The documented flow is a client-side SDK integration, not a hosted Mera user API:

1. The native passkey provider creates or selects a passkey and verifies the user.
2. Mera requests its PRF output: deterministic secret bytes associated with that
   credential, relying-party ID and salt.
3. Our derivation adapter turns those bytes into an EVM account and public address.
4. A short-lived signing session can prove control of that address when needed.

The wallet flow needs no Mera API key or Mera-hosted account database. Platform
association checks and passkey-provider synchronization still have their own
network requirements. Deriving an EVM address does not deploy a smart contract,
fund an account, submit a transaction or create a Gizu backend user.

The proposed account is an externally owned EVM account. Mera does not by itself
provide smart-account recovery, transaction sponsorship, KYC, portfolio indexing,
token pricing or our backend authorization. Solana support exists but is outside
the recommended first slice. The fixture's Monad label is not a network decision.

## Verified prerequisites and limitations

| Topic                  | Verified evidence                                                                        | Effect on this project                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Native adapter         | `@category-labs/mera/react-native-webauthn-client` wraps `react-native-passkey`          | Use the native adapter for every ceremony, not browser APIs or a WebView                          |
| Published packages     | Mera latest was 0.2.0; its native peer is exactly 3.6.1; native-passkey latest was 3.6.2 | Initially pin the supported pair; do not override the peer conflict to take latest                |
| Runtime randomness     | Hermes needs `crypto.getRandomValues`; recipe uses Expo Crypto                           | Load the polyfill before any Mera import in `index.ts`                                            |
| Native OS support      | Mera documents iOS 18+ and Android 9+ with PRF support                                   | Existing documented iOS 16.4 / Android 7 floors are insufficient for passkey-only access          |
| Provider support       | Ordinary passkey support does not imply usable PRF output                                | Detect unsupported configurations and validate actual create/get on target providers              |
| App-domain association | HTTPS RP host, Apple association and Android asset links                                 | Hosting/signing configuration is required before successful native ceremonies                     |
| Account continuity     | Same credential, RP ID, salt and derivation reproduce the account                        | Freeze and version these inputs before creating durable wallets                                   |
| Key protection         | Derived wallet keys exist in caller memory                                               | Never describe the wallet signing key as non-exportable or confined to Secure Enclave             |
| SDK maturity           | Published 0.2.0; official native demo exists                                             | Pin/review dependencies; this research did not establish an independent audit of the complete SDK |

OS minimums alone are not a capability check. The underlying provider must return
a usable PRF result. The native adapter uses platform-key calls; do not promise
that all external security keys or browser-supported providers work natively.

## Confirmed direction and remaining recommendations

- EVM account index 0 only. Follow the official account recipe: default fixed Mera
  salt, PRF entropy to English BIP-39 mnemonic, seed with empty BIP-39 passphrase,
  then BIP-32 path `m/44'/60'/0'/0/0`. Record a derivation version and test vectors.
  Revalidate the published implementation before adopting it. No custom crypto.
- Frozen RP ID: `gizu.io` for development, production, web and mobile (user
  confirmed). Hosting and signed app associations remain unverified. The same
  credential and derivation recover the same wallet on every surface; development
  is not an isolated wallet namespace. Do not change this identity without a
  reviewed migration/recovery strategy. Matching usernames alone do not establish
  account continuity.
- Do not persist PRF output, mnemonic, seed or private key in the first slice.
  Keep only validated credential metadata, address and derivation version locally.
  Store this privacy-sensitive metadata behind a dedicated storage adapter, with
  SecureStore as the proposed implementation; AsyncStorage remains preferences-only.
- Re-run the native passkey ceremony when unlocking or requesting a new signature.
  Initially end the signing session immediately after address derivation or one
  approved signature. Keep secrets out of React state, logs and serialized errors.
- Show a remembered address only as a locked account, not proof of authentication.
  App/backend session state and wallet signing capability are different states.
- Freeze initial native passkey support at iOS 18+, with PRF provider checks
  still required. Android API 28+ support is deferred. P0 retains existing demo installation floors; P1 must
  reject unsupported OS/provider configurations before any native ceremony. The
  unsupported-access presentation belongs to P2.
- Use test accounts only until recovery and production-readiness gates are met.

The official mobile demo instead saves PRF output in authentication-gated
SecureStore, then derives a key after a local biometric/device unlock. This is an
optional later convenience mode, not the proposed default. It persists wallet
root material and a local unlock is not a fresh passkey ceremony. If selected,
it needs separate invalidation, backup/reinstall and physical-device testing.

## Placeholder configuration and mocked development

The user authorized placeholders so scaffolding and functional tests can proceed
before real signing/hosting details are available. Recorded values:

| Input                            | Value for now                             | Status                                                  |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------------- |
| Product domain / planned RP ID   | `gizu.io`                                 | Frozen across environments/surfaces; hosting unverified |
| iOS development bundle ID        | `com.example.gizu.dev`                    | Existing app configuration; release identity unresolved |
| Android development package      | `com.example.gizu.dev`                    | Existing app configuration; release identity unresolved |
| Apple Team ID                    | `588X2UZY3L`                              | User supplied; signing/hosting unverified               |
| Android certificate fingerprints | `REPLACE_WITH_ANDROID_SHA256_FINGERPRINT` | Nonfunctional placeholder                               |
| Release app identifiers          | Unset                                     | Must be selected before release association files       |

Prepare association-file templates for
`https://gizu.io/.well-known/apple-app-site-association`, without publishing it.
Android asset links are deferred. Placeholder Apple Team IDs must fail validation, rather
than look like valid credentials. Never invent a signing identity or certificate.

Use an explicitly selected development mock adapter for create/open/sign outcomes,
with deterministic synthetic credentials and test addresses. Exercise success,
cancellation, unsupported PRF, failures, account continuity and lifecycle handling.
These tests must not invoke native credential creation or pretend an OS biometric
check happened. The mock must never receive or persist real key material.

The real adapter remains separately selectable and fails closed when configuration
is incomplete; it must never fall back silently to mock success. We can implement
P2/P3 controllers and UI against this boundary while P0 hosting is pending. P1's
real native create/get/signature gate stays open until valid associations and
supported devices are available. No mocked result establishes Mera feasibility on
our actual devices or enables real funding/signing against fixture transactions.

## Implementation phases

### P0 — Freeze identity and configuration

- [x] Record the user-supplied domain `gizu.io` and placeholder configuration policy.
- [x] Freeze `gizu.io` across environments and share web/mobile RP and derivation.
- [x] Prepare mock adapter scenario specifications and association templates with
      explicit placeholders; scenario execution belongs to P1/P2 tests.
- [x] Record Apple Team ID `588X2UZY3L` and wire it into Expo iOS configuration.
- [ ] Verify the signed iOS development app identifier under this team. Select the
      release identifier before production. Android signing is deferred.
- [ ] Serve `/.well-known/apple-app-site-association` with the app's
      `TEAM_ID.bundleIdentifier` in `webcredentials.apps`.
- Android association files and fingerprints are deferred; not required for iOS.
- [ ] Verify the Apple association file is public HTTPS JSON without redirects
      and includes the intended signed iOS app.
- [x] Add Expo `ios.associatedDomains` using `webcredentials:gizu.io`, validate mode
      at build/startup, and freeze passkey OS support, salt and derivation version.
- [x] Add local config/template checks and an explicit hosted-association verifier.
      Placeholder metadata is rejected before network verification.

Local implementation details, mock scenarios and the remaining external gate are
in [PASSKEY_CONFIGURATION.md](PASSKEY_CONFIGURATION.md).

Exit: domain association is verified for the signed iOS development build. Do not
use Mera's demo domain or copy its app identifiers as our integration identity.

### P1 — Prove compatibility in a native development build

- [x] Install pinned Mera/native-passkey, Expo-compatible Crypto and the selected
      metadata storage dependency. Add BIP-32/BIP-39 dependencies from the documented
      recipe; do not depend on the unpublished demo-shared workspace package.
- [x] Verify TypeScript, Metro/Hermes exports and the iOS New Architecture native
      development build. Transitive package-export warnings are recorded in the probe doc.
- [ ] Complete the signed physical-iPhone checks; Android native work is deferred.
      Expo Go is not acceptance evidence.
- [x] Implement the isolated create/recover/fixed-message-sign probe, ephemeral
      derivation, metadata storage and automated boundary/functional tests.
- [ ] Create one test passkey, derive the address, end the session, then select that
      same passkey and verify the same address is recovered.
- [ ] Sign a clearly scoped non-transaction test message and independently verify
      its signature/address. No RPC, funding or transaction submission is needed.
- [ ] Run on a physical iPhone with a supported provider. Test cancellation and unsupported PRF alongside the success path.

Exit: iOS passes real create/get/address/signature checks. Stop
and revise compatibility assumptions before broad UI work if either fails.

### P2 — Replace access and account identity

- [ ] Replace `DemoSession` and the single `request("Demo passkey")` abstraction
      with explicit create, open-existing, lock and disconnect contracts.
- [ ] Keep orchestration in access controllers; put Mera/native calls in a wallet
      service and deterministic derivation in a separate adapter/module.
- [ ] Add distinct Create wallet and Use existing passkey actions. Never create a
      new credential automatically after sign-in fails or local metadata is absent.
- [ ] Support discoverable credential selection after reinstall/local record loss;
      pin the credential when the user selects a remembered account. Validate the
      derived address against a known record before restoring that account.
- [ ] Model unsupported, creating/opening, locked, ready and recoverable error states.
      Map native cancellation, no credentials, PRF failure and association errors
      without treating every failure as “user rejected.” Sanitize error reporting.
- [ ] Serialize ceremonies. UI cancellation may only abandon the result, not dismiss
      the OS ceremony. Do not start another until the native request settles.
      Late results must have their buffers/session disposed without signing in.
- [ ] Handle partial creation: registration may leave a passkey even if PRF fallback
      or persistence fails. Offer reopening it rather than silently generating another.
- [ ] Allow for one or two system prompts during creation, depending on whether the
      authenticator supplies PRF output during registration. Do not promise Face ID
      specifically; platform verification may use a PIN/password instead.
- [ ] Replace fixture identity/address in Account and portfolio identity components.
      Do not invent a real name or membership status from a wallet address.

Exit: create/open/back/cancel/retry work without accidental duplicate wallets;
returning access restores the correct account and stale account data is cleared.

### P3 — Enforce lifecycle and isolate the live wallet

- [ ] Keep the signer in a private service, expose public metadata and narrowly
      scoped signing methods only. Zero caller-owned PRF/seed/key buffers in `finally`
      and call `end()` on every session, including failed or abandoned operations.
- [ ] Lock on background/disconnect. Distinguish OS passkey-prompt transitions from
      a genuinely abandoned app so lifecycle handling cannot cancel every ceremony.
      Recheck authorization before signing after a foreground transition.
- [ ] End wallet signing capability immediately on disconnect, even if preference
      deletion fails. The M5 behavior that keeps a session open after cleanup failure
      must not retain real wallet access. Surface cleanup failure separately.
- [ ] Explain that disconnect/forget removes local state, not the provider's passkey.
      Fresh access must be possible through credential discovery after forgetting.
- [ ] Separate the real-wallet experience from M3–M5 fixtures. Do not associate the
      real address with mock holdings, balances, notification events or profile.
      Use unavailable/empty live-data states or a wallet-only destination initially.
- [ ] Keep mock transactions in an explicitly separate development path with no
      real signer. The existing `sign(quoteId)` returns a mock authorization string;
      it is not a transaction-signing contract and cannot be wired directly to Mera.
- [ ] Leave live deposit, withdrawal and trading disabled until chain, token,
      executable payload, fees, review and reconciliation contracts are implemented.

Exit: no real key can sign a fixture order; no fixture balance appears as the
new wallet's assets. Background, cancellation and cleanup release signing access.

### P4 — Add verified backend identity when required

Wallet creation can ship to internal testers before a user API exists. A server
must not accept an address, credential ID or a client “passkey successful” flag
as authentication. The current Fastify backend registers health routes only.

- [ ] Agree whether this release needs a Gizu user record/session. If yes, add a
      server-issued wallet-ownership challenge flow, with SIWE as the recommended
      EVM standard, and integrate it before protected backend features are exposed.
- [ ] Validate domain/URI, allowed chain, nonce, expiry and signature; consume the
      nonce once atomically, prevent replay/races, then create or find the user and
      issue a revocable session. Define session expiry, secure token storage and logout.
- [ ] Preserve typed ports/adapters and use-case boundaries in the Fastify backend.
      Authentication proves wallet control, not email ownership, KYC or eligibility.
- [ ] Do not send PRF bytes, seed phrases or private keys to the backend or analytics.
      Mera's high-level ceremony returns PRF/credential metadata and generates its
      own challenge; this is not a server-verified WebAuthn login protocol.

Exit: authenticated API access requires verified proof, with real persistence tests
for nonce consumption and user creation. This is separate from wallet generation.

### P5 — Recovery and release gates

- [ ] Select recovery: approved phrase export/import, an encrypted-secret-vault
      architecture, smart-account recovery or another explicitly reviewed design.
      Do not enable funding until the chosen model has an end-to-end recovery test.
- [ ] Explain that syncing the same credential may restore the same account; a
      newly created backup passkey normally derives a different wallet. Ordinary
      password reset cannot recover a lost passkey-derived account.
- [ ] Test missing/deleted credentials, provider-account loss assumptions, reinstall,
      multiple credentials, supported provider sync, device migration and the
      inability to change RP domain without a prior export/migration strategy.
- [ ] Review dependency provenance, SDK audit status, error/crash-report redaction,
      distribution/update trust and the software-key memory threat model.

Loss of the final usable passkey without an existing recovery path can make funds
unrecoverable. Buffer zeroing reduces exposure but does not guarantee erasure of
all JavaScript/runtime copies. Do not advertise hardware-wallet key isolation.

## Tests and acceptance evidence

Keep the existing functional-test policy and add wallet scenarios with mocked
native/service boundaries: create vs existing, missing metadata, duplicate taps,
two-prompt flow, rejection, unsupported PRF, association failure, partial creation,
storage failure, background/foreground, late completion, account mismatch and
disconnect cleanup failure. Use fixed synthetic PRF inputs for derivation vectors
and independently verify signatures; never use a real credential in fixtures.

Run TypeScript, format, lint, Doctor, coverage and the iOS native build for the initial release. Device
acceptance must separately demonstrate repeated address recovery, signing proof,
provider selection, lifecycle and chosen recovery. Simulators and Jest cannot
establish production passkey-provider/biometric behavior.

P0 delivered configuration, templates, checks and documentation. P1 now installs
the pinned dependencies and implements an isolated probe. No real credentials
were created and nothing was published. Automated and simulator checks do not
establish successful real-device Mera ceremonies; see the probe acceptance matrix.

## Inputs needed before implementation reaches device acceptance

1. Access to publish association files on the frozen RP host `gizu.io`.
2. Verify signing for supplied Team ID `588X2UZY3L`; select release app identifiers
   when needed. Android fingerprints are deferred.
3. Eventual target chain. Shared web/mobile wallets, one EVM account, no
   PRF/private-key persistence and metadata-only storage are confirmed.
4. Supported device/provider policy and physical devices available for testing.
5. Recovery expectations before funding; whether backend user sessions belong in
   the first release or follow the native wallet proof.

Recommendation: implement P0–P3 as the first bounded delivery. Mock-based
scaffolding can proceed while configuration is incomplete, but real integration
acceptance still requires the P1 device gate. P4 is required before real protected backend operations; P5 is required
before accepting real funds. This keeps wallet feasibility separate from production
investment readiness without treating the unresolved services as completed.

## Sources checked

- [Mera React Native recipe](https://mera.category.xyz/recipes/use-mera-with-react-native/)
- [Native and provider support](https://mera.category.xyz/authenticator-support/)
- [Passkey account continuity and loss](https://mera.category.xyz/concepts/passkey-accounts/)
- [Security model](https://mera.category.xyz/concepts/security-model/)
- [Signing session lifecycle](https://mera.category.xyz/concepts/signing-sessions/)
- [Account derivation recipe](https://mera.category.xyz/recipes/create-passkey-accounts/)
- [Native adapter reference](https://mera.category.xyz/reference/web-authn-client/)
- [Official mobile demo](https://github.com/category-labs/mera/tree/main/demos/mobile)
- [Official derivation code](https://github.com/category-labs/mera/blob/main/demos/shared/src/hd.ts)
- [Mera package metadata](https://registry.npmjs.org/@category-labs%2fmera)
- [Native passkey package metadata](https://registry.npmjs.org/react-native-passkey)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [Expo domain association configuration](https://docs.expo.dev/linking/ios-universal-links/)
- [SIWE / ERC-4361](https://eips.ethereum.org/EIPS/eip-4361)

Official repository main tree inspected: `a3102f4fa7b89ce4e58e843a2d6da2201035ff25`.
Repository main and published packages can differ; build against pinned published
packages and revalidate before implementation. Context7 did not index Mera or
native-passkey specifically, so their official documentation/source was read
directly; Expo configuration and storage guidance was also checked through Context7.
