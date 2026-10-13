import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type {
  DeathCause,
  LearnedBehaviourType,
  LifeStage,
  TraitName,
} from '@/simulation/engine/types';
import { traitNames } from '@/simulation/engine/types';
import type { ScenarioName } from '@/simulation/scenarios/types';
import { runSimulation, type RunResult } from '@/simulation/testing/runSimulation';

const scenarioNames: ScenarioName[] = ['stableSavannah', 'drought', 'hardFood'];
const deathCauses: DeathCause[] = ['starvation', 'dehydration', 'predation', 'age'];
const lifeStages: LifeStage[] = ['juvenile', 'youngAdult', 'adult', 'old'];

interface Distribution {
  mean: number;
  median: number;
  p10: number;
  p90: number;
}

export interface AggregateResult {
  scenario: ScenarioName;
  runs: number;
  survivalRate: number;
  extinctionRate: number;
  extinctionGeneration: Distribution;
  startingPopulation: Distribution;
  finalPopulation: Distribution;
  peakPopulation: Distribution;
  minimumPopulation: Distribution;
  bottleneckCount: Distribution;
  bottleneckFrequency: number;
  births: Distribution;
  deaths: Distribution;
  deathCauses: Record<DeathCause, Distribution>;
  averageLifeStageProportions: Record<LifeStage, number>;
  traitDeltasAmongSurvivors: Record<TraitName, Distribution>;
  discoveries: {
    anyFrequency: number;
    toolFrequency: number;
    establishedToolCultureFrequency: number;
    toolTraditionLossFrequency: number;
    toolCalories: Distribution;
    survivalRateWithTool: number;
    survivalRateWithoutTool: number;
    meanFinalPopulationWithTool: number;
    meanFinalPopulationWithoutTool: number;
  };
  migration: { frequency: number; count: Distribution };
}

export function aggregateRuns(
  scenario: ScenarioName,
  results: readonly RunResult[],
): AggregateResult {
  const frequency = (predicate: (result: RunResult) => boolean) =>
    results.filter(predicate).length / Math.max(1, results.length);
  const survivors = results.filter((result) => !result.extinct);
  const traitDeltas = {} as Record<TraitName, Distribution>;
  for (const trait of traitNames)
    traitDeltas[trait] = distribution(
      survivors.map((result) => result.finalTraits[trait] - result.initialTraits[trait]),
    );
  const causeDistributions = {} as Record<DeathCause, Distribution>;
  for (const cause of deathCauses)
    causeDistributions[cause] = distribution(
      results.map((result) =>
        result.summaries.reduce((sum, summary) => sum + summary.deathCauses[cause], 0),
      ),
    );
  const stageProportions = {} as Record<LifeStage, number>;
  for (const stage of lifeStages) {
    const proportions = results.flatMap((result) =>
      result.summaries
        .filter((summary) => summary.population > 0)
        .map((summary) => summary.lifeStages[stage] / summary.population),
    );
    stageProportions[stage] = mean(proportions);
  }
  const births = (result: RunResult) =>
    result.summaries.reduce((sum, summary) => sum + summary.births, 0);
  const deaths = (result: RunResult) =>
    result.summaries.reduce((sum, summary) => sum + summary.deaths, 0);
  const bottlenecks = (result: RunResult) =>
    result.events.filter((event) => event.type === 'populationBottleneck').length;
  const migrations = (result: RunResult) =>
    result.events.filter((event) => event.type === 'migrationDetected').length;
  const hasTool = (result: RunResult) => hasBehaviourDiscovery(result, 'stoneCracking');
  const toolRuns = results.filter(hasTool);
  const nonToolRuns = results.filter((result) => !hasTool(result));
  return {
    scenario,
    runs: results.length,
    survivalRate: frequency((result) => !result.extinct),
    extinctionRate: frequency((result) => result.extinct),
    extinctionGeneration: distribution(
      results.flatMap((result) =>
        result.extinctionGeneration === null ? [] : [result.extinctionGeneration],
      ),
    ),
    startingPopulation: distribution(results.map((result) => result.startPopulation)),
    finalPopulation: distribution(results.map((result) => result.endPopulation)),
    peakPopulation: distribution(results.map((result) => result.peakPopulation)),
    minimumPopulation: distribution(results.map((result) => result.minimumPopulation)),
    bottleneckCount: distribution(results.map(bottlenecks)),
    bottleneckFrequency: frequency((result) => bottlenecks(result) > 0),
    births: distribution(results.map(births)),
    deaths: distribution(results.map(deaths)),
    deathCauses: causeDistributions,
    averageLifeStageProportions: stageProportions,
    traitDeltasAmongSurvivors: traitDeltas,
    discoveries: {
      anyFrequency: frequency((result) => hasBehaviourDiscovery(result)),
      toolFrequency: frequency((result) => hasBehaviourDiscovery(result, 'stoneCracking')),
      establishedToolCultureFrequency: frequency((result) =>
        result.events.some(
          (event) =>
            event.type === 'culturalThreshold' &&
            event.behaviour === 'stoneCracking' &&
            event.stage === 'established',
        ),
      ),
      toolTraditionLossFrequency: frequency((result) =>
        result.events.some(
          (event) => event.type === 'traditionLost' && event.behaviour === 'stoneCracking',
        ),
      ),
      toolCalories: distribution(
        results.map((result) =>
          result.summaries.reduce((sum, summary) => sum + summary.tools.caloriesFromToolUse, 0),
        ),
      ),
      survivalRateWithTool:
        toolRuns.filter((result) => !result.extinct).length / Math.max(1, toolRuns.length),
      survivalRateWithoutTool:
        nonToolRuns.filter((result) => !result.extinct).length / Math.max(1, nonToolRuns.length),
      meanFinalPopulationWithTool: mean(toolRuns.map((result) => result.endPopulation)),
      meanFinalPopulationWithoutTool: mean(nonToolRuns.map((result) => result.endPopulation)),
    },
    migration: {
      frequency: frequency((result) => migrations(result) > 0),
      count: distribution(results.map(migrations)),
    },
  };
}

