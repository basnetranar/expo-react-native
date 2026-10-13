import type { SimulationStatus } from '@/features/simulation/types';
import type {
  EnvironmentIntervention,
  EnvironmentInterventionSnapshot,
  GenerationSummary,
  ScenarioName,
} from '@/simulation';

export interface EnvironmentDraft {
  foodAvailability: number;
  waterAvailability: number;
  predatorPressure: number;
  durationGenerations: number;
}

export interface ExperimentPreset {
  id: string;
  name: string;
  explanation: string;
  values: Pick<EnvironmentDraft, 'foodAvailability' | 'waterAvailability' | 'predatorPressure'>;
}

export interface ExperimentSourceSnapshot {
  environment: EnvironmentInterventionSnapshot;
  summaries: readonly GenerationSummary[];
  scenario: ScenarioName;
  status: SimulationStatus;
  population: number;
}

export interface ExperimentTrendPoint {
  generation: number;
  population: number;
  births: number;
  deaths: number;
  foodPerAgent: number;
  waterPerAgent: number;
  predatorDeaths: number;
}

export interface ExperimentsViewModel {
  scenario: ScenarioName;
  status: SimulationStatus;
  population: number;
  tick: number;
  generation: number;
  current: EnvironmentDraft;
  environment: EnvironmentInterventionSnapshot;
  active: readonly EnvironmentIntervention[];
  history: readonly EnvironmentIntervention[];
  trend: readonly ExperimentTrendPoint[];
  firstObservedGeneration: number | null;
  latestSummary: GenerationSummary | null;
}
