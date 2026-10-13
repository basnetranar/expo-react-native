export const traitNames = [
  'strength',
  'speed',
  'endurance',
  'dexterity',
  'vision',
  'metabolicEfficiency',
  'memoryPotential',
  'learningAbility',
  'socialSensitivity',
  'curiosity',
] as const;

export type TraitName = (typeof traitNames)[number];
export type TraitValue = number;
export type Genome = Readonly<Record<TraitName, TraitValue>>;
export type GenomeSummary = Record<TraitName, number>;
export type PhenotypeSummary = Record<TraitName, number> & {
  visionRange: number;
  cognitiveCost: number;
};

export interface Position {
  x: number;
  y: number;
}
export interface Needs {
  energy: number;
  hydration: number;
  safety: number;
}
export type LifeStage = 'juvenile' | 'youngAdult' | 'adult' | 'old';

export interface Phenotype extends PhenotypeSummary {
  lifeStage: LifeStage;
}

export type Terrain = 'plains' | 'scrub' | 'riverbank' | 'rocky';
export type WorldObject = 'stone';
export interface Tile {
  terrain: Terrain;
  food: number;
  foodCapacity: number;
  hardFood: number;
  hardFoodCapacity: number;
  water: number;
  waterCapacity: number;
  baselineWaterCapacity: number;
  cover: number;
  temperature: number;
  predatorRisk: number;
  objects: WorldObject[];
}

export interface World {
  width: number;
  height: number;
  tiles: Tile[];
  baselineFoodRegeneration: number;
  baselineWaterRegeneration: number;
  foodRegenerationMultiplier: number;
  interventionFoodMultiplier: number;
  interventionWaterMultiplier: number;
  predatorPressureMultiplier: number;
  activeWaterSources: number;
  resourcePressure: number;
}

export type MemoryType =
  'food' | 'water' | 'predator' | 'individual' | 'danger' | 'stone' | 'social';
export interface MemoryRecord {
  id: string;
  type: MemoryType;
  position?: Position;
  subjectId?: string;
  strength: number;
  createdAtTick: number;
  lastReinforcedTick: number;
}

export interface Relationship {
  agentId: string;
  familiarity: number;
  trust: number;
  /** -100 (avoidance) to 100 (strong positive association). */
  affinity: number;
  kinship: number;
  observedSuccess: number;
  followBenefits: number;
  interactionCount: number;
  firstInteractionTick: number | null;
  lastInteractionTick: number | null;
  cooperationCount: number;
  sharingCount: number;
  groomingCount: number;
}

export type LearnedBehaviourType = 'stoneCracking' | 'socialForaging';
export type AcquisitionSource = 'experimentation' | 'imitation' | 'teaching' | 'experience';
export interface LearnedBehaviour {
  type: LearnedBehaviourType;
  proficiency: number;
  reinforcement: number;
  learnedFrom?: string;
  firstLearnedAtTick: number;
  acquisitionSource: AcquisitionSource;
  practiceCount: number;
  successfulAttempts: number;
  failedAttempts: number;
  lastPracticedAtTick: number;
}

export interface LearningOpportunity {
  behaviour: LearnedBehaviourType;
  sourceAgentId: string;
  firstObservedAtTick: number;
  lastObservedAtTick: number;
  observationCount: number;
  attemptCount: number;
  failedAttempts: number;
  demonstrated: boolean;
}

export const behaviourTypes = [
  'eat',
  'drink',
  'explore',
  'moveToFoodMemory',
  'moveToWaterMemory',
  'flee',
  'follow',
  'observe',
  'cooperativeForage',
  'shareFood',
  'groom',
  'rest',
] as const;
export type BehaviourType = (typeof behaviourTypes)[number];
export type ActionOutcome = -1 | 0 | 1;

export type DeathCause = 'starvation' | 'dehydration' | 'predation' | 'age';
export interface DeathMetadata {
  cause: DeathCause;
  tick: number;
  age: number;
  generation: number;
  position: Position;
  keyTraits: Pick<Genome, 'speed' | 'endurance' | 'metabolicEfficiency' | 'learningAbility'>;
  context?: string;
}

