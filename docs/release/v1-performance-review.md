# First Minds V1 Performance Review

Audit date: 2026-10-11

## Conclusion

Default V1 worlds are within a defensible performance envelope. World creation clamps initial population to 8–60, and the measured 50-agent engine p95 is 2.140 ms/tick. The product must not promise sustained 50× for large populations: scheduler throughput fell to 3.65× at 150 agents and 1× at 500 in the headless benchmark, with growing backlog. This is a limit outside the default setting, not a V1 blocker.

## Integrated benchmark

Command:

```text
yarn sim:benchmark --samples 100 --populations 50,150,500 --scenario stableSavannah --output simulation-output/v1-audit/performance
```

| Agents | Mean ms | p50 ms | p95 ms | Max ms | Peak heap bytes | Requested 50× achieved | Backlog |
| -----: | ------: | -----: | -----: | -----: | --------------: | ---------------------: | ------: |
|     50 |   1.532 |  1.459 |  2.140 |  3.777 |      23,241,368 | 50× (5 ticks/callback) |       0 |
|    150 |   4.772 |  4.736 |  5.668 |  7.521 |      60,214,688 |                  3.65× |      27 |
|    500 |  38.494 | 37.683 | 46.575 | 55.240 |     149,335,344 |                     1× |      80 |

Snapshot/publish p95 remained below approximately 0.4 ms. The main growth is engine tick cost rather than presentation snapshot publication.

Compared with the supplied baseline (p95 2.109/5.794/40.965 ms), 50 and 150 are broadly stable; 500 regressed to 46.575 ms in this host run. Host load and small sample size can affect the difference, so it should be tracked rather than treated as a device regression without release-binary profiling.

## Additional 120-tick engine microbenchmark

This direct engine measurement is separate from the integrated scheduler benchmark.

| Agents | Mean ms | p50 ms | p95 ms | p99 ms | Max ms | Ticks/sec | Heap delta bytes |
| -----: | ------: | -----: | -----: | -----: | -----: | --------: | ---------------: |
|     50 |   1.132 |  1.064 |  1.535 |  2.767 |  3.122 |     883.5 |       +4,986,960 |
|    150 |   5.188 |  4.906 |  6.969 |  8.931 |  9.375 |     192.7 |      +26,658,016 |
|    500 |  42.675 | 42.803 | 44.361 | 54.744 | 56.781 |      23.4 |      +20,975,440 |

Heap deltas are GC-sensitive end-minus-start observations, not evidence of a leak. A leak conclusion requires a longer, garbage-collection-aware device profile.

## Scheduling and UI behavior

- The scheduler uses a per-callback work budget and reports backlog instead of silently changing engine outcomes.
- Pause/resume and speed changes operate on the same engine instance and are covered by controller tests.
- UI receives bounded presentation snapshots rather than mutable entities; snapshot cost was small in the benchmark.
- Actual Android/iOS route navigation remained responsive during the manual checks, but device ticks/sec, frame rate, thermal behavior, and 10×/50× input latency were not instrumented.

## Practical V1 guidance

- Keep the current 8–60 initial population range.
- Treat 50 agents as the validated high-speed headless target.
- Treat approximately 150 agents as usable only at modest playback speed until device evidence says otherwise.
- Avoid a product claim for 500-agent real-time/high-speed use.
- Display/retain honest backlog or achieved-speed diagnostics in development; do not make simulation results depend on render timing.
- Profile 1×, 10×, and 50× on signed mid-range Android and supported iPhone hardware before release. A lower achieved rate must remain deterministic and should not block interaction.

## Non-blocking investigation areas

The 500-agent curve suggests per-agent interaction/search work dominates. If post-release worlds commonly grow beyond the default envelope, profile social-neighbor lookup, learning opportunity scans, and allocation churn before optimizing. Do not alter mechanics or balance speculatively for V1.
