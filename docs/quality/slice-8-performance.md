# Slice 8 Performance and Memory

Measured on 2026-10-10 using Node.js 26.5.0 on an Apple M5 Pro (15 cores, 24 GB,
arm64). These are development-runtime measurements, not estimates and not release-device frame
profiles. Each engine row used 20 warm-up ticks and 200 measured ticks. Checkpoint and branch
figures use 20 and 10 samples respectively.

## Post-change benchmark

The fixture raises only its own population maximum to the requested population. It does not change
the production population cap or balancing.

| Population | Tick mean / median / p95 / max       | Snapshot p95 | Publish p95 |  Checkpoint | Serialize p95 | Restore p95 | Switch p95 | Peak Node heap |
| ---------: | ------------------------------------ | -----------: | ----------: | ----------: | ------------: | ----------: | ---------: | -------------: |
|         50 | 1.363 / 1.323 / 1.917 / 2.824 ms     |     0.025 ms |    0.291 ms |   527,979 B |      2.408 ms |    2.406 ms |   4.645 ms |   22,785,032 B |
|        150 | 3.608 / 3.587 / 4.040 / 4.929 ms     |     0.034 ms |    0.214 ms | 1,070,371 B |      4.475 ms |    4.606 ms |   6.250 ms |   60,424,208 B |
|        500 | 40.728 / 41.378 / 46.457 / 48.867 ms |     0.174 ms |    0.407 ms | 2,994,889 B |     14.247 ms |   14.049 ms |  13.205 ms |  137,640,208 B |

Terrain, world, population, timeline, and lineage snapshot/projection timings are retained in
`simulation-output/slice-8/performance.json`. React Native commits, image decoding, and device
filesystem latency are outside this Node harness.

## Playback scheduling change

The previous 50× timer callback always ran five ticks synchronously. The controller now accumulates
all requested ticks but yields after a 12 ms work budget; it never skips or reorders a tick. One
engine tick remains atomic, so a single slow tick can exceed the budget.

Twenty callbacks were measured with the prior and bounded policies from identical seeded states:

| Population | Prior callback p95 | Bounded callback p95 | Requested / achieved ticks per callback | Backlog after 20 | Canonical state at achieved tick |
| ---------: | -----------------: | -------------------: | --------------------------------------: | ---------------: | -------------------------------- |
|         50 |           4.603 ms |             4.502 ms |                                   5 / 5 |                0 | identical to direct execution    |
|        150 |          13.060 ms |            13.232 ms |                                   5 / 5 |                0 | identical to direct execution    |
|        500 |         162.401 ms |            34.538 ms |                                   5 / 1 |               80 | identical to direct execution    |

At 500 agents the measured engine cannot sustain requested 50× playback. The new scheduler keeps
callbacks substantially shorter and retains backlog rather than falsely dropping ticks. At the
production cap of 150 it sustained the requested callback work in this Node measurement.

The baseline microbenchmark used a different maximum-population setup: its 50- and 150-agent
fixtures grew to 85 and 259 living agents. Those tick numbers are therefore preserved in the
baseline document but are not presented as an apples-to-apples optimization delta. No engine
mechanics were optimized or changed in Slice 8.

## Long-run memory and retention

The 54-run stress matrix sampled Node `heapUsed` once per generation. Highest samples were
187,443,640 B (Stable Savannah), 190,732,144 B (Drought), and 178,382,528 B (Hard Food). This is
process heap with garbage-collection timing, not retained heap or mobile resident memory, so it can
identify gross growth but cannot prove absence of a leak.

- Generation summaries: explicitly capped at 200.
- Simulation events: explicitly capped at 1,000.
- Debug traces: explicitly capped at 500.
- Agent memories: naturally bounded by memory-potential capacity (maximum 13).
- Relationships: explicitly capped at 24 per agent.
- Learned behaviours: naturally bounded by the finite behaviour type set.
- Terminal interventions: explicitly capped; active and scheduled commands are retained.
- Deceased inspector snapshots: retained by design and potentially unbounded.
- Compact lineage records: retained by design and potentially unbounded.
- Branch/checkpoint metadata: user-driven and potentially unbounded in count; payload storage is
  limited to 50 MiB.
- UI subscriptions/timers: explicitly disposed by the session controller and route hooks; duplicate
  playback loops are prevented.

Future scale work should disk-back or lazy-load deceased/lineage history without silently pruning
user-visible ancestry. Mobile release profiling remains required for rendering, image memory,
garbage collection, and responsive 50× interaction.

## Reproduction

```sh
yarn sim:benchmark --samples 200 --populations 50,150,500 --scenario stableSavannah
yarn sim:stress --generations 100,500,1000 --seeds-100 10 --seeds-500 5 --seeds-1000 3
```