export interface Hominin {
  id: string;
  generation: number;
  position: Position;
  readonly genome: Genome;
  phenotype: Phenotype;
  needs: Needs;
  memories: MemoryRecord[];
  relationships: Relationship[];
  learnedBehaviours: LearnedBehaviour[];
  actionPreferences: Partial<Record<BehaviourType, number>>;
  age: number;
  health: number;
  parents: readonly string[];
  children: string[];
  currentBehaviour: BehaviourType;
  alive: boolean;
  death?: DeathMetadata;
  zeroEnergyTicks: number;
  zeroHydrationTicks: number;
  homeRegion: string;
  previousHomeRegion: string;
  relocationTicks: number;
  lastBirthTick: number | null;
  demonstratedBehaviour: LearnedBehaviourType | null;
  demonstrableSuccess: number;
  /** Food already removed from the world and available for later transfer. */
  carriedFood: number;
  groupId: string | null;
  learningOpportunities: LearningOpportunity[];
}

export interface SocialGroup {
  id: string;
  memberIds: string[];
  formedTick: number;
  formedGeneration: number;
  lastActiveTick: number;
  memberLastSeen: Record<string, number>;
}

export type SocialEventType =
  | 'socialEncounter'
  | 'socialGroupFormed'
  | 'socialGroupJoined'
  | 'socialGroupLeft'
  | 'socialGroupDissolved'
  | 'cooperativeForaging'
  | 'foodShared'
  | 'socialGrooming'
  | 'socialConflict';

export interface SocialEvent extends EventBase {
  type: SocialEventType;
  participantIds: string[];
  groupId?: string;
  outcome?: 'success' | 'failed' | 'neutral';
  quantity?: number;
}

export type PredatorState = 'patrol' | 'detect' | 'chase' | 'rest';
export interface Predator {
  id: string;
  position: Position;
  state: PredatorState;
  targetId?: string;
  stamina: number;
  restTicks: number;
}

export interface EnvironmentSummary {
  food: number;
  hardFood: number;
  water: number;
  predatorCount: number;
  resourcePressure: number;
}

export type CultureStage =
  'absent' | 'innovation' | 'observed' | 'spreading' | 'cultural' | 'established';
export type BehaviourPrevalence = Record<LearnedBehaviourType, number>;

export type LifeStageCounts = Record<LifeStage, number>;
export type ReproductionFailureReason =
  'energy' | 'hydration' | 'health' | 'cooldown' | 'partner' | 'capacity';

export interface ReproductionDiagnostics {
  attempts: number;
  births: number;
  failures: Record<ReproductionFailureReason, number>;
  reproductiveAgePopulation: number;
  conditionReadyPopulation: number;
  localEligiblePairs: number;
  meanParentAge: number;
  meanOffspringPerReproductiveAdult: number;
}

export interface ResourceDiagnostics {
  foodPerAgent: number;
  waterPerAgent: number;
  depletedFoodPatches: number;
  depletedWaterSources: number;
  averageDistanceToFood: number;
  averageDistanceToWater: number;
  foodProduced: number;
  foodConsumed: number;
  waterProduced: number;
  waterConsumed: number;
  balance: 'surplus' | 'balanced' | 'deficit';
}

export interface ToolDiagnostics {
  eligibleDiscoveryOpportunities: number;
  discoveries: number;
  successfulUses: number;
  caloriesFromToolUse: number;
  users: number;
}

export interface MigrationDiagnostics {
  centroid: Position;
  centroidShift: number;
  meanDisplacement: number;
  changedRegionProportion: number;
  regionalOccupancy: Record<string, number>;
}

export interface GenerationTelemetry {
  foodProduced: number;
  foodConsumed: number;
  waterProduced: number;
  waterConsumed: number;
  reproductionAttempts: number;
  reproductionFailures: Record<ReproductionFailureReason, number>;
  parentAgeTotal: number;
  reproducingParents: number;
  eligibleToolOpportunities: number;
  toolDiscoveries: number;
  successfulToolUses: number;
  toolCalories: number;
  learningObservations: number;
  learningAttempts: number;
  learningAcquisitions: number;
  learningTransmissions: number;
  learningDemonstrations: number;
}

