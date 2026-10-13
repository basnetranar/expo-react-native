# First Minds V1 Release Readiness Report

Audit date: 2026-10-11  
Hardening update: 2026-10-12  
Decision: **NOT READY / NO-GO**

Post-audit update: project/update linkage, environment profiles, Corepack, the adaptive foreground,
Android safe areas, and aggregate discovery diagnostics are now fixed. Store/privacy drafts are
present and regression remains green at 44 suites and 186 tests. The decision remains NO-GO because
both signed candidates and their lifecycle tests, hosted policy/support pages, console declarations,
and human store review are incomplete. See `v1-rc-hardening-report.md`.

## Executive assessment

First Minds has a credible, deterministic V1 product core. The simulation, social and learning systems, interventions, save/restore, branching, and the main data-driven screens are connected and exercised by a strong automated suite. All 44 test suites (186 tests) passed; broader replay, checkpoint, long-run, and production export checks also passed. No P0 defect, reproducible data loss, invariant failure, or critical crash was found.

The repository is locally configured for production, but the release is not ready for public
submission. iOS is blocked on interactive Apple credential validation; Android build 5 is finished
and inspected, but neither signed candidate has been installed or lifecycle-tested. Draft store/privacy material still
needs hosted URLs, console entry, and owner approval. These are bounded release-operations issues,
not evidence that the simulation must be redesigned.

### Current result counts

| Classification | Count |
| -------------- | ----: |
| PASS           |     7 |
| PARTIAL        |     9 |
| FAIL           |     0 |
| NOT TESTED     |     0 |

Open or partial finding counts (resolved findings are excluded):

| Severity | Count |
| -------- | ----: |
| P0       |     0 |
| P1       |     2 |
| P2       |     2 |
| P3       |     2 |

## V1 acceptance matrix

|  ID | Requirement                                                         | Status  | Evidence                                                                                                                                                                                                                          | Severity | Recommended action                                                                                               |
| --: | ------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
|   1 | Survival, reproduction, mutation, and evolution work reliably.      | PASS    | Unit/integration suite passed; 15 × 100-generation stress runs completed without invariant errors; legitimate death causes, births, bounded genomes, and trait variation were observed.                                           | —        | Keep golden and invariant coverage unchanged.                                                                    |
|   2 | Social cooperation and relationships emerge naturally.              | PASS    | Social engine tests passed. Multi-seed stress output contained groups, positive and negative relationships, cooperative foraging, sharing, and grooming with seed/environment variation.                                          | —        | Retain multi-seed regression coverage.                                                                           |
|   3 | Learning and cultural transmission produce observable differences.  | PASS    | Slice 10B tests and targeted checkpoint audit passed; stress evidence includes discoveries and cultural loss. Aggregate diagnostics now read retained cultural milestones and have consistency tests.                             | —        | Retain milestone-based diagnostic coverage.                                                                      |
|   4 | Environmental interventions influence outcomes.                     | PASS    | A shared checkpoint was forked for 320 ticks. Control ended hash `c339e1ae3d26e55a`, population 105; drought/food intervention ended hash `0a47373098e45570`, population 89.                                                      | —        | Preserve checkpoint-based branch comparison tests.                                                               |
|   5 | First-launch onboarding works.                                      | PARTIAL | Onboarding replay rendered on Android and iPhone 17 Pro; completion/skip/storage gating tests passed. A true fresh-install completion was not run end to end.                                                                     | P2       | Run the fresh-install script on release-candidate iOS and Android binaries.                                      |
|   6 | Create World and Continue Simulation work.                          | PARTIAL | Create World and current-world continuation rendered on devices; controller, persistence, and route tests passed. A terminate/relaunch/resume pass on signed binaries remains outstanding.                                        | P1       | Validate create, force-quit, relaunch, and continue on both signed release candidates.                           |
|   7 | Live Simulation is understandable and engaging.                     | PARTIAL | Live world, resources, controls, agents, events, and selected-agent details are visible and backed by engine snapshots. Android status-bar overlap is fixed and emulator-verified; first-player/signed-device validation remains. | P2       | Conduct the supplied first-time-player playtest on signed candidates without adding scope.                       |
|   8 | Inspector, Population, Social, and Learning screens show real data. | PASS    | Actual Android routes rendered against the active session. Adapters read controller snapshots, analytics, lineage, social, and cultural stores; no demo entities are put in Zustand.                                              | —        | Keep read-only adapter boundaries.                                                                               |
|   9 | Save, restore, and branch switching work reliably.                  | PASS    | Checkpoint round trips, hashes, branch isolation/switching/deletion, missing fields, and corrupt-envelope recovery are covered by passing tests and checkpoint audit.                                                             | —        | Re-run against signed candidates and retain bounded storage policy.                                              |
|  10 | Deterministic replay and checkpoints pass.                          | PASS    | Nine scenario/seed combinations produced identical direct, batched, and restored hashes; discovery, death, intervention, cultural-loss, and extinction checkpoint boundaries passed.                                              | —        | Do not update golden hashes without an explained engine-version change.                                          |
|  11 | App backgrounding and recovery are safe.                            | PARTIAL | Controller tests prove background pauses/persists and foreground never resumes implicitly. This lifecycle was not manually exercised through OS termination on release binaries.                                                  | P1       | Test background, memory pressure/termination, foreground, and explicit resume on both platforms.                 |
|  12 | No critical crashes or data-loss defects.                           | PARTIAL | No crashes or data-loss failures occurred in 186 tests, stress runs, route checks, or simulator sessions; root recovery and diagnostics exist. Signed-binary destructive/recovery testing is incomplete.                          | P1       | Complete the release-candidate recovery matrix before approval.                                                  |
|  13 | Phone and tablet layouts are verified.                              | PARTIAL | Representative Android, iPhone 17 Pro, and iPad Pro portrait rendered. Repaired Android Live Simulation and Social safe areas pass emulator inspection. Compact iPhone, iPad landscape, signed and physical devices remain.       | P2       | Verify compact iPhone, iPad landscape, and physical signed candidates.                                           |
|  14 | Playback remains responsive as populations grow.                    | PARTIAL | Headless p95: 2.140 ms at 50, 5.668 ms at 150, 46.575 ms at 500. Scheduler achieved 50× at 50, 3.65× at 150, 1× at 500 with backlog at larger sizes. Device 10×/50× was not instrumented.                                         | P2       | Keep default creation at 8–60; do not promise high-speed large populations; profile release binaries.            |
|  15 | Accessibility and empty states are usable.                          | PARTIAL | Meaningful Social/Learning empty states rendered; core controls expose labels/roles/states and reduced motion. No VoiceOver/TalkBack, dynamic type, contrast, or full touch-target audit was completed.                           | P2       | Run the manual accessibility checklist and fix essential-use defects only before release.                        |
|  16 | Production builds and release configuration are validated.          | PARTIAL | Project/update linkage, profiles, runtime/channel, adaptive icon, permissions and drafts are validated. Android build 5 finished and its signed AAB passed inspection; iOS credentials and installed signed testing remain.       | P1       | Complete iOS, deliver/install both candidates, host/review store material, and run signed smoke/lifecycle tests. |

