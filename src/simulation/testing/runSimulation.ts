import { averageGenome } from '@/simulation/analytics/populationStats';
import { SimulationEngine } from '@/simulation/engine/SimulationEngine';
import type {
  GenerationSummary,
  GenomeSummary,
  LearningEvent,
  SimulationEvent,
} from '@/simulation/engine/types';
import type { ScenarioName } from '@/simulation/scenarios/types';
import { formatCollapseReport } from '@/simulation/testing/collapseReport';

export interface RunResult {
  scenario: ScenarioName;
  seed: string;
  startPopulation: number;
  endPopulation: number;
  peakPopulation: number;
  minimumPopulation: number;
  extinct: boolean;
  extinctionGeneration: number | null;
  initialTraits: GenomeSummary;
  finalTraits: GenomeSummary;
  events: SimulationEvent[];
  culturalMilestones: LearningEvent[];
  summaries: GenerationSummary[];
}

export function runSimulation(
  scenario: ScenarioName,
  seed: string,
  generations: number,
): RunResult {
  const engine = new SimulationEngine({ seed, scenario });
  const starting = engine.getPopulation();
  const initialTraits = averageGenome(starting);
  engine.runUntilGeneration(generations);
  const summaries = engine.getGenerationSummaries();
  const final = engine.getPopulation();
  const lastLivingSummary = summaries.findLast((summary) => summary.population > 0);
  return {
    scenario,
    seed,
    startPopulation: starting.length,
    endPopulation: final.length,
    peakPopulation: Math.max(starting.length, ...summaries.map((summary) => summary.population)),
    minimumPopulation: Math.min(starting.length, ...summaries.map((summary) => summary.population)),
    extinct: final.length === 0,
    extinctionGeneration: summaries.find((summary) => summary.population === 0)?.generation ?? null,
    initialTraits,
    finalTraits: final.length
      ? averageGenome(final)
      : (lastLivingSummary?.averageGenome ?? averageGenome(final)),
    events: engine.getEvents(),
    culturalMilestones: engine.getCulturalSnapshot().milestones.map((event) => ({ ...event })),
    summaries,
  };
}

function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

function isScenario(value: string): value is ScenarioName {
  return value === 'stableSavannah' || value === 'drought' || value === 'hardFood';
}

function printResult(result: RunResult): void {
  const trait = (name: keyof GenomeSummary) =>
    `${result.initialTraits[name].toFixed(1)} → ${result.finalTraits[name].toFixed(1)}`;
  console.log(`Scenario: ${result.scenario}`);
  console.log(`Seed: ${result.seed}\n`);
  console.log(`Start population: ${result.startPopulation}`);
  console.log(`End population: ${result.endPopulation}`);
  console.log(`Peak population: ${result.peakPopulation}\n`);
  console.log(`Minimum population: ${result.minimumPopulation}\n`);
  console.log('Trait change:');
  console.log(`Memory potential: ${trait('memoryPotential')}`);
  console.log(`Endurance: ${trait('endurance')}`);
  console.log(`Metabolic efficiency: ${trait('metabolicEfficiency')}\n`);
  console.log('Events:');
  for (const event of result.events.slice(-12))
    console.log(`Gen ${event.generation} — ${event.type}`);
  console.log(`\nLargest collapse:\n${formatCollapseReport(result.summaries)}`);
}

if (process.argv[1]?.endsWith('runSimulation.ts')) {
  const scenarioValue = argument('scenario', 'stableSavannah');
  if (!isScenario(scenarioValue)) throw new Error(`Unknown scenario: ${scenarioValue}`);
  const generations = Number.parseInt(argument('generations', '100'), 10);
  printResult(runSimulation(scenarioValue, argument('seed', 'FIRST-MINDS-001'), generations));
}