export interface CulturalBehaviourSummary {
  practitioners: number;
  adoption: number;
  averageProficiency: number;
  highestProficiency: number;
  newAcquisitions: number;
  observations: number;
  attempts: number;
  transmissions: number;
  demonstrations: number;
  independentDiscoveries: number;
  losses: number;
  rediscoveries: number;
  groups: Record<string, number>;
}

export interface CulturalGenerationSummary {
  generation: number;
  population: number;
  behaviours: Record<LearnedBehaviourType, CulturalBehaviourSummary>;
}

export interface GenerationSummary {
  generation: number;
  population: number;
  births: number;
  deaths: number;
  deathCauses: Record<DeathCause, number>;
  averageGenome: GenomeSummary;
  averagePhenotype: PhenotypeSummary;
  behaviourPrevalence: BehaviourPrevalence;
  environment: EnvironmentSummary;
  averageAge: number;
  migrationRate: number;
  lifeStages: LifeStageCounts;
  juvenileDeaths: number;
  adultDeaths: number;
  averageAgeAtDeath: number;
  reproduction: ReproductionDiagnostics;
  resources: ResourceDiagnostics;
  tools: ToolDiagnostics;
  migration: MigrationDiagnostics;
}

interface EventBase {
  id: string;
  tick: number;
  generation: number;
}
export type SimulationEvent =
  | (EventBase & { type: 'firstDiscovery'; behaviour: LearnedBehaviourType; agentId: string })
  | (EventBase & {
      type: 'culturalThreshold';
      behaviour: LearnedBehaviourType;
      stage: CultureStage;
      prevalence: number;
    })
  | (EventBase & {
      type: 'traditionLost';
      behaviour: LearnedBehaviourType;
      previousStage: CultureStage;
    })
  | (EventBase & {
      type: 'populationBottleneck';
      decline: number;
      fromPopulation: number;
      toPopulation: number;
    })
  | (EventBase & {
      type: 'migrationDetected';
      migrationRate: number;
      resourcePressure: number;
      centroidShift: number;
      meanDisplacement: number;
    })
  | (EventBase & { type: 'scenarioPhase'; phase: 'droughtStarted' | 'droughtEnded' })
  | (EventBase & {
      type: 'environmentIntervention';
      interventionId: string;
      interventionType: import('@/simulation/interventions/intervention-types').EnvironmentInterventionType;
      value: number;
      status: 'active' | 'completed' | 'cancelled';
    })
  | (EventBase & { type: 'extinction' })
  | LearningEvent
  | SocialEvent;

export type LearningEventType =
  | 'behaviourDiscovered'
  | 'behaviourObserved'
  | 'imitationAttempted'
  | 'behaviourAcquired'
  | 'behaviourPracticed'
  | 'behaviourDemonstrated'
  | 'behaviourTransmitted'
  | 'behaviourLost'
  | 'behaviourRediscovered';

export interface LearningEvent extends EventBase {
  type: LearningEventType;
  behaviour: LearnedBehaviourType;
  agentId?: string;
  sourceAgentId?: string;
  groupId?: string;
  outcome?: 'success' | 'failed' | 'observed';
  proficiencyBefore?: number;
  proficiencyAfter?: number;
}

export interface SocialMetrics {
  activeGroups: number;
  groupSizes: number[];
  groupedIndividuals: number;
  solitaryIndividuals: number;
  activeRelationships: number;
  positiveRelationships: number;
  neutralRelationships: number;
  negativeRelationships: number;
  isolatedIndividuals: number;
  averageFamiliarity: number;
  averageTrust: number;
  cooperativeForagingEvents: number;
  foodSharingEvents: number;
  groomingEvents: number;
  groupFormationEvents: number;
  groupDissolutionEvents: number;
}

export interface SocialSnapshot {
  currentTick: number;
  currentGeneration: number;
  groups: readonly SocialGroup[];
  agents: readonly AgentInspectorSnapshot[];
  events: readonly SocialEvent[];
  metrics: SocialMetrics;
}

