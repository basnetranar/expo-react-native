import type { ExperimentSourceSnapshot, ExperimentsViewModel } from '@/features/experiments/types';

export function createExperimentsViewModel(source: ExperimentSourceSnapshot): ExperimentsViewModel {
  const records = [...source.environment.interventions];
  const active = records
    .filter((item) => item.status === 'active' || item.status === 'scheduled')
    .sort(
      (first, second) => first.startTick - second.startTick || first.id.localeCompare(second.id),
    );
  const history = records
    .filter((item) => item.status === 'completed' || item.status === 'cancelled')
    .sort((first, second) => (second.endTick ?? 0) - (first.endTick ?? 0));
  const firstObservedGeneration = records
    .filter((item) => item.startGeneration !== null)
    .reduce<number | null>(
      (earliest, item) =>
        earliest === null ? item.startGeneration : Math.min(earliest, item.startGeneration!),
      null,
    );
  const trend = [...source.summaries]
    .sort((first, second) => first.generation - second.generation)
    .map((summary) => ({
      generation: summary.generation,
      population: summary.population,
      births: summary.births,
      deaths: summary.deaths,
      foodPerAgent: summary.resources.foodPerAgent,
      waterPerAgent: summary.resources.waterPerAgent,
      predatorDeaths: summary.deathCauses.predation,
    }));
  return {
    scenario: source.scenario,
    status: source.status,
    population: source.population,
    tick: source.environment.currentTick,
    generation: source.environment.currentGeneration,
    current: {
      foodAvailability: Math.round(source.environment.factors.foodAvailability * 100),
      waterAvailability: Math.round(source.environment.factors.waterAvailability * 100),
      predatorPressure: Math.round(source.environment.factors.predatorPressure * 100),
      durationGenerations: 5,
    },
    environment: source.environment,
    active,
    history,
    trend,
    firstObservedGeneration,
    latestSummary: source.summaries.at(-1) ?? null,
  };
}

export function interventionTypeLabel(type: string): string {
  if (type === 'foodAvailability') return 'Food availability';
  if (type === 'waterAvailability') return 'Water availability';
  if (type === 'predatorPressure') return 'Predator pressure';
  return 'Drought';
}

export function interventionValueLabel(type: string, value: number): string {
  if (type === 'drought') return 'Food ×0.65 · water ×0.40';
  const change = Math.round((value - 1) * 100);
  return `${change >= 0 ? '+' : ''}${change}% of baseline`;
}
