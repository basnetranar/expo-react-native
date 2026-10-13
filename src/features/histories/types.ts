import type {
  EnvironmentIntervention,
  GenerationSummary,
  ScenarioName,
  SimulationEvent,
} from '@/simulation';

export type BranchStatus = 'active' | 'paused' | 'extinct';
export type CheckpointKind = 'head' | 'manual';

export interface CheckpointMetadata {
  id: string;
  branchId: string;
  label: string;
  kind: CheckpointKind;
  tick: number;
  generation: number;
  population: number;
  createdAt: string;
  schemaVersion: number;
  checksum: string;
  sizeBytes: number;
}

export interface EvolutionBranch {
  id: string;
  name: string;
  parentBranchId: string | null;
  originCheckpointId: string | null;
  originTick: number;
  originGeneration: number;
  status: BranchStatus;
  headCheckpointId: string;
  scenario: ScenarioName;
  createdAt: string;
  population: number;
  tick: number;
  generation: number;
  history: GenerationSummary[];
  interventions: EnvironmentIntervention[];
  events: SimulationEvent[];
}

export interface HistoriesManifest {
  schemaVersion: 1;
  activeBranchId: string;
  nextSequence: number;
  branches: EvolutionBranch[];
  checkpoints: CheckpointMetadata[];
}

export interface HistoriesSnapshot {
  activeBranchId: string;
  branches: readonly EvolutionBranch[];
  checkpoints: readonly CheckpointMetadata[];
  totalStorageBytes: number;
  storageLimitBytes: number;
}
