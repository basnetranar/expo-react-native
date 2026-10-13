import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { SimulationEngine, type ScenarioName } from '@/simulation';

const scenarios: readonly ScenarioName[] = ['stableSavannah', 'drought', 'hardFood'];
const seeds = Number.parseInt(process.argv[process.argv.indexOf('--seeds') + 1] ?? '12', 10);
const generations = Number.parseInt(
  process.argv[process.argv.indexOf('--generations') + 1] ?? '30',
  10,
);

const results = scenarios.map((scenario) => {
  const runs = Array.from({ length: seeds }, (_, index) => {
    const engine = new SimulationEngine({ seed: `LEARNING-${scenario}-${index + 1}`, scenario });
    engine.runUntilGeneration(generations);
    const culture = engine.getCulturalSnapshot();
    const events = culture.events;
    const attempts = events.filter((event) => event.type === 'imitationAttempted');
    const transmissions = events.filter((event) => event.type === 'behaviourTransmitted');
    const proficiencies = culture.behaviours.flatMap((item) =>
      item.practitioners.map(
        (agent) =>
          agent.learnedBehaviours.find((entry) => entry.type === item.behaviour)!.proficiency,
      ),
    );
    return {
      finalPopulation: culture.population,
      extinct: culture.population === 0,
      firstDiscoveryGeneration:
        culture.milestones.find((event) => event.type === 'behaviourDiscovered')?.generation ??
        null,
      discoveries: events.filter((event) => event.type === 'behaviourDiscovered').length,
      rediscoveries: culture.milestones.filter((event) => event.type === 'behaviourRediscovered')
        .length,
      observations: events.filter((event) => event.type === 'behaviourObserved').length,
      imitationAttempts: attempts.length,
      imitationSuccesses: attempts.filter((event) => event.outcome === 'success').length,
      demonstrations: culture.summaries.reduce(
        (sum, summary) =>
          sum +
          summary.behaviours.stoneCracking.demonstrations +
          summary.behaviours.socialForaging.demonstrations,
        0,
      ),
      transmissions: transmissions.length,
      losses: culture.milestones.filter((event) => event.type === 'behaviourLost').length,
      meanProficiency: mean(proficiencies),
      maxProficiency: proficiencies.length ? Math.max(...proficiencies) : 0,
      adoption: Object.fromEntries(
        culture.behaviours.map((item) => [item.behaviour, item.adoption]),
      ),
      groupDifferences: culture.behaviours.reduce(
        (count, item) => count + (new Set(Object.values(item.groups)).size > 1 ? 1 : 0),
        0,
      ),
    };
  });
  const discoveryGenerations = runs
    .map((run) => run.firstDiscoveryGeneration)
    .filter((value): value is number => value !== null);
  return {
    scenario,
    runs: runs.length,
    survivalRate: runs.filter((run) => !run.extinct).length / runs.length,
    discoveryFrequency: discoveryGenerations.length / runs.length,
    meanFirstDiscoveryGeneration: mean(discoveryGenerations),
    meanFinalPopulation: mean(runs.map((run) => run.finalPopulation)),
    meanObservations: mean(runs.map((run) => run.observations)),
    meanImitationAttempts: mean(runs.map((run) => run.imitationAttempts)),
    meanImitationSuccessRate: mean(
      runs.map((run) => run.imitationSuccesses / Math.max(1, run.imitationAttempts)),
    ),
    meanDemonstrations: mean(runs.map((run) => run.demonstrations)),
    meanTransmissions: mean(runs.map((run) => run.transmissions)),
    meanLosses: mean(runs.map((run) => run.losses)),
    meanRediscoveries: mean(runs.map((run) => run.rediscoveries)),
    meanProficiency: mean(runs.map((run) => run.meanProficiency)),
    maximumObservedProficiency: Math.max(...runs.map((run) => run.maxProficiency)),
    runsWithGroupDifferences: runs.filter((run) => run.groupDifferences > 0).length,
    samples: runs,
  };
});

const directory = resolve('simulation-output/slice-10b');
mkdirSync(directory, { recursive: true });
writeFileSync(
  resolve(directory, 'learning-balance.json'),
  `${JSON.stringify({ seeds, generations, results }, null, 2)}\n`,
);
console.log(
  JSON.stringify(
    results.map(({ samples: _samples, ...summary }) => summary),
    null,
    2,
  ),
);

function mean(values: readonly number[]): number {
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length)).toFixed(3),
  );
}
