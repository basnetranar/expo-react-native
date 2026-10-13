import type { DeathCause, ScenarioName, SimulationEvent } from '@/simulation';
import { defaultSimulationConfig, SimulationEngine } from '@/simulation';
import { assertSimulationInvariants } from '@/simulation/testing/invariants';
import {
  argument,
  integerArgument,
  listArgument,
  markdownTable,
  writeQualityReport,
} from '@/simulation/testing/qualityCli';

const allScenarios: readonly ScenarioName[] = ['stableSavannah', 'drought', 'hardFood'];
const causes: readonly DeathCause[] = ['starvation', 'dehydration', 'predation', 'age'];

interface StressRun {
  scenario: ScenarioName;
  seed: string;
  targetGenerations: number;
  reachedGeneration: number;
  completed: boolean;
  extinct: boolean;
  extinctionGeneration: number | null;
  finalPopulation: number;
  peakPopulation: number;
  births: number;
  deaths: number;
  deathCauses: Record<DeathCause, number>;
  finalResources: { food: number; hardFood: number; water: number; resourcePressure: number };
  bottlenecks: number;
  discoveries: number;
  culturalAdoptions: number;
  culturalLosses: number;
  migrations: number;
  socialGroups: number;
  socialRelationships: number;
  cooperativeForaging: number;
  foodSharing: number;
  grooming: number;
  groupFormations: number;
  groupDissolutions: number;
  averageGroupLifetimeTicks: number;
  positiveRelationships: number;
  negativeRelationships: number;
  runtimeMs: number;
  peakHeapBytes: number;
  error: string | null;
}

