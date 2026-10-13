# Slice 10A benchmarks

Measured on 2026-10-11 with Node 26.5.0 on arm64. The harness used 20 warm-up ticks and 50 measured
ticks per population. These are engine measurements, not React Native render or image-decode
profiles. Raw results are in `simulation-output/slice-10a/`.

| Agents | Mean tick |  p95 tick |  Max tick | Peak Node heap | Relationships | Groups | Social snapshot | 50× achieved ticks/callback |
| -----: | --------: | --------: | --------: | -------------: | ------------: | -----: | --------------: | --------------------------: |
|     50 |  1.548 ms |  2.102 ms |  3.505 ms |   22,626,440 B |           437 |      8 |        0.543 ms |                        5.00 |
|    150 |  4.032 ms |  4.541 ms |  6.250 ms |   63,192,160 B |         1,686 |      7 |        0.630 ms |                        3.85 |
|    500 | 37.486 ms | 39.648 ms | 49.486 ms |   63,792,344 B |         5,835 |     16 |        3.068 ms |                        1.00 |

The Slice 8 comparable p95 tick figures were 1.917, 4.040, and 46.457 ms from a 200-sample run.
The 50-sample Slice 10A figures add about 10% and 12% at 50 and 150 agents; the measured 500-agent
figure was lower, but the different sample count means this is not claimed as an optimization. The
local-candidate cap removed an early 500-agent p95 of 134 ms. At 150 and 500 agents the 12 ms
scheduler retained backlog; sustained 50× is not claimed. Canonical state at the achieved tick
remained identical to direct execution.

## Balance sample

Two deterministic seeds per Stable Savannah, Drought, and Hard Food ran for 20 generations (six
runs, initial population 50). All completed without extinction. Final populations ranged 28–112;
active groups 5–16; active relationships 196–929. Formation counts were 13–20 and dissolution
counts 4–9. Mean completed-group lifetime ranged 178.4–541.43 ticks.

Cooperative-foraging events ranged 127–487, sharing 4–23, and grooming 14–347 across 800 ticks.
Current positive ties ranged 37–305 and negative ties 13–41. The presence of both signs and varying
group turnover shows that outcomes are not forced uniformly. Grooming occurs in safe periods but
is blocked by the explicit need thresholds; sharing is substantially rarer because it requires
previously harvested inventory and a need asymmetry.

Limitations: Node heap is sampled `heapUsed`, the run matrix is a balancing pass rather than a
statistical proof, per-generation social trend summaries are not yet retained, and release-device
phone/tablet render performance still needs device profiling.
