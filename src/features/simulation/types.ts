import type {
  AgentDetailSnapshot,
  DeathCause,
  GenerationSummary,
  Position,
  SimulationEvent,
  SimulationSnapshot,
  Terrain,
  ScenarioName,
} from '@/simulation';

export type SimulationSpeed = 1 | 5 | 10 | 50;
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'extinct';
export type ResourceKind = 'food' | 'water' | 'stone';

export interface TerrainMacroCell {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  terrain: Terrain;
  hasWater: boolean;
  decoration: boolean;
}

export interface ResourceMarkerSnapshot {
  id: string;
  kind: ResourceKind;
  position: Position;
  strength: number;
}

export interface PredatorMarkerSnapshot {
  id: string;
  position: Position;
  state: string;
}

export interface WorldPresentationSnapshot {
  width: number;
  height: number;
  terrainCells: readonly TerrainMacroCell[];
  resources: readonly ResourceMarkerSnapshot[];
  predators: readonly PredatorMarkerSnapshot[];
}

export interface SimulationSessionSnapshot extends SimulationSnapshot {
  world: WorldPresentationSnapshot;
  peakPopulation: number;
  latestSummary: GenerationSummary | null;
  scenario: ScenarioName;
  populationChange: number | null;
}

export type SelectedAgentSnapshot = AgentDetailSnapshot & {
  selectionState: 'alive' | 'deceased';
  deathCause?: DeathCause;
};

export interface SimulationUiState {
  status: SimulationStatus;
  speed: SimulationSpeed;
  snapshot: SimulationSessionSnapshot | null;
  selectedAgentId: string | null;
  selectedAgent: SelectedAgentSnapshot | null;
  isInitialized: boolean;
  error: string | null;
  warning: string | null;
}

export interface SimulationSessionUpdate {
  status: SimulationStatus;
  speed: SimulationSpeed;
  snapshot: SimulationSessionSnapshot;
  selectedAgentId: string | null;
  selectedAgent: SelectedAgentSnapshot | null;
}

export type PresentedEvent = {
  event: SimulationEvent;
  title: string;
  description: string;
  category: 'discovery' | 'population' | 'migration' | 'warning' | 'environment';
  artwork: number | null;
};
