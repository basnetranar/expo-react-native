# First Minds V1 Test Evidence

Audit date: 2026-10-11  
Host: macOS, Node/Yarn project tooling; Expo Go simulators/emulator where noted.

Hardening update (2026-10-12): EAS project and update linkage now resolve correctly. TypeScript,
lint, formatting, 44 suites/186 tests, Expo Doctor 21/21, determinism, checkpoint, stress,
multi-seed comparison, and production export pass. The aggregate discovery defect is repaired.
Signed-candidate lifecycle checks remain outstanding.

## Hardening validation record

| Command                                                           | Exit | Result                                                                                                                                                                                             |
| ----------------------------------------------------------------- | ---: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn validate` (sandboxed)                                       |    1 | TypeScript, ESLint, Prettier and 44/44 suites (186/186 tests) passed; only the final Doctor registry lookup failed with sandbox DNS `ENOTFOUND`.                                                   |
| `npx expo-doctor` (network-enabled rerun)                         |    0 | 21/21 checks passed.                                                                                                                                                                               |
| `yarn sim:determinism`                                            |    0 | Nine direct, batched and restored scenario/seed combinations remained identical.                                                                                                                   |
| `yarn sim:checkpoint-test`                                        |    0 | All checkpoint boundary cases passed.                                                                                                                                                              |
| `yarn sim:stress --generations 100 --seeds-100 5 --population 50` |    0 | 15 bounded runs completed; no invariant errors.                                                                                                                                                    |
| `yarn sim:compare --seeds 8 --generations 50`                     |    0 | 24 runs reached generation 50; repaired discovery frequencies were nonzero and scenario-sensitive.                                                                                                 |
| production `expo export --platform all`                           |    0 | Android, iOS and web exported; 29 routes.                                                                                                                                                          |
| isolated `expo prebuild --platform android --no-install`          |    0 | CNG generated adaptive resources and legacy-storage permission removals; no native directories were added to the repository.                                                                       |
| Android emulator route inspection                                 |    0 | Live Simulation and Social content rendered below the status bar after the safe-area fix.                                                                                                          |
| EAS Android production build 5                                    |    0 | Build `648b60e2-a0a4-4b28-af7b-527032020535` finished; signed AAB manifest/resources inspected. Package, runtime, update channel and adaptive alpha match; overlay/storage permissions are absent. |

## Automated command record

| Command                                                                                                                               | Exit | Result                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---: | ------------------------------------------------------------------------------------------------------------------------------------ |
| `yarn typecheck`                                                                                                                      |    0 | TypeScript strict check passed.                                                                                                      |
| `yarn lint`                                                                                                                           |    0 | ESLint passed.                                                                                                                       |
| `yarn format`                                                                                                                         |    0 | Prettier check passed; all matched.                                                                                                  |
| `yarn test --runInBand`                                                                                                               |    0 | 43/43 suites and 184/184 tests passed in 74.627 s.                                                                                   |
| `npx expo-doctor`                                                                                                                     |    0 | 21/21 checks passed.                                                                                                                 |
| `EXPO_PUBLIC_APP_ENV=production expo export --platform all --output-dir /tmp/first-minds-v1-export --clear`                           |    0 | Android, iOS, and web bundles exported; 29 static routes generated. Approximate bundles: Android 4.7 MB, iOS 4.6 MB, web 3.0 MB.     |
| `yarn sim:determinism`                                                                                                                |    0 | Nine scenario/seed combinations passed direct, batched, and restored hash equality.                                                  |
| `yarn sim:checkpoint-test`                                                                                                            |    0 | Discovery, death, intervention, cultural-loss, and extinction boundaries passed.                                                     |
| `yarn sim:stress --generations 100 --seeds-100 5 --population 50`                                                                     |    0 | 15 runs; completion rate 1.0; no invariant errors; two legitimate extinctions.                                                       |
| `yarn sim:compare --seeds 8 --generations 50`                                                                                         |    0 | 24 runs; all reached generation 50; scenario and trait outcomes varied. Diagnostic discovery fields were inconsistent; see V1-P2-03. |
| `yarn sim:benchmark --samples 100 --populations 50,150,500 --scenario stableSavannah --output simulation-output/v1-audit/performance` |    0 | Completed; detailed results in `v1-performance-review.md`.                                                                           |
| `EXPO_PUBLIC_APP_ENV=production expo config --type public --json`                                                                     |    0 | IDs/version resolved, but EAS project ID and update URL were absent.                                                                 |

The audit did not run a cloud production build, store submission, or OTA publish. Credentials and EAS project linkage were not available, and publishing was outside scope.

## Simulation correctness evidence

- Stress runs covered Stable Savannah, Drought, and Hard Food across five seeds each and 100 requested generations.
- Final populations varied naturally. Stable: 95, 4, 1, extinct at generation 44, 40. Drought: 88, 36, 1, extinct at generation 91, 40. Hard Food: 35, 79, 16, 14, 13.
- Recorded causes included starvation, dehydration, predation, and age. No post-death participation or count invariant error was reported.
- Birth/death totals, life-stage distributions, resource observations, social events, and trait deltas varied by seed and scenario.
- Aggregate 50-generation means differed: Stable population 49.625, Drought 24, Hard Food 54.75. Trait directions were mixed rather than forced toward a scripted endpoint.
- Genome/mutation, resource conservation, reproduction eligibility/cost, aging, predator, social bounds, group consistency, knowledge, and extinction behavior are covered by passing targeted tests.

## Social and learning evidence

- Social tests cover familiarity, affinity/trust bounds, group formation/dissolution, cooperative forage, sharing conservation, grooming costs/effects, negative relationships, and removal of dead participants.
- Multi-seed stress reports contain groups and social activity, with differing counts across scenario/seed combinations.
- Learning tests cover independent discovery, opportunities, failed/successful imitation, practice/proficiency, teaching, group differences, cultural loss, historical retention, and rediscovery fixtures.
- Acquired behaviors live in individual/cultural state and are not part of the inherited genome. Presentation adapters label inherited potential separately from learned knowledge.
- The `sim:compare` discovery summary is not reliable until V1-P2-03 is corrected; product learning screens use the newer cultural history and living-agent analytics.

## Intervention/branch evidence

A common checkpoint was restored into two branches and advanced by 320 ticks:

| Branch              | Initial checkpoint hash | Final hash         | Generation | Population | Food | Water |
| ------------------- | ----------------------- | ------------------ | ---------: | ---------: | ---: | ----: |
| Control             | `f3809128e7dbe714`      | `c339e1ae3d26e55a` |         10 |        105 | 8999 |  3719 |
| Drought + food 0.55 | `f3809128e7dbe714`      | `0a47373098e45570` |         10 |         89 | 9661 |  4314 |

The divergent state and population demonstrate that supported changes reach the mechanics. Resource totals are population-dependent and should not be read as direct abundance percentages. Existing tests also verify branch isolation and restoration.

## Persistence, recovery, and determinism

- Checkpoints use a versioned, checksummed envelope and preserve engine state, RNG state, agents/genomes, social state, learned knowledge, groups, environment, events, and branch metadata.
- Round-trip and continuation hashes pass. Separate histories do not leak mutable state.
- Missing optional fields, older versions/migrations, corrupt envelopes, storage failure, deleted/nested branch state, and recovery UI are covered by tests.
- `Math.random` is absent from simulation decisions. Wall clock is used for scheduler budgets and metadata, not engine outcomes. IDs use seeded/stable generation.
- Playback batching does not change the outcome hash.
- Background policy is explicit: a running session pauses and persists; foregrounding does not restart it automatically. Controller tests pass, but OS-level signed-binary verification remains open.

## Actual UI/device evidence

| Target                          | Configuration                         | Screens actually observed                                                                 | Result                                                                                                |
| ------------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Android emulator                | `sdk_gphone16k_arm64`, Expo Go 57.0.9 | Live Simulation, Population, Social, Learning, onboarding replay, Create World, Inspector | Functional. Live and Social top content overlaps the status bar; other observed screens were legible. |
| iPhone 17 Pro simulator         | Expo Go                               | Onboarding                                                                                | Rendered without content clipping; Expo Go/system chrome occupied a large top region.                 |
| iPad Pro 13-inch (M5) simulator | Portrait, Expo Go                     | Home/current world                                                                        | Responsive tablet composition rendered with current world, continue, histories, and feature cards.    |
| Compact iPhone 17e simulator    | Expo Go                               | Attempted                                                                                 | Not completed: Expo Go system confirmation sheet blocked headless navigation.                         |
| iPad Pro landscape              | Headless simulator                    | Attempted                                                                                 | Not completed: orientation control was unavailable in this environment.                               |

These are development-container checks, not evidence for signed production binaries or physical-device thermals/memory behavior.

## Error handling evidence

- Root class boundary offers retry, restart, diagnostics/export, repair, and reset paths.
- Bootstrap validates storage, migrations, app state, assets, and update state; OTA failure is nonfatal.
- Invalid world configuration and invariant failures are surfaced rather than silently normalized into unrelated state.
- No deliberate missing-asset production mutation was made during this audit. Missing-asset handling was inspected/tested, not destructively injected into the working tree.

## Environment limitations

- No EAS project link, signing credentials, App Store Connect/Play Console access, or store metadata was available.
- No production binary was installed.
- Physical-device, screen-reader, dynamic-type, offline airplane-mode, OS-kill, compact-phone, and iPad-landscape checks remain for the release candidate.
