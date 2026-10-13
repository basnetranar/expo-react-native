# Slice 8 Determinism and Checkpoint Integrity

## Canonical comparison

Canonical state comparison recursively sorts object keys and hashes the complete exported engine
checkpoint. That includes configuration, RNG state and cached normal value, tick/generation,
world/resources, predators, agents, genomes, needs, memories, learned behaviours, relationships,
reproduction bookkeeping, culture/event-detector state, interventions and pending commands,
history, deceased archives, lineage, diagnostics, and internal counters. UI presentation does not
consume engine RNG.

Nine 600-tick audits covered all scenarios and three fixed seeds per scenario. Direct single-step,
variable-size batched execution, and checkpoint restoration produced identical hashes in every run:

| Scenario        | Seed                                   | Canonical hash                                               |
| --------------- | -------------------------------------- | ------------------------------------------------------------ |
| Stable Savannah | DETERMINISM-stableSavannah-1 / -2 / -3 | `32cbba08f9fab0a6` / `7612a2a28486170e` / `03a7e35f0c57bbbf` |
| Drought         | DETERMINISM-drought-1 / -2 / -3        | `c1bc4cee980707ac` / `ecec4936fb25e996` / `976026e89aedb1f6` |
| Hard Food       | DETERMINISM-hardFood-1 / -2 / -3       | `f0c628e4b1e16dca` / `7816691d5d0d405f` / `9adf5efc1a06e9cc` |

The regression suite also fixes complete-state hashes at ticks 40, 120, and 240 for each scenario.
A mismatch fails rather than updating expected values automatically. Controller tests establish
equivalent results at 1×, 5×, 10×, and 50×, including interventions, pause/resume, read-only
navigation, and lineage reads.

## Checkpoint boundaries

For each observed boundary, the harness exports immediately before and after, restores two
independent engines, advances both by 20 ticks, checks invariants, and compares complete canonical
state. Two seeds per scenario ran for 1,000 ticks.

Observed natural boundaries were birth, death, discovery, intervention start, intervention
expiration, and the Drought scenario phase. Cultural loss and extinction use controlled valid
fixtures because none occurred at those exact boundaries in the natural 1,000-tick sample. Both
controlled events were emitted, and their before/after replays matched. The cultural fixture changes
only serialized event-detector stage to create the boundary; it does not add a scripted discovery or
alter production mechanics.

Checkpoint validation rejects missing state, incompatible engine versions, unsupported schema
versions, checksum mismatches, malformed JSON, and missing files. Existing exact round-trip tests
cover pending interventions, RNG normal-cache state, deceased snapshots, and lineage.

## Branch isolation

Tests cover independent branches from a shared checkpoint, identical branches with identical
commands, divergent intervention commands, nested branches, restart restoration, serialized
concurrent switches, and deleting a sibling without damaging descendants. Branch switching first
verifies and restores the destination checkpoint; a corrupt destination leaves the current engine
and active branch unchanged.

## Reproduction

```sh
yarn sim:determinism --seeds 3 --ticks 600
yarn sim:checkpoint-test --seeds 2 --ticks 1000
yarn test --runInBand src/simulation/testing/simulation-integrity.test.ts
```

Machine-readable results are in `simulation-output/slice-8/`.
