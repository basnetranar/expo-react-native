import type {
  CulturalAdoptionStatistic,
  LifeStageStatistic,
  PopulationFilterState,
  PopulationIndividualRow,
  PopulationOverviewSnapshot,
  PopulationTraitStatistic,
} from '@/features/population/types';
import type { SimulationStatus } from '@/features/simulation/types';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import { getDeterministicVariant } from '@/features/simulation/utils/world-projection';
import type { PopulationDataSnapshot, ScenarioName, TraitName } from '@/simulation';
import { traitNames } from '@/simulation/engine/types';

const stages = ['juvenile', 'youngAdult', 'adult', 'old'] as const;
const behaviours = ['stoneCracking', 'socialForaging'] as const;
const traitRange = 100;
const maximumBoundedStandardDeviation = traitRange / 2;

export function createPopulationOverviewSnapshot(
  source: PopulationDataSnapshot,
  context: { scenario: ScenarioName; status: SimulationStatus; peakPopulation: number },
): PopulationOverviewSnapshot {
  const living = source.living;
  const latest = source.summaries.at(-1) ?? null;
  const lifeStages = stages.map<LifeStageStatistic>((stage) => {
    const count = living.filter((agent) => agent.phenotype.lifeStage === stage).length;
    return { stage, count, proportion: living.length ? count / living.length : 0 };
  });
  const traits = traitNames.map<PopulationTraitStatistic>((trait) =>
    summarizeTrait(
      trait,
      living.map((agent) => agent.genome[trait]),
    ),
  );
  const culturalAdoption = behaviours.map<CulturalAdoptionStatistic>((behaviour) => {
    const count = living.filter((agent) =>
      agent.learnedBehaviours.some((learned) => learned.type === behaviour),
    ).length;
    return { behaviour, count, proportion: living.length ? count / living.length : 0 };
  });
  const individuals = living.map<PopulationIndividualRow>((agent) => ({
    id: agent.id,
    name: getFriendlyName(agent.id),
    generation: agent.generation,
    age: agent.age,
    lifeStage: agent.phenotype.lifeStage,
    health: agent.health,
    currentBehaviour: agent.currentBehaviour,
    learnedBehaviours: agent.learnedBehaviours.map((item) => item.type),
    traits: { ...agent.genome },
    portraitVariant: getDeterministicVariant(
      agent.id,
      agent.phenotype.lifeStage === 'adult' ? 3 : 2,
    ),
  }));
  const diversityIndex =
    living.length < 2
      ? null
      : (mean(traits.map((trait) => trait.standardDeviation)) / maximumBoundedStandardDeviation) *
        100;
  const averages = {
    age: nullableMean(living.map((agent) => agent.age)),
    health: nullableMean(living.map((agent) => agent.health)),
    energy: nullableMean(living.map((agent) => agent.needs.energy)),
    hydration: nullableMean(living.map((agent) => agent.needs.hydration)),
    safety: nullableMean(living.map((agent) => agent.needs.safety)),
  };
  const populationChange = latest ? living.length - latest.population : null;
  return {
    scenario: context.scenario,
    status: context.status,
    tick: source.currentTick,
    generation: source.currentGeneration,
    living: living.length,
    peakPopulation: Math.max(context.peakPopulation, living.length),
    populationChange,
    birthsThisGeneration: source.birthsThisGeneration,
    deathsThisGeneration: source.deathsThisGeneration,
    averageAge: averages.age,
    averageHealth: averages.health,
    averageEnergy: averages.energy,
    averageHydration: averages.hydration,
    averageSafety: averages.safety,
    lifeStages,
    traits,
    diversity: {
      sampleSize: living.length,
      index: diversityIndex,
      explanation:
        living.length < 2
          ? 'At least two living individuals are required to compare inherited variation.'
          : 'Mean population standard deviation across all ten inherited traits, normalized against the maximum possible deviation for the 0–100 trait range. This describes variation, not genetic health.',
    },
    culturalAdoption,
    individuals,
    generations: [...new Set(individuals.map((item) => item.generation))].sort((a, b) => a - b),
    trend: source.summaries.map((summary) => ({
      generation: summary.generation,
      population: summary.population,
      births: summary.births,
      deaths: summary.deaths,
    })),
    insights: createInsights(living.length, populationChange, lifeStages, culturalAdoption),
  };
}

