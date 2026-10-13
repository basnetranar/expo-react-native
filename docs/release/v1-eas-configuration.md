# First Minds V1 EAS Configuration

Verified: 2026-10-12

## Production identity

| Field                  | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| Publisher              | Challenge Me Lab                                          |
| EAS project            | `@challenge-me-lab/first-minds`                           |
| Project ID             | `cb4f1536-f484-4e4a-a909-b8efebbddf56`                    |
| App version            | `1.0.0`                                                   |
| iOS bundle identifier  | `com.challengemelab.firstminds`                           |
| Android application ID | `com.challengemelab.firstminds`                           |
| Update URL             | `https://u.expo.dev/cb4f1536-f484-4e4a-a909-b8efebbddf56` |
| Runtime policy / value | `appVersion` / `1.0.0`                                    |
| Production channel     | `production`                                              |
| Version source         | EAS remote, auto-increment for production                 |

`development`, `preview`, and `production` profiles set matching EAS environments,
channels, and `EXPO_PUBLIC_APP_ENV` values. Development and preview identifiers are
suffixed; the production identifiers above are stable. All profiles enable Corepack so EAS
uses the Yarn 4.10.3 version pinned by `package.json`.

`expo-updates` checks safely through the configured URL. The app treats update-check,
download, and reload failures as nonfatal and retains the embedded/current working update.
No OTA update was published during hardening.

## Verified commands

- `eas whoami`: authenticated as `challengemelab`, with access to `challenge-me-lab`.
- `eas project:info`: confirmed the project and ID above.
- `eas config --platform android --profile production`: production name, ID, environment,
  channel, URL, and runtime resolved correctly.
- `eas config --platform ios --profile production`: the same production values resolved for
  iOS.
- `expo config --type introspect`: generated native update metadata contains the URL and
  runtime version on both platforms.

## Signing and build record

| Platform | Profile    | Native build | Runtime | Channel    | Reference                              | Status                                             |
| -------- | ---------- | -----------: | ------- | ---------- | -------------------------------------- | -------------------------------------------------- |
| Android  | production |            5 | 1.0.0   | production | `648b60e2-a0a4-4b28-af7b-527032020535` | Finished; signed AAB inspected                     |
| iOS      | production |   1 reserved | 1.0.0   | production | No build created                       | Blocked on interactive Apple credential validation |

The existing remote Android keystore was reused. The first Android attempt
(`1a31d105-43e0-4b82-b81b-39f1056c38e1`, versionCode 2) failed because the EAS worker
used global Yarn 1; enabling `corepack` fixed that configuration defect. Upload attempts
advanced the remote Android version counter. VersionCode 4 built successfully, but final-AAB
inspection found an unused `SYSTEM_ALERT_WINDOW` permission. It was explicitly blocked and the
replacement release candidate, versionCode 5, finished successfully.

Build 5 inspection confirms package `com.challengemelab.firstminds`, version `1.0.0` / code 5,
minimum SDK 24, target/compile SDK 36, update URL/project ID, production request header, runtime
1.0.0, and signed archive integrity. External-storage and overlay permissions are absent. The
generated xxxhdpi adaptive foreground is 432×432 and retains alpha. Remaining permissions are
Internet, network/Wi-Fi state, vibration, Android dynamic-receiver protection, and Play install
referrer binding from dependencies; no dangerous runtime permission is present.

EAS reference:
`https://expo.dev/accounts/challenge-me-lab/projects/first-minds/builds/648b60e2-a0a4-4b28-af7b-527032020535`

The iOS configuration now sets `ios.config.usesNonExemptEncryption` to `false`. The app
contains no proprietary or non-exempt cryptography; HTTPS is supplied by platform/network
libraries. Challenge Me Lab must confirm that answer during store review.

## Operator commands

Interactive iOS credential setup and build:

```sh
npx eas-cli@latest build --platform ios --profile production
```

Check the Android build:

```sh
npx eas-cli@latest build:view 648b60e2-a0a4-4b28-af7b-527032020535
```

After credentials are configured, a non-interactive production build can be retried. Do not
run `eas update --channel production` until a compatible preview-channel update has passed
and publication is explicitly approved.

## Release safeguards

- CNG is retained; no `ios/` or `android/` directory is committed.
- Signing credentials remain in EAS and are not stored in the repository.
- No development-only app name, identifier, or environment resolves in production.
- `appVersion` runtime compatibility means native changes require an app-version bump before
  OTA publication.
- Rollback/containment: stop production publication, repoint/roll back the EAS Update branch
  only to a compatible known-good update, and ship a new binary for native/config changes.
