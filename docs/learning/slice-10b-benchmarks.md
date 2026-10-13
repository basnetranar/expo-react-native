# Slice 10B benchmarks and balance

## Performance

Measured on 2026-10-11 with Node 26.5.0, the stable-Savannah scenario, 20 warm-up ticks, and 80
measured ticks. These are local development measurements, not mobile frame-time guarantees.

| Requested population | Mean tick (ms) | p95 (ms) | Max (ms) | Peak heap (bytes) | Learning events/tick | Learning snapshot (ms) | 50× achieved ticks/callback | Backlog |
| -------------------: | -------------: | -------: | -------: | ----------------: | -------------------: | ---------------------: | --------------------------: | ------: |
|                   50 |          1.579 |    2.109 |    5.393 |        23,376,584 |                36.81 |                  0.615 |                         5.0 |       0 |
|                  150 |          4.697 |    5.794 |    7.178 |        93,627,432 |               101.32 |                  0.522 |                         3.6 |      28 |
|                  500 |         38.005 |   40.965 |   49.665 |       125,627,624 |               268.41 |                  1.097 |                         1.0 |      80 |

Observation candidates never exceeded the configured cap of six. Checkpoint payloads were 831,227,
1,770,429, and 4,994,591 bytes respectively. The bounded scheduler preserved deterministic state,
but 50× was sustained only at 50 agents; it accumulated backlog at 150 and 500. The full generated
machine-readable and Markdown reports are in `simulation-output/slice-10b/performance/`.

## Balance sample

Eight seeds per scenario ran for 30 generations (24 runs total).

| Scenario        | Survival | Discovery frequency | Mean first generation | Mean final population | Observations | Imitation attempts | Imitation success | Demonstrations | Transmissions | Losses | Mean proficiency |
| --------------- | -------: | ------------------: | --------------------: | --------------------: | -----------: | -----------------: | ----------------: | -------------: | ------------: | -----: | ---------------: |
| Stable Savannah |     100% |                100% |                     0 |                93.375 |            0 |                  0 |                0% |              0 |             0 |      0 |           96.195 |
| Drought         |     100% |                100% |                     0 |                 56.25 |            0 |                  0 |                0% |              0 |             0 |      0 |           94.975 |
| Hard Food       |     100% |                100% |                     0 |                 52.75 |        13.25 |              1.875 |             12.5% |         57.625 |         0.875 |  0.125 |           88.356 |

All 24 runs showed group-level adoption differences. Maximum observed proficiency was 100, the hard
cap. Natural rediscovery did not occur in this sample; deterministic unit tests cover the mechanism.
Stone availability in the initial hard-food environment makes generation-zero discovery common for
these seeds. Social transmission remained rare and did not instantly spread knowledge. Stable and
drought runs mostly exercised social-foraging through existing behaviour, explaining high surviving
practitioner proficiency and little recorded imitation.

The full per-seed distribution is in `simulation-output/slice-10b/learning-balance.json`. The balance
script is reproducible with `yarn sim:learning-balance --seeds 8 --generations 30`.

## Determinism and persistence

The nine-case determinism audit (three scenarios by three seeds) passed direct, batched, 5×, 10×,
50×, and checkpoint-restored comparisons. The checkpoint-boundary audit passed ordinary discovery,
death, cultural loss, and extinction boundaries. Complete-state golden hashes were intentionally
versioned for Slice 10B because causal learning state changes the serialized outcome.

## Interpretation

The learning pass remains bounded by spatial lookup and candidate caps. The high event-throughput
count includes throttled practice evidence across the population; only the most recent 2,000 events
are materialized for UI. At 500 agents, tick cost remains dominated by the wider simulation and does
not support real-time 50× playback on this host. Proficiency saturation for long-lived social
foragers is a future tuning target, not an unbounded-value bug.
