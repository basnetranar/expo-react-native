# First Minds V1 Release-Candidate Hardening Report

Date: 2026-10-12

## Outcome

Local P1/P2 configuration defects were fixed without changing gameplay mechanics. Automated
regression is green and the repaired Android safe areas were observed in the emulator. V1 remains
**NO-GO** because the iOS signed candidate requires interactive Apple credential setup, the finished
Android AAB has not been installed/lifecycle-tested, and the signed-device lifecycle/store review
matrix is incomplete.

## Implemented

- Linked EAS project `cb4f1536-f484-4e4a-a909-b8efebbddf56` and configured the SDK 57 update URL.
- Made environment selection explicit per EAS profile; production now resolves the unsuffixed app
  name and identifiers instead of development values.
- Enabled Corepack for Yarn 4 EAS builds and retained remote versioning/signing.
- Declared the app's system-only/exempt encryption usage for iOS.
- Rebuilt the Android adaptive foreground from existing approved transparent brand artwork,
  centered within a 1024×1024 safe canvas; verified alpha and generated resources.
- Blocked legacy external-storage permissions.
- Added top/bottom safe-area handling to headerless Live Simulation and Social routes without
  altering header-managed screens.
- Corrected aggregate discovery diagnostics to use retained cultural milestones rather than the
  truncated general event window; added consistency tests.
- Prepared privacy, support, listing, screenshot, declaration, EAS, build, and device-test records.

## Findings status

| Finding                             | Status                      | Evidence / remaining acceptance work                                                                                                                               |
| ----------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| V1-P1-01 EAS/OTA linkage            | Resolved locally            | Correct project, URL, runtime, environments, profiles and channel resolve; no OTA was published. Final OTA application test awaits signed candidates and approval. |
| V1-P1-02 signed RC lifecycle        | Open                        | Android build 5 (`648b60e2-a0a4-4b28-af7b-527032020535`) finished and its AAB was inspected. iOS credentials and both-platform installed lifecycle passes remain.  |
| V1-P1-03 store packaging            | Partial                     | Adaptive icon and drafts are complete. Hosted privacy/support URLs, console records/declarations, screenshots, human approvals and final-binary inspection remain. |
| V1-P2-01 Android safe areas         | Fixed and emulator-verified | Live and Social start below the status bar; no arbitrary offsets or double padding. Signed-device regression still required.                                       |
| V1-P2-02 device matrix              | Open                        | Representative development containers tested; compact/iPad landscape, signed and physical matrix pending.                                                          |
| V1-P2-03 discovery aggregation      | Resolved                    | New milestone-based tests pass; multi-seed results now report nonzero scenario/tool discovery frequencies.                                                         |
| V1-P2-04 accessibility/device speed | Open                        | Code evidence and headless benchmark remain good; manual assistive-tech and signed-device speed pass pending.                                                      |

P3 multiple-world library and external telemetry remain deferred. Neither is required for the
frozen V1 contract; adding them now would expand scope/privacy risk.

## Regression summary

- TypeScript, ESLint, Prettier: pass.
- Jest: 44/44 suites, 186/186 tests (audit baseline 43/184; only aggregate diagnostic tests added).
- Expo Doctor: 21/21 pass.
- Determinism and checkpoint audits: pass.
- Stress: 15 bounded 100-generation runs completed without invariant errors.
- Aggregate comparison: 24 runs reached generation 50; discovery diagnostics now agree with
  cultural milestones.
- Production export: Android, iOS and web pass; 29 static routes.
- Clean isolated Android prebuild: pass; adaptive resources and permission removals generated.

## Files changed by this hardening pass

- `app.config.ts`
- `eas.json`
- `README.md`
- `assets/README.md`
- `assets/branding/adaptive-icon-foreground.png`
- `src/config/app-values.json`
- `src/features/simulation/screens/simulation-screen.tsx`
- `src/features/simulation/screens/simulation-screen.test.tsx`
- `src/features/social/screens/social-overview-screen.tsx`
- `src/simulation/testing/runSimulation.ts`
- `src/simulation/testing/aggregateRuns.ts`
- `src/simulation/testing/aggregateRuns.test.ts`
- Release documents under `docs/release/`.

## Exact owner actions

1. Run `npx eas-cli@latest build --platform ios --profile production`, authenticate with the Apple
   Developer account, validate/create the distribution certificate and provisioning profile, and
   do not replace valid shared credentials unnecessarily.
2. Install/test an APK generated by Google Play internal testing (or another production-equivalent
   signed delivery) from Android build 5; the store AAB itself is not directly installable.
3. Provide a support email and host the prepared privacy/support content at stable HTTPS URLs.
4. Human-review store copy, content rights, age/export/privacy/data-safety declarations and create
   the App Store Connect/Play Console records. Do not submit yet.
5. Capture final candidate screenshots and complete the signed physical-device matrix in
   `v1-device-test-results.md`.
