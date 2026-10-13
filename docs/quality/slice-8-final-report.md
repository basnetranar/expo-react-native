# Slice 8 Final Quality Report

## 1. Architecture inventory

- `SimulationEngine` is a deterministic, React-independent owner of the mutable 32×32 world,
  population, predators, learning/culture, interventions, analytics, lineage, archives, RNG, and
  counters.
- `SimulationSessionController` owns the single active engine, playback timer, pause-depth rules,
  active branch, and presentation snapshot publication.
- Zustand contains UI snapshots and warning/error state only; it does not contain mutable engine
  entities.
- Feature routes resolve the registered active controller. Alternate histories persist complete
  engine checkpoints and activate only a checksum/schema-valid restore.
- Benchmark and integrity tooling lives under `src/simulation/testing`, outside production mechanics.

## 2. Slice 8 files changed

- Tooling: `package.json`; `src/simulation/testing/canonicalState.ts`, `invariants.ts`,
  `simulation-integrity.test.ts`, `qualityCli.ts`, `stressSimulation.ts`,
  `performanceBenchmark.ts`, `determinismAudit.ts`, and `checkpointAudit.ts`.
- Playback/lifecycle: `simulation-session-controller.ts` and its tests,
  `use-simulation-session.ts`, simulation UI types/store and tests, `simulation-screen.tsx` and its
  tests.
- Recovery/storage: `history-repository.ts`, repository/integration tests, and
  `ErrorFallback.tsx`.
- Confirmed responsive fix: `simulation-hud.tsx`.
- Evidence: the five `docs/quality/slice-8-*.md` reports. Generated JSON/Markdown CLI output is
  intentionally ignored under `simulation-output/slice-8/`.

No inheritance, mutation, reproduction, consumption, predator, learning, discovery, or scenario
mechanics changed.

## 3. Baseline

Before Slice 8 changes: TypeScript, ESLint, Prettier, and Expo Doctor passed; Jest passed 32 suites
and 137 tests. Baseline tick means were 1.922, 16.194, and 28.292 ms for fixtures starting at 50,
150, and 500 agents. The first two fixtures grew beyond their starting populations, so their values
are not directly comparable with the fixed-population post-change fixture. Full immutable baseline
evidence is in `slice-8-baseline.md`.

## 4. Long-running simulations

The configurable recommended matrix ran Stable Savannah, Drought, and Hard Food with 10 seeds at
100 generations, 5 seeds at 500, and 3 seeds at 1,000: 54 runs and 392.0 seconds total.

- Completion was 54/54 when valid early extinction counts as completion; there were zero crashes,
  invariant failures, NaN/Infinity failures, or stalled runs.
- 26/30 100-generation runs reached their target; four became extinct first.
- All 15 500-generation and all nine 1,000-generation targets ended through valid extinction before
  their target. Overall extinction was 28/54 (51.9%). The farthest run reached generation 746.
- Aggregate observations: 10,418 births, 12,485 deaths, 260 bottlenecks, 76 discoveries, 143
  cultural-threshold events, 42 cultural losses, and 225 migrations.
- Death causes: dehydration 7,465; starvation 2,680; age 1,846; predation 494.

Early extinction is recorded as simulation output, not an engine fault. Balancing was not changed.
Per-seed resources, populations, peaks, causes, runtime, and memory are in `stress.json`.

## 5. Determinism

All nine 600-tick complete-state audits passed across direct, variably batched, and restored
execution. Controller results match at 1×, 5×, 10×, and 50×; pause/resume and read-only feature
navigation do not consume RNG. Fixed complete-state hashes at ticks 40/120/240 protect all three
scenarios. See `slice-8-determinism.md` for hashes and coverage.

## 6. Checkpoint integrity

Two seeds per scenario ran 1,000 ticks with exact 20-tick replay before and after natural birth,
death, discovery, intervention start/expiration, and Drought phase boundaries. Controlled valid
fixtures covered cultural loss and extinction. Every canonical comparison passed. Complete mutable
state includes RNG cache, resources, predators, living/deceased individuals, memories, learned
behaviours, relationships, reproduction bookkeeping, culture, interventions/pending commands,
history, lineage, and counters.

## 7. Branch isolation

Tests pass for shared and nested forks, identical commands, divergent interventions, restart,
concurrent switching, deletion protection, and deletion of an independent sibling. Inspector,
Population, Timeline, Family Tree, Experiments, and Histories all read the active registered session.
A corrupt destination does not replace the current engine or active branch.

## 8. Storage recovery

