import { EventDetector } from '@/simulation/analytics/eventDetector';
import { SimulationEngine } from '@/simulation/engine/SimulationEngine';
import { SeededRng } from '@/simulation/engine/seededRng';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import { drought } from '@/simulation/scenarios/drought';
import { hardFood } from '@/simulation/scenarios/hardFood';
import { createWorld } from '@/simulation/world/createWorld';

describe('SimulationEngine integration', () => {
  it('produces exactly identical results for the same seed', () => {
    const first = new SimulationEngine({
      seed: 'SAME',
      population: { ...createSimulationConfig().population, initial: 20 },
      world: { ...createSimulationConfig().world, predatorCount: 1 },
    });
    const second = new SimulationEngine({
      seed: 'SAME',
      population: { ...createSimulationConfig().population, initial: 20 },
      world: { ...createSimulationConfig().world, predatorCount: 1 },
    });
    first.runUntilGeneration(8);
    second.runUntilGeneration(8);
    expect(first.getSnapshot()).toEqual(second.getSnapshot());
    expect(first.getGenerationSummaries()).toEqual(second.getGenerationSummaries());
    expect(first.getEvents()).toEqual(second.getEvents());
  });

  it('allows different seeds to diverge', () => {
    const first = new SimulationEngine({ seed: 'FIRST' });
    const second = new SimulationEngine({ seed: 'SECOND' });
    first.runTicks(5);
    second.runTicks(5);
    expect(first.getSnapshot()).not.toEqual(second.getSnapshot());
  });

  it('applies drought to environment settings only', () => {
    const config = createSimulationConfig({
      scenarioSettings: { ...createSimulationConfig().scenarioSettings, droughtStart: 1 },
    });
    const world = createWorld(config, new SeededRng('drought-world'));
    const before = world.tiles.map((tile) => tile.water);
    const events = drought.update(world, 1, 40, config);
    expect(world.activeWaterSources).toBe(config.scenarioSettings.droughtWaterSources);
    expect(world.foodRegenerationMultiplier).toBe(config.scenarioSettings.droughtFoodMultiplier);
    expect(world.tiles.map((tile) => tile.water)).not.toEqual(before);
    expect(events[0]).toMatchObject({ type: 'scenarioPhase', phase: 'droughtStarted' });
  });

  it('does not grant tool use when hard food is configured', () => {
    const config = createSimulationConfig({ scenario: 'hardFood' });
    const world = createWorld(config, new SeededRng('hard-food'));
    hardFood.configureWorld(world, config);
    const engine = new SimulationEngine({ seed: 'hard-food', scenario: 'hardFood' });
    expect(engine.getPopulation().every((agent) => agent.learnedBehaviours.length === 0)).toBe(
      true,
    );
    expect(world.tiles.some((tile) => tile.hardFood > tile.food)).toBe(true);
  });

  it('can produce extinction and a structured extinction event', () => {
    const base = createSimulationConfig();
    const engine = new SimulationEngine({
      seed: 'EXTINCTION',
      population: { ...base.population, initial: 8, maximum: 8 },
      world: { ...base.world, foodPatches: 0, waterSources: 0, predatorCount: 5 },
      needs: { ...base.needs, energyDepletion: 1.5, hydrationDepletion: 2.4, healthLossAtZero: 15 },
    });
    engine.runUntilGeneration(20);
    expect(engine.getSnapshot().populationSize).toBe(0);
    expect(engine.getEvents()).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'extinction' })]),
    );
  });

  it('returns stable structured generation summaries and defensive snapshots', () => {
    const engine = new SimulationEngine({ seed: 'SUMMARY' });
    engine.runUntilGeneration(2);
    const summaries = engine.getGenerationSummaries();
    expect(summaries).toHaveLength(2);
    expect(summaries[0]).toMatchObject({
      generation: 1,
      deathCauses: expect.any(Object),
      averageGenome: expect.any(Object),
      averagePhenotype: expect.any(Object),
      behaviourPrevalence: expect.any(Object),
      environment: expect.any(Object),
      resources: expect.any(Object),
      reproduction: expect.any(Object),
      migration: expect.any(Object),
    });
    expect(Object.values(summaries[0]!.lifeStages).reduce((sum, value) => sum + value, 0)).toBe(
      summaries[0]!.population,
    );
    const snapshot = engine.getSnapshot();
    snapshot.aliveAgents.length = 0;
    expect(engine.getSnapshot().populationSize).toBeGreaterThanOrEqual(0);
    expect(engine.getSnapshot().aliveAgents.length).toBe(engine.getSnapshot().populationSize);
  });

  it('keeps a known Stable Savannah seed alive without asserting an exact population', () => {
    const engine = new SimulationEngine({ seed: 'TEST-001' });
    engine.runUntilGeneration(100);
    expect(engine.getSnapshot().populationSize).toBeGreaterThan(0);
  });

  it('detects a synthetic persistent regional shift without global scarcity', () => {
    const engine = new SimulationEngine({ seed: 'MIGRATION-FIXTURE' });
    engine.runUntilGeneration(1);
    const population = engine.getPopulation();
    const base = engine.getGenerationSummaries()[0]!;
    const shifted = {
      ...base,
      population: Math.max(10, base.population),
      migration: {
        ...base.migration,
        centroidShift: 4,
        meanDisplacement: 7,
        changedRegionProportion: 0.6,
      },
    };
    const detector = new EventDetector();
    const config = createSimulationConfig({
      analytics: { ...createSimulationConfig().analytics, migrationPersistence: 2 },
    });
    expect(detector.detect(shifted, [shifted], population, 40, config)).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'migrationDetected' })]),
    );
    expect(detector.detect(shifted, [shifted, shifted], population, 80, config)).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'migrationDetected' })]),
    );
  });

  it('records an optional bounded, defensive agent debug trace', () => {
    const engine = new SimulationEngine({
      seed: 'TRACE',
      debug: { agentId: 'g0-0', maxEntries: 2 },
    });
    engine.runTicks(4);
    const trace = engine.getDebugTrace();
    expect(trace).toHaveLength(2);
    expect(trace[0]).toMatchObject({ agentId: 'g0-0', scores: expect.any(Object) });
    trace[0]!.recalledMemoryIds.length = 0;
    expect(engine.getDebugTrace()[0]!.recalledMemoryIds).not.toBe(trace[0]!.recalledMemoryIds);
  });
});
