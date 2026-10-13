# First Minds simulation engine

This directory contains the deterministic, headless V1 simulation. It has no React, React Native, Expo, Zustand, storage, or rendering dependencies. The engine owns mutable state and exposes defensive snapshots, structured events, and lightweight generation summaries.

## Design boundaries

- A seed and configuration fully determine a run; `Math.random()` is never used.
- Genome values remain fixed during an individual's lifetime.
- Phenotypes are derived from genome, age, development, and health.
- Learning changes action preferences and learned-behaviour proficiency, never genes.
- Scenarios change resources and environmental pressure, never trait values or fitness.
- Culture and migration are classifications derived from population behaviour.
- Local perception, bounded memories/relationships, and a spatial index avoid global knowledge and full social matrices.

## Tick lifecycle

Each tick applies the active scenario, builds the local agent index, perceives and scores actions, executes one action per living hominin, applies learning and imitation, advances predators, regenerates resources, evaluates relocation and reproduction, and completes a generation when its configured tick count is reached. Generation completion applies aging, records deaths and population statistics, and detects timeline events.

## Balancing philosophy and targets

Balance is evaluated statistically across seeds, never scripted per run. Scenarios may change resources, accessibility, and threats; they may not directly change genomes, trait fitness, learned behaviour, or population counts. Current directional 100-generation targets are approximately 85–95% survival for Stable Savannah, 55–80% for drought, and 60–85% for hard food. These are diagnostic ranges rather than guaranteed outcomes.

The principal V1 carrying-capacity loop remains emergent: population growth increases consumption and travel competition, condition-dependent reproduction falls, and mortality rises. There is no fixed carrying-capacity constant or emergency population injection.

## Generation diagnostics

Each `GenerationSummary` includes:

- juvenile, young-adult, adult, and old counts;
- juvenile/adult deaths, average age at death, and cause-specific mortality;
- reproductive-age and condition-ready populations, local pair counts, attempts, failure causes, parent age, and offspring rate;
- per-capita food/water, depleted resource locations, bounded nearest-resource distances, production, consumption, and flow balance;
- eligible tool opportunities, discoveries, successful uses, tool calories, and current users;
- population centroid, centroid shift, mean displacement, regional occupancy, and changed-region proportion.

Migration requires a persistent, coherent regional shift: meaningful displacement, region changes, and centroid movement must coincide. It no longer depends on whole-world scarcity, so relocation away from a locally depleted area can be classified without claiming the entire map is depleted.

## Public API

`SimulationEngine` provides:

- `step()`
- `runTicks(count)`
- `runUntilGeneration(generation)`
- `getSnapshot()`
- `getGenerationSummaries()`
- `getEvolutionHistorySnapshot()`
- `getEvents()`
- `getPopulation()`
- `getDebugTrace()`

All getters return copies rather than mutable engine internals.

## Evolution history retention

`EvolutionHistoryRecorder` stores only cloned completed-generation aggregates and structured
simulation events. It never retains population entities, world tiles, or RNG state, and reading it
does not advance the simulation. By default it retains the newest 200 generation summaries and
1,000 events. When a limit is exceeded, the oldest records are discarded first and cumulative
discard counts are exposed in the history snapshot. Tests may override both limits through
`analytics.historyGenerationLimit` and `analytics.historyEventLimit`.

## Scenarios

- `stableSavannah`: baseline food, water, and predator pressure.
- `drought`: reduces water sources and food regeneration for a configurable interval.
- `hardFood`: converts most soft food to inaccessible hard food while making stones common. Only individuals that discover or imitate stone cracking can consume it.

Scenarios implement the small interface in `scenarios/types.ts`. Add a module that configures/updates the world, add its name to `ScenarioName`, and register it in `scenarios/index.ts`. Scenario code must not access or modify genomes.

## Extending behaviour

Add the behaviour name to `behaviourTypes`, implement its focused action under `behaviour/actions`, add its centralized utility formula to `scoreBehaviours`, and dispatch it from `BehaviourEngine`. Actions return a position, outcome, need gains, and demonstrable success so learning and social observation remain generic.

## Configuration and debugging

Tune defaults in `engine/simulationConfig.ts`; tests can pass nested overrides to the constructor. To trace one agent without logging during normal runs, enable the bounded in-memory trace:

```ts
const engine = new SimulationEngine({
  seed: 'TRACE-001',
  debug: { agentId: 'g0-0', maxEntries: 500 },
});

engine.runTicks(100);
const trace = engine.getDebugTrace();
```

Trace entries include needs, visible context, recalled memories, scored actions, the selected action, and its outcome.

## Development harness

```sh
yarn sim:run --scenario stableSavannah --seed TEST-001 --generations 100
yarn sim:run --scenario drought --seed TEST-001 --generations 100
yarn sim:run --scenario hardFood --seed TEST-001 --generations 100
yarn sim:compare --seeds 10 --generations 100
yarn sim:compare --scenario stableSavannah --seeds 100 --generations 100
yarn sim:compare --scenario drought --seeds 100 --generations 100
yarn sim:compare --scenario hardFood --seeds 100 --generations 100
yarn sim:compare --merge
```

`sim:run` prints the largest observed collapse with its cohort, mortality, reproduction, distance-to-resource, and resource-flow evidence. `sim:compare` writes distributional aggregate JSON to the ignored `simulation-output/` directory. Single-scenario runs can be executed in parallel and merged afterward.

## V1 limitations

The model intentionally omits language, teaching, warfare, disease, speciation, weather, civilization, and a technology tree. Pairing uses local proximity/home-region logic without sex or courtship. Juvenile support is limited to lower metabolism and spatially local adult/kin following; there is no free food, childcare, or knowledge inheritance. Predator and terrain behavior remains deliberately compact. Statistical targets are sensitive to reproduction and resource-travel parameters, so reaching a target range is evidence for another review—not proof that the engine is balanced.
