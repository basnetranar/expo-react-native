# First Minds V1 Release Checklist

Status at audit: **NOT READY**. Do not submit until all release gates are checked with linked evidence.

## Gate 1 — Blockers

- [x] V1-P1-01: intended EAS project is linked; production config contains project ID and updates URL.
- [ ] V1-P1-02: signed iOS and Android production candidates are built, installed, and lifecycle-tested.
- [ ] V1-P1-03: valid transparent Android adaptive foreground and required store/privacy/support material are supplied.
- [x] Android Live Simulation and Social Overview status-bar overlap is fixed and emulator-verified.
- [ ] No open P0/P1 findings remain.

## Gate 2 — Configuration and assets

- [ ] Production name, slug, scheme, version, iOS bundle ID, and Android application ID are owner-approved.
- [x] Build numbers/version codes are generated from the intended remote version source.
- [x] CNG remains intact; no manual native-directory edits are introduced.
- [ ] Permissions are minimal and store declarations match actual behavior.
- [ ] Icon, adaptive icon masks, splash, dark mode, tablet support, and launch orientation are visually checked.
- [ ] Runtime version and production update channel match the installed binary.
- [ ] App starts and remains usable offline; update checks fail safely.
- [ ] Privacy policy, support URL/contact, data-safety/privacy answers, age rating, category, descriptions, screenshots, and review notes are complete.
- [ ] Signing and submission credentials are stored in the approved service, not committed.

## Gate 3 — Automated validation

Run from a clean checkout with the locked Yarn version:

- [ ] `yarn install --immutable`
- [x] `yarn typecheck`
- [x] `yarn lint`
- [x] `yarn format`
- [x] `yarn test --runInBand` — 44 suites / 186 tests after two diagnostic tests were added.
- [x] `npx expo-doctor` — 21/21 checks pass.
- [x] `yarn sim:determinism`
- [x] `yarn sim:checkpoint-test`
- [x] bounded multi-seed stress and comparison runs; investigate, do not overwrite unexpected hashes.
- [ ] benchmark 50/150/500 and compare to `v1-performance-review.md`.
- [x] production export succeeds for the release platforms.
- [x] diagnostic discovery aggregation agrees with current cultural events.

Attach command, commit, environment, exit code, test count, and output artifact for every item.

## Gate 4 — Signed candidate verification

- [ ] iOS production build completes and installs.
- [ ] Android production build completes and installs.
- [ ] Cold launch from fresh install succeeds on each platform.
- [ ] Returning launch/Continue succeeds.
- [ ] `v1-manual-playtest.md` is completed on iOS and Android.
- [ ] Compact iPhone, iPhone 17 Pro-class, iPad portrait, iPad landscape, and representative Android layouts are recorded where available.
- [ ] 1×/10×/50× default-world smoke test is recorded; no result depends on frame timing.
- [ ] VoiceOver/TalkBack, dynamic type, reduced motion, contrast, and essential touch targets are checked.
- [ ] Airplane-mode launch, save, resume, and navigation work.
- [ ] Background, foreground, OS termination, relaunch, and explicit resume work.
- [ ] Corrupt-copy recovery does not overwrite the last good save.
- [ ] Branch create/switch/delete and checkpoint restoration preserve independent state.
- [ ] Upgrade from the last test candidate preserves supported saved data.

## Gate 5 — Release operations

- [ ] Release commit/tag and engine/checkpoint compatibility version are recorded.
- [x] Known limitations state that high-speed playback is not guaranteed for large populations.
- [ ] Store screenshots and text match actual V1 mechanics; unsupported discoveries are not advertised.
- [x] Rollback/containment plan exists for binaries and OTA updates.
- [ ] If OTA is used, a compatible non-production channel is tested before production publication.
- [x] Local diagnostics/export behavior is documented for support staff.
- [ ] Owner signs off simulation correctness, QA, privacy, and store metadata.
- [ ] Final decision is updated to READY only after zero P0/P1 blockers and both signed candidates pass.

## V1.1 backlog — not a release gate

- [ ] Multiple-world library/reopen flow.
- [ ] External privacy-reviewed crash/usage telemetry.
- [ ] Additional charts, filters, historical explanation, and cosmetic polish driven by user evidence.
- [ ] Larger-population optimization after profiling.
- [ ] Empty legacy directory cleanup.
- [ ] New mechanics, biomes, discoveries, or Slice 10C.
