import type { WorldConfiguration } from '@/features/world/types';
import {
  createSimulationConfig,
  defaultSimulationConfig,
  type ScenarioName,
  type SimulationConfig,
} from '@/simulation';

export const supportedScenarioNames = ['stableSavannah', 'drought', 'hardFood'] as const;

export const scenarioInformation: Record<
  ScenarioName,
  { label: string; shortLabel: string; description: string; status: string }
> = {
  stableSavannah: {
    label: 'Stable Savannah',
    shortLabel: 'Stable',
    description: 'Balanced food and water regeneration provide a steady baseline for observation.',
    status: 'Stable environment',
  },
  drought: {
    label: 'Drought',
    shortLabel: 'Drought',
    description: 'Water sources recede and food regeneration falls during a timed dry period.',
    status: 'Timed climate pressure',
  },
  hardFood: {
    label: 'Hard Food',
    shortLabel: 'Hard Food',
    description:
      'More calories are locked in hard foods, rewarding the emergence of stone cracking.',
    status: 'Tool-use pressure',
  },
};

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const scale = (value: number, minimum: number, maximum: number) =>
  Math.round(minimum + (maximum - minimum) * (clampPercent(value) / 100));

export function isSupportedScenario(value: unknown): value is ScenarioName {
  return typeof value === 'string' && supportedScenarioNames.includes(value as ScenarioName);
}

export function worldConfigurationToSimulationConfig(
  configuration: WorldConfiguration,
): SimulationConfig {
  const scenario = isSupportedScenario(configuration.scenario)
    ? configuration.scenario
    : 'stableSavannah';
  const population = Math.max(8, Math.min(60, Math.round(configuration.initialPopulation)));
  const foodPatches = scale(configuration.foodAbundance, 8, 28);
  const waterSources = scale(configuration.waterAvailability, 2, 10);
  const predatorCount = scale(configuration.predatorPressure, 0, 8);
  return createSimulationConfig({
    seed:
      configuration.seed?.trim() ||
      `FIRST-MINDS-LIVE-${scenario}-${population}-${foodPatches}-${waterSources}-${predatorCount}`,
    scenario,
    population: { ...defaultSimulationConfig.population, initial: population },
    world: { ...defaultSimulationConfig.world, foodPatches, waterSources, predatorCount },
  });
}

export type WorldRouteParams = {
  seed?: string | string[];
  scenario?: string | string[];
  food?: string | string[];
  water?: string | string[];
  predators?: string | string[];
  population?: string | string[];
};

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const numberParam = (value: string | string[] | undefined, fallback: number) => {
  const parsed = Number(first(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function worldConfigurationFromRoute(
  params: WorldRouteParams,
  fallback: WorldConfiguration,
): WorldConfiguration {
  const scenarioValue = first(params.scenario);
  return {
    ...(first(params.seed)?.trim() ? { seed: first(params.seed)?.trim() } : {}),
    scenario: isSupportedScenario(scenarioValue) ? scenarioValue : fallback.scenario,
    foodAbundance: clampPercent(numberParam(params.food, fallback.foodAbundance)),
    waterAvailability: clampPercent(numberParam(params.water, fallback.waterAvailability)),
    predatorPressure: clampPercent(numberParam(params.predators, fallback.predatorPressure)),
    initialPopulation: Math.max(
      8,
      Math.min(60, Math.round(numberParam(params.population, fallback.initialPopulation))),
    ),
  };
}

export function worldConfigurationToRoute(configuration: WorldConfiguration) {
  return {
    ...(configuration.seed ? { seed: configuration.seed } : {}),
    scenario: configuration.scenario,
    food: String(configuration.foodAbundance),
    water: String(configuration.waterAvailability),
    predators: String(configuration.predatorPressure),
    population: String(configuration.initialPopulation),
  };
}
