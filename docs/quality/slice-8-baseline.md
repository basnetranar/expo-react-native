# Slice 8 Baseline

Captured before Slice 8 production or test changes on 2026-10-10 (Australia/Sydney).
Measurements are local development measurements, not estimates.

## Environment

- Git revision: `40bc1c1` with the existing multi-slice working tree retained
- macOS 26.6.2 on Apple M5 Pro, 15 cores, 24 GB RAM, arm64
- Node.js 26.5.0, Yarn 4.10.3
- Expo SDK 57.0.27, React Native 0.86.3, React 19.2.3
- Benchmark runtime: Node/tsx development execution, not a release mobile binary

## Architecture inventory

- `SimulationEngine` owns the only mutable deterministic world state.
- `SeededRng` is the sole engine random source and includes its cached Box-Muller normal value in
  checkpoints.
- The 32×32 world, hominins, predators, interventions, analytics, deceased archives, lineage, and
  ID counters are serialized by `EngineCheckpointV1`.
- `SimulationSessionController` owns one active engine, uses a 20 ms timer, and publishes at most
  every 200 ms. Playback speed changes tick accumulation, never tick order.
- UI/application state in Zustand contains presentation snapshots only; mutable engine entities are
  not stored there.
- Alternate histories store checkpoint JSON in Expo FileSystem and lightweight manifests through
  the typed AsyncStorage abstraction. Only the active branch has an engine instance.
- Expo Router stack routes reuse the registered active controller for Inspector, Timeline,
  Population, Family Tree, Experiments, and Histories.

## Static and automated baseline

- TypeScript: passed
- ESLint: passed
- Prettier: passed
- Jest: 32 suites, 137 tests passed, 0 snapshots, 33.01 seconds
- Expo Doctor: 21/21 checks passed
- Existing exact checkpoint/replay, branch storage, controller speed, lifecycle, and scenario tests
  passed.

## Engine microbenchmark baseline

Each fixture used 20 warm-up ticks and 200 measured single ticks. Population maximum was raised in
the benchmark fixture only; production balancing/configuration was not changed. Heap is Node's
highest sampled `heapUsed`, not device resident memory.

| Initial population | Living after sample | Tick mean |    Median |       p95 |       Max | Snapshot |  Checkpoint | Serialize |   Restore | Peak sampled heap |
| -----------------: | ------------------: | --------: | --------: | --------: | --------: | -------: | ----------: | --------: | --------: | ----------------: |
|                 50 |                  85 |  1.922 ms |  1.847 ms |  2.826 ms |  3.314 ms | 0.129 ms |   716,522 B |  3.339 ms |  3.126 ms |      22,781,280 B |
|                150 |                 259 | 16.194 ms | 16.998 ms | 22.984 ms | 24.300 ms | 0.123 ms | 1,665,682 B |  7.492 ms |  7.959 ms |      61,163,480 B |
|                500 |                 500 | 28.292 ms | 28.225 ms | 32.323 ms | 34.697 ms | 0.198 ms | 3,001,759 B | 14.036 ms | 13.083 ms |      97,154,360 B |

The measured bottleneck is engine tick processing as population grows. Snapshot creation was below
0.2 ms in this fixture. At 500 agents a single tick exceeds the controller's 20 ms timer interval,
so a 50× request cannot be assumed to represent real-time 50× throughput.

## Scenario baseline

One deterministic seed (`COMPARE-1`) per scenario was run for 100 generations using the existing
`sim:compare` tool. Total measured engine runtime was 15.184 seconds.

| Scenario        | Completed       | Extinct | Final / peak / minimum population | Births / deaths | Dominant deaths                | Discoveries                               | Migrations |
| --------------- | --------------- | ------- | --------------------------------- | --------------- | ------------------------------ | ----------------------------------------- | ---------- |
| Stable Savannah | 100 generations | No      | 26 / 89 / 7                       | 93 / 117        | Dehydration 51, starvation 43  | Non-tool discovery; no stone cracking     | 5          |
| Drought         | 100 generations | No      | 7 / 89 / 2                        | 53 / 96         | Dehydration 47, starvation 36  | Non-tool discovery; no stone cracking     | 0          |
| Hard Food       | 100 generations | No      | 56 / 150 / 50                     | 359 / 353       | Dehydration 176, starvation 95 | Stone cracking discovered and established | 3          |

This single-seed baseline is not a balancing conclusion. Broader configurable stress runs belong to
the final Slice 8 benchmark output.

## Baseline retention and risks

- Generation summaries are capped at 200; events at 1,000; debug trace at 500.
- Agent memories are trait-capacity bounded; relationships are capped at 24 per agent.
- Learned-behaviour keys are limited to the engine's finite behaviour set.
- Intervention terminal records are capped by their manager configuration.
- Lineage records and deceased inspector archives are retained for the active session by design and
  can grow without a configured cap.
- Branch count is user-driven. Payload bytes have a 50 MB limit, but manifest/history metadata does
  not currently have an independent byte limit.
- Existing tests did not provide a reusable invariant scanner, canonical state hashes, configurable
  stress JSON/Markdown reports, or latency distributions for all requested projections.
- Baseline simulator coverage from Slice 7 was iPhone 17 Pro and iPad Pro 13-inch portrait. Compact
  iPhone lacked Expo Go and landscape rotation was unavailable, so those targets were not verified.
