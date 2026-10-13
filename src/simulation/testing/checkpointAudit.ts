import {
  defaultSimulationConfig,
  SimulationEngine,
  type EngineCheckpointV1,
  type ScenarioName,
} from '@/simulation';
import { canonicalStateHash } from '@/simulation/testing/canonicalState';
import { assertSimulationInvariants } from '@/simulation/testing/invariants';
import {
  argument,
  integerArgument,
  markdownTable,
  writeQualityReport,
} from '@/simulation/testing/qualityCli';

const scenarios: readonly ScenarioName[] = ['stableSavannah', 'drought', 'hardFood'];

function replay(checkpoint: EngineCheckpointV1, ticks: number) {
  const first = SimulationEngine.restoreCheckpoint(checkpoint);
  const second = SimulationEngine.restoreCheckpoint(checkpoint);
  first.runTicks(ticks);
  second.runTicks(ticks);
  assertSimulationInvariants(first.exportCheckpoint(), checkpoint);
  return (
    canonicalStateHash(first.exportCheckpoint()) === canonicalStateHash(second.exportCheckpoint())
  );
}

function auditScenario(scenario: ScenarioName, seed: string, maxTicks: number) {
  const engine = new SimulationEngine({ seed, scenario });
  engine.scheduleEnvironmentInterventions([
    { type: 'drought', value: 1, durationTicks: 25 },
    { type: 'foodAvailability', value: 1.3, durationTicks: 40 },
  ]);
  const boundaries = new Map<string, { tick: number; before: boolean; after: boolean }>();
  let previous = engine.exportCheckpoint();
  let previousLineage = previous.state.lineage.records.length;
  let previousDeaths = previous.state.deceasedAgentSnapshots.length;
  const seenEvents = new Set<string>();
  for (let tick = 1; tick <= maxTicks && engine.getSnapshot().populationSize; tick += 1) {
    engine.step();
    const current = engine.exportCheckpoint();
    const labels: string[] = [];
    if (current.state.lineage.records.length > previousLineage) labels.push('birth');
    if (current.state.deceasedAgentSnapshots.length > previousDeaths) labels.push('death');
    for (const event of engine.getEvents()) {
      if (seenEvents.has(event.id)) continue;
      seenEvents.add(event.id);
      if (event.type === 'firstDiscovery') labels.push('discovery');
      if (event.type === 'traditionLost') labels.push('cultural-loss');
      if (event.type === 'scenarioPhase' && event.phase === 'droughtStarted')
        labels.push('scenario-drought-start');
      if (event.type === 'environmentIntervention' && event.status === 'active')
        labels.push('intervention-start');
      if (event.type === 'environmentIntervention' && event.status === 'completed')
        labels.push('intervention-expiration');
      if (event.type === 'extinction') labels.push('extinction');
    }
    for (const label of new Set(labels))
      if (!boundaries.has(label))
        boundaries.set(label, {
          tick,
          before: replay(previous, 20),
          after: replay(current, 20),
        });
    previous = current;
    previousLineage = current.state.lineage.records.length;
    previousDeaths = current.state.deceasedAgentSnapshots.length;
  }
  return {
    scenario,
    seed,
    maxTicks,
    finalGeneration: engine.getSnapshot().generation,
    finalPopulation: engine.getSnapshot().populationSize,
    boundaries: Object.fromEntries(boundaries),
  };
}

function auditControlledBoundaries() {
  const cultureSource = new SimulationEngine({
    seed: 'CHECKPOINT-controlled-cultural-loss',
    time: { ticksPerGeneration: 1 },
  });
  const beforeCultureLoss = cultureSource.exportCheckpoint();
  beforeCultureLoss.state.eventDetector.cultureStages.stoneCracking = 'innovation';
  const cultureEngine = SimulationEngine.restoreCheckpoint(beforeCultureLoss);
  cultureEngine.step();
  const afterCultureLoss = cultureEngine.exportCheckpoint();
  const culturalLossObserved = cultureEngine
    .getEvents()
    .some((event) => event.type === 'traditionLost' && event.behaviour === 'stoneCracking');

  const extinctionEngine = new SimulationEngine({
    seed: 'CHECKPOINT-controlled-extinction',
    population: { ...defaultSimulationConfig.population, initial: 8, maximum: 8 },
    world: {
      ...defaultSimulationConfig.world,
      foodPatches: 0,
      waterSources: 0,
      predatorCount: 16,
    },
    needs: {
      ...defaultSimulationConfig.needs,
      energyDepletion: 20,
      hydrationDepletion: 20,
      zeroNeedGraceTicks: 0,
      healthLossAtZero: 100,
    },
  });
  let beforeExtinction = extinctionEngine.exportCheckpoint();
  while (extinctionEngine.getSnapshot().populationSize > 0) {
    beforeExtinction = extinctionEngine.exportCheckpoint();
    extinctionEngine.step();
  }
  const afterExtinction = extinctionEngine.exportCheckpoint();
  return {
    'cultural-loss': {
      observed: culturalLossObserved,
      tick: afterCultureLoss.tick,
      before: replay(beforeCultureLoss, 20),
      after: replay(afterCultureLoss, 20),
    },
    extinction: {
      observed: extinctionEngine.getEvents().some((event) => event.type === 'extinction'),
      tick: afterExtinction.tick,
      before: replay(beforeExtinction, 20),
      after: replay(afterExtinction, 20),
    },
  };
}

const requested = argument('scenario', 'all');
if (requested !== 'all' && !scenarios.includes(requested as ScenarioName))
  throw new Error(`Unknown scenario: ${requested}`);
const selected = requested === 'all' ? scenarios : [requested as ScenarioName];
const seeds = integerArgument('seeds', 2);
const maxTicks = integerArgument('ticks', 1_000);
const results = selected.flatMap((scenario) =>
  Array.from({ length: seeds }, (_, index) =>
    auditScenario(scenario, `CHECKPOINT-${scenario}-${index + 1}`, maxTicks),
  ),
);
const controlledBoundaries = auditControlledBoundaries();
const failed =
  results.some((result) =>
    Object.values(result.boundaries).some((boundary) => !boundary.before || !boundary.after),
  ) ||
  Object.values(controlledBoundaries).some(
    (boundary) => !boundary.observed || !boundary.before || !boundary.after,
  );
const report = {
  createdAt: new Date().toISOString(),
  passed: !failed,
  results,
  controlledBoundaries,
};
const table = markdownTable(
  ['Scenario', 'Seed', 'Generation', 'Population', 'Observed boundaries'],
  results.map((item) => [
    item.scenario,
    item.seed,
    item.finalGeneration,
    item.finalPopulation,
    Object.keys(item.boundaries).join(', '),
  ]),
);
writeQualityReport(
  'checkpoints',
  report,
  `# Checkpoint boundary audit\n\nResult: **${failed ? 'FAIL' : 'PASS'}**\n\n${table}\n\nControlled boundaries: ${Object.entries(
    controlledBoundaries,
  )
    .map(
      ([name, boundary]) =>
        `${name} at tick ${boundary.tick} (observed ${boundary.observed}, before ${boundary.before}, after ${boundary.after})`,
    )
    .join('; ')}.`,
);
if (failed) process.exitCode = 1;