export function filterAndSortIndividuals(
  individuals: readonly PopulationIndividualRow[],
  filters: PopulationFilterState,
): PopulationIndividualRow[] {
  const query = filters.search.trim().toLocaleLowerCase();
  return individuals
    .filter(
      (item) =>
        (!query ||
          item.name.toLocaleLowerCase().includes(query) ||
          item.id.toLocaleLowerCase().includes(query)) &&
        (filters.lifeStage === 'all' || item.lifeStage === filters.lifeStage) &&
        (filters.generation === 'all' || item.generation === filters.generation) &&
        (filters.learnedBehaviour === 'all' ||
          item.learnedBehaviours.includes(filters.learnedBehaviour)),
    )
    .sort((first, second) => compareIndividuals(first, second, filters));
}

function compareIndividuals(
  first: PopulationIndividualRow,
  second: PopulationIndividualRow,
  filters: PopulationFilterState,
): number {
  let result = 0;
  switch (filters.sort) {
    case 'age-desc':
      result = second.age - first.age;
      break;
    case 'age-asc':
      result = first.age - second.age;
      break;
    case 'generation':
      result = first.generation - second.generation;
      break;
    case 'name':
      result = first.name.localeCompare(second.name);
      break;
    case 'trait-desc':
      result = second.traits[filters.selectedTrait] - first.traits[filters.selectedTrait];
      break;
    case 'trait-asc':
      result = first.traits[filters.selectedTrait] - second.traits[filters.selectedTrait];
      break;
    case 'health-desc':
      result = second.health - first.health;
  }
  return result || first.id.localeCompare(second.id);
}

function summarizeTrait(trait: TraitName, values: readonly number[]): PopulationTraitStatistic {
  if (!values.length) return { trait, average: 0, minimum: 0, maximum: 0, standardDeviation: 0 };
  const average = mean(values);
  return {
    trait,
    average,
    minimum: Math.min(...values),
    maximum: Math.max(...values),
    standardDeviation: Math.sqrt(mean(values.map((value) => (value - average) ** 2))),
  };
}

function createInsights(
  population: number,
  change: number | null,
  lifeStages: readonly LifeStageStatistic[],
  culture: readonly CulturalAdoptionStatistic[],
): string[] {
  if (!population) return ['No living individuals remain.'];
  const result: string[] = [];
  if (change !== null)
    result.push(
      change === 0
        ? 'Population is unchanged from the last completed generation.'
        : `Population ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change)} since the last completed generation.`,
    );
  const largestStage = [...lifeStages].sort(
    (first, second) =>
      second.count - first.count || stages.indexOf(first.stage) - stages.indexOf(second.stage),
  )[0]!;
  result.push(
    `${stageLabel(largestStage.stage)} represent ${Math.round(largestStage.proportion * 100)}% of living individuals.`,
  );
  for (const item of culture)
    result.push(
      `${behaviourLabel(item.behaviour)} is recorded in ${item.count} living individual${item.count === 1 ? '' : 's'} (${Math.round(item.proportion * 100)}%).`,
    );
  return result;
}

function nullableMean(values: readonly number[]): number | null {
  return values.length ? mean(values) : null;
}

function mean(values: readonly number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
}

export function stageLabel(stage: string): string {
  return stage === 'youngAdult'
    ? 'Young adults'
    : `${stage[0]?.toUpperCase() ?? ''}${stage.slice(1)}${stage === 'old' ? '' : 's'}`;
}

export function behaviourLabel(behaviour: string): string {
  return behaviour === 'stoneCracking' ? 'Stone cracking' : 'Social foraging';
}

export function traitLabel(trait: TraitName): string {
  const labels: Record<TraitName, string> = {
    strength: 'Strength',
    speed: 'Speed',
    endurance: 'Endurance',
    dexterity: 'Dexterity',
    vision: 'Vision',
    metabolicEfficiency: 'Metabolic efficiency',
    memoryPotential: 'Memory potential',
    learningAbility: 'Learning ability',
    socialSensitivity: 'Social sensitivity',
    curiosity: 'Curiosity',
  };
  return labels[trait];
}
