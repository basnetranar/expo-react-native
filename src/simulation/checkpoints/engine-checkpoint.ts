import type { EventDetectorState } from '@/simulation/analytics/eventDetector';
import type { EvolutionHistoryState } from '@/simulation/analytics/evolutionHistory';
import type { SeededRngState } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type {
  AgentDebugTrace,
  AgentInspectorSnapshot,
  GenerationTelemetry,
  Hominin,
  Position,
  Predator,
  World,
} from '@/simulation/engine/types';
import type { EnvironmentInterventionManagerState } from '@/simulation/interventions/intervention-manager';
import type { CulturalHistoryState } from '@/simulation/learning/CulturalHistory';
import type { LineageRegistryState } from '@/simulation/lineage/LineageRegistry';
import type { SocialSystemState } from '@/simulation/social/SocialSystem';

export const engineCheckpointSchemaVersion = 1 as const;
export const engineCheckpointVersion = 'first-minds-engine-1' as const;

export interface EngineCheckpointV1 {
  schemaVersion: typeof engineCheckpointSchemaVersion;
  engineVersion: typeof engineCheckpointVersion;
  seed: string;
  tick: number;
  generation: number;
  config: SimulationConfig;
  state: SerializedSimulationState;
}

export interface SerializedSimulationState {
  rng: SeededRngState;
  world: World;
  predators: Predator[];
  population: Hominin[];
  history: EvolutionHistoryState;
  lineage: LineageRegistryState;
  interventions: EnvironmentInterventionManagerState;
  eventDetector: EventDetectorState;
  debugTrace: AgentDebugTrace[];
  deathsThisGeneration: Hominin[];
  birthsThisGeneration: number;
  telemetry: GenerationTelemetry;
  generationStartPositions: [string, Position][];
  deceasedAgentSnapshots: [string, AgentInspectorSnapshot][];
  nextAgentId: number;
  /** Added in Slice 10A. Older schema-v1 checkpoints migrate to an empty social state. */
  social?: SocialSystemState;
  /** Added in Slice 10B. Older schema-v1 checkpoints migrate to an empty recorder. */
  culturalHistory?: CulturalHistoryState;
}

export function validateCheckpoint(value: unknown): asserts value is EngineCheckpointV1 {
  if (!isRecord(value)) throw new CheckpointValidationError('Checkpoint must be an object.');
  if (value.schemaVersion !== engineCheckpointSchemaVersion)
    throw new CheckpointValidationError('Unsupported checkpoint schema version.');
  if (value.engineVersion !== engineCheckpointVersion)
    throw new CheckpointValidationError('Checkpoint engine version is incompatible.');
  if (typeof value.seed !== 'string' || !value.seed)
    throw new CheckpointValidationError('Checkpoint seed is missing.');
  assertNonNegativeInteger(value.tick, 'tick');
  assertNonNegativeInteger(value.generation, 'generation');
  if (!isRecord(value.config) || String(value.config.seed) !== value.seed)
    throw new CheckpointValidationError('Checkpoint configuration is invalid.');
  if (!isRecord(value.state)) throw new CheckpointValidationError('Checkpoint state is missing.');
  const state = value.state;
  if (!isRecord(state.rng) || !isRecord(state.world))
    throw new CheckpointValidationError('Checkpoint RNG or world state is invalid.');
  for (const key of ['predators', 'population', 'debugTrace', 'deathsThisGeneration'])
    if (!Array.isArray(state[key]))
      throw new CheckpointValidationError(`Checkpoint ${key} state is invalid.`);
  for (const key of ['history', 'lineage', 'interventions', 'eventDetector', 'telemetry'])
    if (!isRecord(state[key]))
      throw new CheckpointValidationError(`Checkpoint ${key} state is invalid.`);
  if (
    !Array.isArray(state.generationStartPositions) ||
    !Array.isArray(state.deceasedAgentSnapshots)
  )
    throw new CheckpointValidationError('Checkpoint map state is invalid.');
  assertNonNegativeInteger(state.birthsThisGeneration, 'birthsThisGeneration');
  assertNonNegativeInteger(state.nextAgentId, 'nextAgentId');
  if (state.social !== undefined) validateSocialState(state.social);
  if (state.culturalHistory !== undefined) validateCulturalHistoryState(state.culturalHistory);
}