function runStress(
  scenario: ScenarioName,
  seed: string,
  targetGenerations: number,
  initialPopulation: number,
): StressRun {
  const started = performance.now();
  let peakHeapBytes = process.memoryUsage().heapUsed;
  try {
    const engine = new SimulationEngine({
      seed,
      scenario,
      population: {
        ...defaultSimulationConfig.population,
        initial: initialPopulation,
        maximum: Math.max(150, initialPopulation),
      },
    });
    let previous = engine.exportCheckpoint();
    let peakPopulation = initialPopulation;
    let births = 0;
    let deaths = 0;
    const deathCauses: Record<DeathCause, number> = {
      starvation: 0,
      dehydration: 0,
      predation: 0,
      age: 0,
    };
    const seenEvents = new Set<string>();
    const eventCounts = new Map<SimulationEvent['type'], number>();
    const groupFormedAt = new Map<string, number>();
    let groupLifetimeTicks = 0;
    let completedGroupLifetimes = 0;
    while (
      engine.getSnapshot().generation < targetGenerations &&
      engine.getSnapshot().populationSize
    ) {
      engine.runUntilGeneration(engine.getSnapshot().generation + 1);
      const checkpoint = engine.exportCheckpoint();
      assertSimulationInvariants(checkpoint, previous);
      previous = checkpoint;
      const latest = engine.getGenerationSummaries().at(-1);
      if (latest) {
        peakPopulation = Math.max(peakPopulation, latest.population);
        births += latest.births;
        deaths += latest.deaths;
        for (const cause of causes) deathCauses[cause] += latest.deathCauses[cause];
      }
      for (const event of engine.getEvents()) {
        if (seenEvents.has(event.id)) continue;
        seenEvents.add(event.id);
        eventCounts.set(event.type, (eventCounts.get(event.type) ?? 0) + 1);
        if (event.type === 'socialGroupFormed' && event.groupId)
          groupFormedAt.set(event.groupId, event.tick);
        if (event.type === 'socialGroupDissolved' && event.groupId) {
          const formedAt = groupFormedAt.get(event.groupId);
          if (formedAt !== undefined) {
            groupLifetimeTicks += event.tick - formedAt;
            completedGroupLifetimes += 1;
          }
        }
      }
      peakHeapBytes = Math.max(peakHeapBytes, process.memoryUsage().heapUsed);
    }
    const snapshot = engine.getSnapshot();
    const latest = engine.getGenerationSummaries().at(-1);
    const social = engine.getSocialSnapshot();
    return {
      scenario,
      seed,
      targetGenerations,
      reachedGeneration: snapshot.generation,
      completed: snapshot.generation >= targetGenerations || snapshot.populationSize === 0,
      extinct: snapshot.populationSize === 0,
      extinctionGeneration: snapshot.populationSize === 0 ? snapshot.generation : null,
      finalPopulation: snapshot.populationSize,
      peakPopulation,
      births,
      deaths,
      deathCauses,
      finalResources: {
        food: latest?.environment.food ?? snapshot.worldSummary.food,
        hardFood: latest?.environment.hardFood ?? snapshot.worldSummary.hardFood,
        water: latest?.environment.water ?? snapshot.worldSummary.water,
        resourcePressure:
          latest?.environment.resourcePressure ?? snapshot.worldSummary.resourcePressure,
      },
      bottlenecks: eventCounts.get('populationBottleneck') ?? 0,
      discoveries: eventCounts.get('firstDiscovery') ?? 0,
      culturalAdoptions: eventCounts.get('culturalThreshold') ?? 0,
      culturalLosses: eventCounts.get('traditionLost') ?? 0,
      migrations: eventCounts.get('migrationDetected') ?? 0,
      socialGroups: social.metrics.activeGroups,
      socialRelationships: social.metrics.activeRelationships,
      cooperativeForaging: eventCounts.get('cooperativeForaging') ?? 0,
      foodSharing: eventCounts.get('foodShared') ?? 0,
      grooming: eventCounts.get('socialGrooming') ?? 0,
      groupFormations: eventCounts.get('socialGroupFormed') ?? 0,
      groupDissolutions: eventCounts.get('socialGroupDissolved') ?? 0,
      averageGroupLifetimeTicks: completedGroupLifetimes
        ? Number((groupLifetimeTicks / completedGroupLifetimes).toFixed(2))
        : 0,
      positiveRelationships: social.metrics.positiveRelationships,
      negativeRelationships: social.metrics.negativeRelationships,
      runtimeMs: Number((performance.now() - started).toFixed(3)),
      peakHeapBytes,
      error: null,
    };
  } catch (error) {
    return {
      scenario,
      seed,
      targetGenerations,
      reachedGeneration: 0,
      completed: false,
      extinct: false,
      extinctionGeneration: null,
      finalPopulation: 0,
      peakPopulation: 0,
      births: 0,
      deaths: 0,
      deathCauses: { starvation: 0, dehydration: 0, predation: 0, age: 0 },
      finalResources: { food: 0, hardFood: 0, water: 0, resourcePressure: 0 },
      bottlenecks: 0,
      discoveries: 0,
      culturalAdoptions: 0,
      culturalLosses: 0,
      migrations: 0,
      socialGroups: 0,
      socialRelationships: 0,
      cooperativeForaging: 0,
      foodSharing: 0,
      grooming: 0,
      groupFormations: 0,
      groupDissolutions: 0,
      averageGroupLifetimeTicks: 0,
      positiveRelationships: 0,
      negativeRelationships: 0,
      runtimeMs: Number((performance.now() - started).toFixed(3)),
      peakHeapBytes,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const requestedScenario = argument('scenario', 'all');
if (requestedScenario !== 'all' && !allScenarios.includes(requestedScenario as ScenarioName))
  throw new Error(`Unknown scenario: ${requestedScenario}`);
const scenarios = requestedScenario === 'all' ? allScenarios : [requestedScenario as ScenarioName];
const targets = listArgument('generations', [100, 500, 1000]);
const population = integerArgument('population', 50);
const counts = new Map([
  [100, integerArgument('seeds-100', 10)],
  [500, integerArgument('seeds-500', 5)],
  [1000, integerArgument('seeds-1000', 3)],
]);
const runs: StressRun[] = [];
for (const scenario of scenarios)
  for (const target of targets)
    for (let index = 1; index <= (counts.get(target) ?? integerArgument('seeds', 1)); index += 1) {
      const seed = `SLICE8-${scenario}-${target}-${String(index).padStart(2, '0')}`;
      const result = runStress(scenario, seed, target, population);
      runs.push(result);
      console.log(
        `${scenario} ${target} ${index}: gen ${result.reachedGeneration}, pop ${result.finalPopulation}, ${result.runtimeMs} ms`,
      );
    }
const completionRate =
  runs.filter((run) => run.completed && !run.error).length / Math.max(1, runs.length);
const extinctionRate = runs.filter((run) => run.extinct).length / Math.max(1, runs.length);
const report = {
  createdAt: new Date().toISOString(),
  configuration: { scenarios, targets, population, seedCounts: Object.fromEntries(counts) },
  completionRate,
  extinctionRate,
  runs,
};
const table = markdownTable(
  ['Scenario', 'Target', 'Seed', 'Reached', 'Final', 'Peak', 'Extinct', 'Runtime ms', 'Peak heap'],
  runs.map((run) => [
    run.scenario,
    run.targetGenerations,
    run.seed,
    run.reachedGeneration,
    run.finalPopulation,
    run.peakPopulation,
    run.extinct,
    run.runtimeMs,
    run.peakHeapBytes,
  ]),
);
writeQualityReport(
  'stress',
  report,
  `# Simulation stress report\n\nCompletion rate: ${(completionRate * 100).toFixed(1)}%  \nExtinction rate: ${(extinctionRate * 100).toFixed(1)}%\n\n${table}`,
);