export function hasBehaviourDiscovery(
  result: Pick<RunResult, 'culturalMilestones'>,
  behaviour?: LearnedBehaviourType,
): boolean {
  return result.culturalMilestones.some(
    (event) =>
      event.type === 'behaviourDiscovered' &&
      (behaviour === undefined || event.behaviour === behaviour),
  );
}

function distribution(values: readonly number[]): Distribution {
  const sorted = [...values].sort((first, second) => first - second);
  return {
    mean: mean(sorted),
    median: percentile(sorted, 0.5),
    p10: percentile(sorted, 0.1),
    p90: percentile(sorted, 0.9),
  };
}

const mean = (values: readonly number[]): number =>
  values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

function percentile(sorted: readonly number[], proportion: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * proportion));
  return sorted[index]!;
}

function argument(name: string, fallback: number): number {
  const index = process.argv.indexOf(`--${name}`);
  return Number.parseInt(
    index >= 0 ? (process.argv[index + 1] ?? String(fallback)) : String(fallback),
    10,
  );
}

function stringArgument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function isScenario(value: string): value is ScenarioName {
  return scenarioNames.includes(value as ScenarioName);
}

if (process.argv[1]?.endsWith('aggregateRuns.ts')) {
  const outputDirectory = resolve('simulation-output');
  mkdirSync(outputDirectory, { recursive: true });
  if (process.argv.includes('--merge')) {
    const sources = scenarioNames.map((scenario) => {
      const source = resolve(outputDirectory, `aggregate-${scenario}.json`);
      return JSON.parse(readFileSync(source, 'utf8')) as {
        seedCount: number;
        generations: number;
        durationSeconds: number;
        scenarios: AggregateResult[];
      };
    });
    const scenarios = sources.map((source) => source.scenarios[0]!);
    const output = resolve(outputDirectory, 'aggregate.json');
    writeFileSync(
      output,
      `${JSON.stringify(
        {
          seedCount: sources[0]?.seedCount ?? 0,
          generations: sources[0]?.generations ?? 0,
          durationSeconds: sources.reduce((sum, source) => sum + source.durationSeconds, 0),
          scenarios,
        },
        null,
        2,
      )}\n`,
    );
    console.log(`Merged ${output}`);
    process.exit(0);
  }
  const seedCount = argument('seeds', 100);
  const generations = argument('generations', 100);
  const requestedScenario = stringArgument('scenario');
  if (requestedScenario && !isScenario(requestedScenario))
    throw new Error(`Unknown scenario: ${requestedScenario}`);
  const selectedScenarios: ScenarioName[] = requestedScenario
    ? [requestedScenario as ScenarioName]
    : scenarioNames;
  const startedAt = performance.now();
  const aggregates = selectedScenarios.map((scenario) => {
    const results = Array.from({ length: seedCount }, (_, index) =>
      runSimulation(scenario, `COMPARE-${index + 1}`, generations),
    );
    return aggregateRuns(scenario, results);
  });
  const durationSeconds = (performance.now() - startedAt) / 1_000;
  const output = resolve(
    outputDirectory,
    requestedScenario ? `aggregate-${requestedScenario}.json` : 'aggregate.json',
  );
  writeFileSync(
    output,
    `${JSON.stringify({ seedCount, generations, durationSeconds, scenarios: aggregates }, null, 2)}\n`,
  );
  console.log(JSON.stringify(aggregates, null, 2));
  console.log(`\nWrote ${output}`);
}