## Repository inventory

- Platform: Expo SDK 57 (`expo ~57.0.27`), React Native 0.86.3, React 19.2.3, Expo Router 57, TypeScript 6 strict, Yarn 4.10.3.
- Navigation: 26 route files under `src/app`, including Home, onboarding, world creation, simulation, inspector, population, lineage, evolution, experiments, histories, social, learning, settings, diagnostics, and not-found recovery.
- Engine: a React Native-independent seeded `SimulationEngine` with agents, genomes, resource and predator mechanics, social systems, learning/culture, analytics, interventions, checkpoints, and testing tools under `src/simulation`.
- Runtime integration: one active simulation session/controller. React consumes read-only presentation snapshots; navigation does not create a second engine.
- State: Zustand holds persisted app preferences, UI snapshots, and update status. Mutable simulation entities remain inside the engine/controller.
- Persistence: checksummed checkpoint envelopes on the file system, AsyncStorage manifest, migrations, branch metadata, and a 50 MB bounded policy.
- Lifecycle/recovery: background pause/persist, no implicit foreground resume, root error boundary, diagnostics export, repair and reset paths, and nonfatal OTA failures.
- Release: managed/CNG project with no checked-in `ios/` or `android/`; environment-specific identifiers, EAS profiles, update URL, runtime and production channel resolve correctly.

Empty legacy feature directories remain under `src/features` and empty route-group directories remain under `src/app` after the starter application was replaced. They are not exported routes and do not affect runtime behavior, but may be removed in a later cleanup. No disconnected V1 screen was found among the current routes.

## Release blockers

1. **P1 — Signed release candidates and recovery flows are unverified.** Android build 5 is finished and inspected; iOS needs interactive Apple credential validation. Neither platform has completed the installed signed lifecycle matrix.
2. **P1 — Store operations remain incomplete.** Adaptive-icon packaging and accurate drafts are complete, but hosted support/privacy URLs, console questionnaires, screenshots and owner approval are pending.

Production EAS/OTA linkage and Android status-bar/adaptive-icon defects are resolved. Do not
publish an OTA or submit a store build while the remaining gates are open.

## Minimum work required

1. Complete the interactive iOS credential/build operation.
2. Deliver/install both signed candidates and run the manual journey, lifecycle/recovery,
   accessibility, offline/update-failure, and playback smoke tests.
3. Host and human-review privacy/support content, complete console declarations, and capture final
   candidate screenshots.
4. Re-run automated validation against the exact release commit and record owner sign-off.

Relative effort: **medium and bounded**. No new simulation mechanic, Slice 10C work, or balance change is justified.

## Safe to defer to V1.1

- Additional charts, filters, biomes, mechanics, discoveries, cinematic art, and larger-population promises.
- UI access to reopen multiple old world files; V1 supports the current world plus alternate histories.
- External crash/usage telemetry, provided privacy requirements are documented and local diagnostics remain available.
- Cleanup of empty starter directories.
- Richer historical explanations after first-player feedback identifies a specific comprehension gap.

## Recommended next task

Complete the owner-dependent release operations in `v1-rc-hardening-report.md`, then execute
`v1-manual-playtest.md` and the signed-device checklist. Do not begin Slice 10C.
