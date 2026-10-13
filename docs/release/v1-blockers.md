# First Minds V1 Findings and Blockers

Audit date: 2026-10-11

Hardening update: 2026-10-12. V1-P1-01 and V1-P2-03 are resolved locally; V1-P2-01 is fixed and
verified in the Android emulator. V1-P1-02 remains open and V1-P1-03 is partial. Detailed evidence
is in `v1-rc-hardening-report.md`.

## P0 — Critical release blockers

None found.

## P1 — Release blockers

### V1-P1-01 — EAS and OTA production linkage is incomplete

**Status: resolved locally.** EAS account/project access, project ID, update URL, production
environment/channel, runtime policy, and CNG native metadata are verified. No OTA was published.
Signed candidate validation is tracked separately under V1-P1-02.

**Evidence**

- `src/config/app-values.json` now contains the supplied EAS project ID.
- Production `expo config --type public --json` contains the expected `extra.eas.projectId`, but no `updates.url`.
- `eas.json` defines development, preview, and production channels, but channel names do not create or link an EAS project.
- `runtimeVersion` correctly uses the `appVersion` policy, but OTA delivery cannot be validated without project linkage.

**Impact:** EAS production builds/updates cannot be defensibly treated as configured from the checked-in defaults. Public distribution and OTA recovery are unverified.  
**Resolution:** confirm account access to the intended EAS project, configure the update URL through the established environment model, verify channels, then run configuration and build checks.  
**Verification:** production config shows the intended project ID and update URL; signed iOS/Android builds complete from the production profile; channel/runtime metadata matches the binary.

### V1-P1-02 — Signed release-candidate lifecycle and recovery are unverified

**Evidence**

- The production JavaScript export succeeded for Android, iOS, and web.
- No signed EAS production artifact was built or installed because project linkage/credentials were not available for this audit.
- Automated checkpoint and lifecycle tests passed, but no production binary was cold-launched, backgrounded, OS-terminated, relaunched, and resumed.

**Impact:** native packaging, signing, production-only configuration, upgrade, and real termination behavior remain outside the evidence set.  
**Resolution:** build both production candidates and execute the release checklist on physical devices where possible.  
**Verification:** installed binaries complete first launch, create/save, force-quit/resume, corruption recovery, branches, offline launch, and update-state checks without loss.

### V1-P1-03 — Store packaging and release declarations are incomplete (partial)

**Evidence**

- The adaptive foreground is now a transparent 1024×1024 safe-zone composition of the existing
  First Minds brand mark and passes generated-resource inspection.
- Privacy policy, support, listing, asset, screenshot and declaration drafts now exist.
- Hosted URLs, support contact, final screenshots, console entries/questionnaires and human/legal
  approval remain outstanding.

**Impact:** Android adaptive masking can produce an unacceptable launcher icon, and store review/submission requirements are not demonstrably satisfied.  
**Resolution:** use an existing approved transparent safe-zone foreground or have the owner supply one; prepare privacy/support/store declarations and submission credentials outside source control.  
**Verification:** launcher preview/device inspection passes across masks and both stores accept the metadata/declarations.

## P2 — Important polish and verification

### V1-P2-01 — Android status-bar overlap on two primary screens

**Status: fixed and emulator-verified.** Headerless Live Simulation and Social layouts now include
top and bottom safe-area edges. Current Android screenshots show content below the status bar with
no double padding. Repeat on the signed candidate.

Actual Android simulator screenshots show the Live Simulation world header and Social Overview eyebrow/title beneath the system status bar. Population, Learning, Inspector, onboarding, and world creation did not show this defect.

**Resolution:** apply consistent top safe-area handling to the affected layouts, then verify Android phones with cutout and non-cutout configurations.

### V1-P2-02 — Device/responsive matrix is incomplete

iPhone 17 Pro, representative Android, and iPad Pro portrait rendered. Compact iPhone automation was blocked by an Expo Go confirmation sheet; iPad landscape was unavailable in the headless simulator environment. First-install and signed-binary tests were also unavailable.

**Resolution:** close only these gaps on release candidates; do not redesign already-working tablet layouts.

### V1-P2-03 — Legacy aggregate discovery counters disagree with current learning events

**Status: resolved.** The runner retains cultural milestones and aggregation checks those records
instead of the bounded general-event window. Two tests cover positive and negative detection;
multi-seed comparison now produces meaningful discovery frequencies without mechanic changes.

`yarn sim:compare` reported zero discovery frequency while the same aggregate contained nonzero tool calories and stress/targeted learning evidence recorded discoveries. The aggregate script appears to count a legacy `firstDiscovery` event shape rather than the current cultural event history.

**Impact:** this does not disconnect gameplay or the product UI, but it can mislead future balance audits.  
**Resolution:** update the diagnostic adapter to the current event schema and add a consistency assertion; do not change learning probabilities or golden engine output.

### V1-P2-04 — Manual accessibility and device-speed evidence is incomplete

The code uses accessibility roles, labels, state, adjustable actions, live regions, and reduced-motion support, and empty states rendered meaningfully. VoiceOver/TalkBack, dynamic type, contrast, touch target, and on-device 10×/50× responsiveness were not measured.

**Resolution:** run the checklist on signed candidates and fix issues that prevent essential use. Large-population 50× is not a V1 requirement.

## P3 — Safe post-release improvements

### V1-P3-01 — Multiple saved worlds are not reopenable from the current UI

Creating a new current world does not erase older files, but the player-facing flow centers on one current world plus its alternate histories. This is compatible with the V1 contract; a multi-world library can be considered later.

### V1-P3-02 — No external crash/usage reporting is configured

The app has local privacy-safe diagnostics and error recovery. External telemetry is optional for V1, but would improve post-release visibility if introduced with explicit privacy disclosure and offline-safe behavior.