export function cloneCheckpoint(checkpoint: EngineCheckpointV1): EngineCheckpointV1 {
  return JSON.parse(JSON.stringify(checkpoint)) as EngineCheckpointV1;
}

export function migrateCheckpoint(checkpoint: EngineCheckpointV1): EngineCheckpointV1 {
  const migrated = cloneCheckpoint(checkpoint);
  for (const agent of [...migrated.state.population, ...migrated.state.deathsThisGeneration]) {
    normalizeSocialAgent(agent);
  }
  for (const [, snapshot] of migrated.state.deceasedAgentSnapshots) {
    snapshot.carriedFood ??= 0;
    snapshot.groupId ??= null;
    snapshot.socialEvents ??= [];
    snapshot.learningOpportunities ??= [];
    snapshot.learningEvents ??= [];
    for (const learned of snapshot.learnedBehaviours) normalizeLearnedBehaviour(learned);
    for (const relationship of snapshot.relationships) normalizeRelationship(relationship);
  }
  migrated.state.telemetry.learningObservations ??= 0;
  migrated.state.telemetry.learningAttempts ??= 0;
  migrated.state.telemetry.learningAcquisitions ??= 0;
  migrated.state.telemetry.learningTransmissions ??= 0;
  migrated.state.telemetry.learningDemonstrations ??= 0;
  return migrated;
}

function normalizeSocialAgent(agent: Hominin): void {
  agent.carriedFood ??= 0;
  agent.groupId ??= null;
  agent.learningOpportunities ??= [];
  for (const learned of agent.learnedBehaviours) normalizeLearnedBehaviour(learned);
  for (const relationship of agent.relationships) normalizeRelationship(relationship);
}

function normalizeLearnedBehaviour(behaviour: Hominin['learnedBehaviours'][number]): void {
  behaviour.acquisitionSource ??= behaviour.learnedFrom ? 'imitation' : 'experience';
  behaviour.practiceCount ??= behaviour.reinforcement;
  behaviour.successfulAttempts ??= behaviour.reinforcement;
  behaviour.failedAttempts ??= 0;
  behaviour.lastPracticedAtTick ??= behaviour.firstLearnedAtTick;
}

function normalizeRelationship(relationship: Hominin['relationships'][number]): void {
  relationship.affinity ??= relationship.kinship * 20;
  relationship.interactionCount ??= 0;
  relationship.firstInteractionTick ??= null;
  relationship.lastInteractionTick ??= null;
  relationship.cooperationCount ??= 0;
  relationship.sharingCount ??= 0;
  relationship.groomingCount ??= 0;
}

export class CheckpointValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckpointValidationError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertNonNegativeInteger(value: unknown, label: string): void {
  if (!Number.isInteger(value) || (value as number) < 0)
    throw new CheckpointValidationError(`Checkpoint ${label} is invalid.`);
}

function validateSocialState(value: unknown): void {
  if (!isRecord(value) || !Array.isArray(value.groups))
    throw new CheckpointValidationError('Checkpoint social state is invalid.');
  assertNonNegativeInteger(value.nextGroupId, 'social.nextGroupId');
  assertNonNegativeInteger(value.nextEventId, 'social.nextEventId');
  const memberships = new Set<string>();
  for (const candidate of value.groups) {
    if (
      !isRecord(candidate) ||
      typeof candidate.id !== 'string' ||
      !Array.isArray(candidate.memberIds) ||
      candidate.memberIds.length < 2 ||
      candidate.memberIds.length > 8 ||
      !candidate.memberIds.every((id) => typeof id === 'string')
    )
      throw new CheckpointValidationError('Checkpoint social group is invalid.');
    for (const id of candidate.memberIds) {
      if (memberships.has(id))
        throw new CheckpointValidationError('Checkpoint social membership is duplicated.');
      memberships.add(id);
    }
  }
}

function validateCulturalHistoryState(value: unknown): void {
  if (
    !isRecord(value) ||
    !isRecord(value.discovered) ||
    !isRecord(value.currentlyKnown) ||
    !isRecord(value.counters) ||
    !Array.isArray(value.milestones) ||
    !Array.isArray(value.summaries)
  )
    throw new CheckpointValidationError('Checkpoint cultural history state is invalid.');
  assertNonNegativeInteger(value.nextEventId, 'culturalHistory.nextEventId');
  assertNonNegativeInteger(value.summariesDiscarded, 'culturalHistory.summariesDiscarded');
}