export interface BehaviourCultureSnapshot {
  behaviour: LearnedBehaviourType;
  historicallyDiscovered: boolean;
  currentlyKnown: boolean;
  practitioners: readonly AgentInspectorSnapshot[];
  adoption: number;
  averageProficiency: number;
  highestProficiency: number;
  groups: Readonly<Record<string, number>>;
  firstDiscovery?: LearningEvent;
  events: readonly LearningEvent[];
}

export interface CulturalSnapshot {
  currentTick: number;
  currentGeneration: number;
  population: number;
  behaviours: readonly BehaviourCultureSnapshot[];
  events: readonly LearningEvent[];
  milestones: readonly LearningEvent[];
  summaries: readonly CulturalGenerationSummary[];
  retention: {
    summaryLimit: number;
    milestoneLimit: number;
    summariesDiscarded: number;
    eventsRecorded: number;
  };
}

export interface AgentSnapshot {
  id: string;
  generation: number;
  position: Position;
  age: number;
  health: number;
  needs: Needs;
  phenotype: Phenotype;
  currentBehaviour: BehaviourType;
  learnedBehaviours: readonly LearnedBehaviour[];
}

export interface PopulationAgentSnapshot extends AgentSnapshot {
  genome: Genome;
}

export interface PopulationDataSnapshot extends EvolutionHistorySnapshot {
  birthsThisGeneration: number;
  deathsThisGeneration: number;
  living: readonly PopulationAgentSnapshot[];
}

export interface LineageRecord {
  id: string;
  parentIds: readonly string[];
  birthTick: number | null;
  birthGeneration: number;
  genome: Genome;
  deathTick?: number;
  deathCause?: DeathCause;
}

export interface LineageRegistrySnapshot {
  currentTick: number;
  currentGeneration: number;
  records: readonly LineageRecord[];
  retention: {
    policy: 'active-session-unbounded';
    recordsDiscarded: 0;
  };
}

export interface SimulationSnapshot {
  tick: number;
  generation: number;
  populationSize: number;
  aliveAgents: AgentSnapshot[];
  worldSummary: EnvironmentSummary;
  latestStats: GenerationSummary | null;
  recentEvents: SimulationEvent[];
}

export interface EvolutionHistorySnapshot {
  currentTick: number;
  currentGeneration: number;
  currentPopulation: number;
  summaries: readonly GenerationSummary[];
  events: readonly SimulationEvent[];
  retention: {
    generationLimit: number;
    eventLimit: number;
    generationsDiscarded: number;
    eventsDiscarded: number;
  };
}

export interface WorldTileSnapshot {
  terrain: Terrain;
  food: number;
  foodCapacity: number;
  water: number;
  waterCapacity: number;
  hardFood: number;
  objects: readonly WorldObject[];
}

export interface WorldSnapshot {
  width: number;
  height: number;
  tiles: readonly WorldTileSnapshot[];
  predators: readonly Pick<Predator, 'id' | 'position' | 'state'>[];
}

export interface AgentDetailSnapshot extends AgentSnapshot {
  traits: Pick<Genome, 'memoryPotential' | 'learningAbility' | 'curiosity' | 'socialSensitivity'>;
  childrenCount: number;
  groupId: string | null;
}

export interface AgentInspectorSnapshot extends AgentSnapshot {
  alive: boolean;
  genome: Genome;
  memories: readonly MemoryRecord[];
  relationships: readonly Relationship[];
  actionPreferences: Partial<Record<BehaviourType, number>>;
  parents: readonly string[];
  children: readonly string[];
  death?: DeathMetadata;
  carriedFood: number;
  groupId: string | null;
  socialEvents: readonly SocialEvent[];
  learningOpportunities: readonly LearningOpportunity[];
  learningEvents: readonly LearningEvent[];
}

export interface AgentDebugTrace {
  tick: number;
  agentId: string;
  needsBefore: Needs;
  visible: {
    food: boolean;
    water: boolean;
    predator: boolean;
    hominins: number;
    stone: boolean;
  };
  recalledMemoryIds: string[];
  scores: Record<BehaviourType, number>;
  chosenBehaviour: BehaviourType;
  outcome: ActionOutcome;
  needsAfter: Needs;
}