Checksum/schema validation precedes activation; payload writes use temp-file move semantics;
repository operations are serialized. Tests cover successful restart, interrupted writes, corrupt
or missing files, unsupported schemas, missing manifests, orphans, exhaustion, duplicate saves,
concurrent switches, and referenced deletion. Missing-manifest initialization now removes orphan
payloads. Detailed outcomes and remaining transaction risk are in `slice-8-storage.md`.

## 9. Performance before/after

Post-change tick p95 was 1.917 ms (50), 4.040 ms (150), and 46.457 ms (500); publication p95 stayed
at or below 0.407 ms. The focused scheduler fix changes only batching: at 500 agents the previous
five-tick callback measured 162.401 ms p95; bounded callbacks measured 34.538 ms p95 and preserved
canonical state. Because one 500-agent tick itself exceeds the 12 ms budget, achieved work was one
of five requested ticks per callback. The UI therefore cannot truthfully sustain 50× at 500 agents
in this fixture. At the production cap fixture (150), all five requested ticks were processed.

## 10. Memory

Peak sampled Node heap across scenario groups was 178–191 MB. History/event/debug/intervention,
memory, and relationships are bounded. Deceased snapshots, compact lineage, and user-created branch
metadata are retained by design and potentially unbounded. These must not be silently truncated;
disk-backed/lazy history is the appropriate future direction. Node heap sampling is not a mobile
leak profile.

## 11. Navigation and session lifecycle

Tests confirm one loop, cleanup on dispose, nested analytical pause depth, inspector/timeline/lineage
navigation, manual-pause preservation, background pause/persist, no implicit foreground resume,
stable selection, extinct-session inspection, and missing-ID state. Direct simulator route checks
kept the same active generation/population across Simulation, Population, Timeline, Lineage,
Experiments, Histories, and Inspector.

## 12. Error recovery

History bootstrap failure is now a visible non-fatal warning with retry; it leaves the active
simulation usable. Async completion is mount-guarded. Root recovery actions display their own
failures instead of rejecting unhandled. No path silently resets data. Invariant violations fail
tests with precise state paths.

## 13. Tests

Final Jest result: **33 suites, 153 tests passed, 0 snapshots**. New coverage includes invariant
scanning, fixed hashes, full-state replay, playback speeds, background/manual pause, nested/deleted
branches, corrupt destination preservation, unsupported schema, duplicate/concurrent operations,
missing-manifest orphan recovery, and warning/retry UI.

## 14. Static and Expo validation

- TypeScript: pass
- ESLint: pass
- Prettier: pass
- Jest: pass, 153/153
- Expo Doctor: pass, 21/21
- `git diff --check`: pass
- `sim:stress`, `sim:benchmark`, `sim:determinism`, `sim:checkpoint-test`: pass

## 15. Device/simulator verification

Actually verified in Expo Go 57.0.9:

- iPhone 17 Pro portrait: Home, Live Simulation, Population, Timeline, Family Tree, Experiments,
  Histories, valid Inspector, and missing-ID Inspector.
- iPad Pro 13-inch portrait: Home and Live Simulation tablet composition.
- A confirmed phone HUD title/metric collision was fixed and recaptured successfully.

Not verified: compact iPhone app layout (Expo Go was installed locally, but the unattended simulator
remained at the first-open confirmation), iPad landscape (the available headless `simctl` interface
could not rotate the display), gestures such as family graph pan/zoom, or release-build frame/memory
profiling. No claim is made for those targets.

## 16. Remaining risks

- 50× is throughput-limited at very large populations; the bounded scheduler remains responsive
  relative to the previous five-tick task but cannot preempt one engine tick.
- All 500/1,000-generation stress targets became extinct. This is a balancing/product finding, not a
  stability failure, and needs separate design review before changing mechanics.
- Deceased/lineage archives and history metadata can grow; checkpoint payloads measured roughly
  0.53–2.99 MB at 50–500 agents.
- Manifest and payload writes are individually durable but not one cross-store transaction.
- Mobile rendering, landscape, compact-device, gesture, and retained-memory profiling remain
  incomplete.

## 17. Release-readiness assessment

**Ready for an internal deterministic/stability milestone; conditionally ready for wider QA.** Core
engine replay, checkpoint integrity, branch isolation, persistence rejection paths, lifecycle, and
static validation are release-candidate quality. Wider release should wait for the unverified device
matrix, release-build profiling, and an explicit product decision about long-horizon extinction and
high-population 50× expectations.

## 18. Recommended next milestone

Run a device-focused release qualification milestone: profile Hermes/JSC frame time and retained
memory on release builds; complete compact-phone and iPad-landscape interaction coverage; test
pan/zoom/sliders/dialogs; and design disk-backed, lazy lineage/deceased-history storage. Treat any
balancing response to long-horizon extinction as a separately reviewed change, not a stability fix.
