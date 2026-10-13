import type {
  BehaviourPrevalence,
  CultureStage,
  GenomeSummary,
  LearnedBehaviourType,
  ResourceDiagnostics,
  ScenarioName,
  TraitName,
} from '@/simulation';

export type TimelineMetric = 'population' | 'births' | 'deaths';
export type MilestoneCategory =
  'discovery' | 'culture' | 'population' | 'migration' | 'environment' | 'extinction';

export interface GenerationChartPoint {
  generation: number;
  population: number;
  births: number;
  deaths: number;
  extinct: boolean;
}

export interface TraitTrendPoint {
  generation: number;
  value: number;
}

export interface CulturalTrendPoint {
  generation: number;
  prevalence: number;
  stage: CultureStage;
}

export interface EvolutionMilestone {
  id: string;
  tick: number;
  generation: number;
  category: MilestoneCategory;
  title: string;
  description: string;
}

export interface GenerationDetail {
  generation: number;
  population: number;
  births: number;
  deaths: number;
  deathCauses: Record<string, number>;
  averageGenome: GenomeSummary;
  behaviourPrevalence: BehaviourPrevalence;
  resources: ResourceDiagnostics;
  resourcePressure: number;
  migrationRate: number;
  milestones: readonly EvolutionMilestone[];
}

export interface EvolutionTimelineViewModel {
  scenario: ScenarioName;
  currentGeneration: number;
  currentTick: number;
  latestGeneration: number | null;
  population: number | null;
  populationChange: number | null;
  retainedPeakPopulation: number | null;
  births: number | null;
  deaths: number | null;
  extinct: boolean;
  chart: readonly GenerationChartPoint[];
  traitNames: readonly TraitName[];
  traitSeries: Readonly<Record<TraitName, readonly TraitTrendPoint[]>>;
  culturalBehaviours: readonly LearnedBehaviourType[];
  culturalSeries: Readonly<Record<LearnedBehaviourType, readonly CulturalTrendPoint[]>>;
  milestones: readonly EvolutionMilestone[];
  generations: readonly GenerationDetail[];
  retention: {
    generationLimit: number;
    eventLimit: number;
    generationsDiscarded: number;
    eventsDiscarded: number;
  };
}
