import { SimulationEngine, type ScenarioName } from '@/simulation';
import { canonicalStateHash } from '@/simulation/testing/canonicalState';
import { assertSimulationInvariants } from '@/simulation/testing/invariants';

const scenarios: readonly ScenarioName[] = ['stableSavannah', 'drought', 'hardFood'];

describe('simulation integrity', () => {
  it.each(scenarios)('maintains engine contracts in %s', (scenario) => {
    for (const seed of ['INVARIANT-A', 'INVARIANT-B']) {
      const engine = new SimulationEngine({ seed: `${seed}-${scenario}`, scenario });
      let previous = engine.exportCheckpoint();
      assertSimulationInvariants(previous);
      for (let generation = 1; generation <= 12; generation += 1) {
        engine.runUntilGeneration(generation);
        const checkpoint = engine.exportCheckpoint();
        assertSimulationInvariants(checkpoint, previous);
        previous = checkpoint;
        if (engine.getSnapshot().populationSize === 0) break;
      }
    }
  });

  it.each(scenarios)('matches direct, batched, and restored execution in %s', (scenario) => {
    const config = { seed: `INTEGRITY-${scenario}`, scenario };
    const direct = new SimulationEngine(config);
    const batched = new SimulationEngine(config);
    const command = { type: 'predatorPressure' as const, value: 1.2, durationTicks: 45 };
    direct.scheduleEnvironmentInterventions([command]);
    batched.scheduleEnvironmentInterventions([command]);
    for (let tick = 0; tick < 160; tick += 1) direct.step();
    batched.runTicks(37);
    const checkpoint = batched.exportCheckpoint();
    batched.runTicks(123);
    const restored = SimulationEngine.restoreCheckpoint(checkpoint);
    restored.runTicks(123);
    expect(batched.exportCheckpoint()).toEqual(direct.exportCheckpoint());
    expect(restored.exportCheckpoint()).toEqual(direct.exportCheckpoint());
  });

  it('protects complete-state regression hashes at selected ticks', () => {
    const expected: Record<ScenarioName, readonly string[]> = {
      // Slice 10B baseline: complete state now additionally includes causal observation,
      // imitation attempts, practice evidence, and bounded cultural-history counters.
      stableSavannah: ['1fa19eed94252623', '98c2d0b96f917019', 'cf3e1c68e881f76e'],
      drought: ['f30262517dbaa9a1', 'c6de71e7c3cc9a63', '4989460f178d2215'],
      hardFood: ['0b6a2ce422424026', '7c07dfdf7f6729b7', 'fc070af58c4031cb'],
    };
    for (const scenario of scenarios) {
      const engine = new SimulationEngine({ seed: `REGRESSION-${scenario}`, scenario });
      engine.scheduleEnvironmentInterventions([
        { type: 'foodAvailability', value: 0.85, durationTicks: 17 },
      ]);
      const hashes: string[] = [];
      for (const tick of [40, 120, 240]) {
        engine.runTicks(tick - engine.getSnapshot().tick);
        hashes.push(canonicalStateHash(engine.exportCheckpoint()));
      }
      expect(hashes).toEqual(expected[scenario]);
    }
  });

  it('reports the exact invariant path for corrupt finite-state data', () => {
    const checkpoint = new SimulationEngine({ seed: 'INVALID-INVARIANT' }).exportCheckpoint();
    checkpoint.state.population[0]!.needs.energy = Number.NaN;
    expect(() => assertSimulationInvariants(checkpoint)).toThrow(
      '$.state.population[0].needs.energy contains a non-finite number',
    );
  });
});
