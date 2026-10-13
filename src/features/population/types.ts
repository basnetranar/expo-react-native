import type { SimulationStatus } from '@/features/simulation/types';
import type {
  BehaviourType,
  LearnedBehaviourType,
  LifeStage,
  ScenarioName,
  TraitName,
} from '@/simulation';

export interface PopulationTraitStatistic {
  trait: TraitName;
  average: number;
  minimum: number;
  maximum: number;
  standardDeviation: number;
}

export interface LifeStageStatistic {
  stage: LifeStage;
  count: number;
  proportion: number;
}

export interface CulturalAdoptionStatistic {
  behaviour: LearnedBehaviourType;
  count: number;
  proportion: number;
}

export interface GeneticDiversitySummary {
  sampleSize: number;
  index: number | null;
  explanation: string;
}

export interface PopulationIndividualRow {
  id: string;
  name: string;
  generation: number;
  age: number;
  lifeStage: LifeStage;
  health: number;
  currentBehaviour: BehaviourType;
  learnedBehaviours: readonly LearnedBehaviourType[];
  traits: Readonly<Record<TraitName, number>>;
  portraitVariant: number;
}

export type PopulationSort =
  'age-desc' | 'age-asc' | 'generation' | 'name' | 'trait-desc' | 'trait-asc' | 'health-desc';

export interface PopulationFilterState {
  search: string;
  lifeStage: LifeStage | 'all';
  generation: number | 'all';
  learnedBehaviour: LearnedBehaviourType | 'all';
  selectedTrait: TraitName;
  sort: PopulationSort;
}

export interface PopulationTrendPoint {
  generation: number;
  population: number;
  births: number;
  deaths: number;
}

export interface PopulationOverviewSnapshot {
  scenario: ScenarioName;
  status: SimulationStatus;
  tick: number;
  generation: number;
  living: number;
  peakPopulation: number;
  populationChange: number | null;
  birthsThisGeneration: number;
  deathsThisGeneration: number;
  averageAge: number | null;
  averageHealth: number | null;
  averageEnergy: number | null;
  averageHydration: number | null;
  averageSafety: number | null;
  lifeStages: readonly LifeStageStatistic[];
  traits: readonly PopulationTraitStatistic[];
  diversity: GeneticDiversitySummary;
  culturalAdoption: readonly CulturalAdoptionStatistic[];
  individuals: readonly PopulationIndividualRow[];
  generations: readonly number[];
  trend: readonly PopulationTrendPoint[];
  insights: readonly string[];
}
