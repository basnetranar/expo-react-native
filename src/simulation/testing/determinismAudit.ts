import { SimulationEngine, type ScenarioName } from '@/simulation';
import { canonicalStateHash } from '@/simulation/testing/canonicalState';
import {
  argument,
  integerArgument,
  markdownTable,
  writeQualityReport,
} from '@/simulation/testing/qualityCli';

const scenarios: readonly ScenarioName[] = ['stableSavannah', 'drought', 'hardFood'];

function audit(scenario: ScenarioName, seed: string, ticks: number) {
  const config = { seed, scenario };
  const direct = new SimulationEngine(config);
  const batched = new SimulationEngine(config);
  const commands = [
    { type: 'foodAvailability' as const, value: 0.8, durationTicks: 31 },
    { type: 'predatorPressure' as const, value: 1.25, durationTicks: 47 },
  ];
  direct.scheduleEnvironmentInterventions(commands);
  batched.scheduleEnvironmentInterventions(commands);
  for (let tick = 0; tick < ticks; tick += 1) direct.step();
  const chunks = [1, 7, 19, 3, 41, 2, 23];
  let completed = 0;
  let chunk = 0;
  while (completed < ticks) {
    const count = Math.min(chunks[chunk++ % chunks.length]!, ticks - completed);
    batched.runTicks(count);
    completed += count;
  }
  const directHash = canonicalStateHash(direct.exportCheckpoint());
  const batchedHash = canonicalStateHash(batched.exportCheckpoint());

  const fork = new SimulationEngine(config);
  fork.scheduleEnvironmentInterventions(commands);
  const checkpointTick = Math.floor(ticks * 0.43);
  fork.runTicks(checkpointTick);
  const checkpoint = fork.exportCheckpoint();
  fork.runTicks(ticks - checkpointTick);
  const restored = SimulationEngine.restoreCheckpoint(checkpoint);
  restored.runTicks(ticks - checkpointTick);
  const restoredHash = canonicalStateHash(restored.exportCheckpoint());
  return {
    scenario,
    seed,
    ticks,
    directHash,
    batchedHash,
    restoredHash,
    directMatchesBatched: directHash === batchedHash,
    checkpointMatchesDirect: directHash === restoredHash,
  };
}

const requested = argument('scenario', 'all');
if (requested !== 'all' && !scenarios.includes(requested as ScenarioName))
  throw new Error(`Unknown scenario: ${requested}`);
const selected = requested === 'all' ? scenarios : [requested as ScenarioName];
const seeds = integerArgument('seeds', 3);
const ticks = integerArgument('ticks', 600);
const results = selected.flatMap((scenario) =>
  Array.from({ length: seeds }, (_, index) =>
    audit(scenario, `DETERMINISM-${scenario}-${index + 1}`, ticks),
  ),
);
const passed = results.every((item) => item.directMatchesBatched && item.checkpointMatchesDirect);
const report = { createdAt: new Date().toISOString(), passed, results };
const table = markdownTable(
  ['Scenario', 'Seed', 'Direct', 'Batched', 'Restored', 'Pass'],
  results.map((item) => [
    item.scenario,
    item.seed,
    item.directHash,
    item.batchedHash,
    item.restoredHash,
    item.directMatchesBatched && item.checkpointMatchesDirect,
  ]),
);
writeQualityReport(
  'determinism',
  report,
  `# Determinism audit\n\nResult: **${passed ? 'PASS' : 'FAIL'}**\n\n${table}`,
);
if (!passed) process.exitCode = 1;
