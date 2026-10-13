import { createStartingPopulation } from '@/simulation/agents/Hominin';
import { ageAgent, markDead } from '@/simulation/agents/lifecycle';
import { EventDetector } from '@/simulation/analytics/eventDetector';
import { EvolutionHistoryRecorder } from '@/simulation/analytics/evolutionHistory';
import { createGenerationTelemetry } from '@/simulation/analytics/generationDiagnostics';
import { createGenerationSummary } from '@/simulation/analytics/generationSummary';
import { summarizeEnvironment } from '@/simulation/analytics/populationStats';
import { recentEvents } from '@/simulation/analytics/simulationEvent';
import { BehaviourEngine } from '@/simulation/behaviour/BehaviourEngine';
import {
  cloneCheckpoint,
  engineCheckpointSchemaVersion,
  engineCheckpointVersion,
  type EngineCheckpointV1,
  validateCheckpoint,
  migrateCheckpoint,
} from '@/simulation/checkpoints/engine-checkpoint';
import { stepAgent } from '@/simulation/engine/agentTickSystem';
import { regionFor } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import {
  createSimulationConfig,
  type SimulationConfig,
} from '@/simulation/engine/simulationConfig';
import {
  cloneAgent,
  cloneAgentInspector,
  snapshotAgent,
  snapshotAgentDetail,
  snapshotAgentInspector,
  snapshotPopulationAgent,
} from '@/simulation/engine/snapshots';
import { AgentSpatialIndex } from '@/simulation/engine/spatialIndex';
import type {
  AgentDebugTrace,
  AgentDetailSnapshot,
  AgentInspectorSnapshot,
  EvolutionHistorySnapshot,
  CulturalSnapshot,
  GenerationSummary,
  GenerationTelemetry,
  Hominin,
  LineageRegistrySnapshot,
  PopulationDataSnapshot,
  Predator,
  SimulationEvent,
  SimulationSnapshot,
  World,
  WorldSnapshot,
  SocialEvent,
  SocialSnapshot,
  LearningEvent,
} from '@/simulation/engine/types';
import { reproducePopulation } from '@/simulation/evolution/reproduction';
import { EnvironmentInterventionManager } from '@/simulation/interventions/intervention-manager';
import type {
  EnvironmentInterventionCommand,
  EnvironmentInterventionSnapshot,
} from '@/simulation/interventions/intervention-types';
import { CulturalHistory } from '@/simulation/learning/CulturalHistory';
import { imitateNearby } from '@/simulation/learning/imitationSystem';
import { LineageRegistry } from '@/simulation/lineage/LineageRegistry';
import { createPredators } from '@/simulation/predators/Predator';
import { updatePredators } from '@/simulation/predators/predatorSystem';
import { scenarios } from '@/simulation/scenarios';
import { SocialSystem, socialMetrics } from '@/simulation/social/SocialSystem';
import { createWorld } from '@/simulation/world/createWorld';
import { regenerateResources } from '@/simulation/world/resourceSystem';

export class SimulationEngine {
  private readonly config: SimulationConfig;
  private readonly rng: SeededRng;
  private readonly world: World;
  private readonly predators;
  private readonly behaviourEngine: BehaviourEngine;
  private readonly eventDetector: EventDetector;
  private population: Hominin[];
  private readonly history: EvolutionHistoryRecorder;
  private readonly lineage: LineageRegistry;
  private readonly interventions: EnvironmentInterventionManager;
  private debugTrace: AgentDebugTrace[] = [];
  private deathsThisGeneration: Hominin[] = [];
  private birthsThisGeneration = 0;
  private telemetry: GenerationTelemetry = createGenerationTelemetry();
  private generationStartPositions = new Map<string, { x: number; y: number }>();
  private deceasedAgentSnapshots = new Map<string, AgentInspectorSnapshot>();
  private nextAgentId = 0;
  private tick = 0;
  private generation = 0;
  private readonly social: SocialSystem;
  private readonly culturalHistory: CulturalHistory;

  constructor(config: Partial<SimulationConfig> = {}, checkpoint?: EngineCheckpointV1) {
    if (checkpoint) {
      validateCheckpoint(checkpoint);
      const restored = migrateCheckpoint(checkpoint);
      this.config = createSimulationConfig(restored.config);
      this.rng = new SeededRng(restored.seed);
      this.rng.restoreState(restored.state.rng);
      this.world = restored.state.world;
      this.predators = restored.state.predators;
      this.population = restored.state.population.map(cloneAgent);
      this.history = new EvolutionHistoryRecorder(
        this.config.analytics.historyGenerationLimit,
        this.config.analytics.historyEventLimit,
      );
      this.history.restoreState(restored.state.history);
      this.lineage = new LineageRegistry();
      this.lineage.restoreState(restored.state.lineage);
      this.interventions = new EnvironmentInterventionManager(
        {
          foodRegeneration: this.world.baselineFoodRegeneration,
          waterRegeneration: this.world.baselineWaterRegeneration,
          predatorCount: this.config.world.predatorCount,
        },
        this.config.analytics.historyEventLimit,
        this.config.time.ticksPerGeneration,
      );
      this.interventions.restoreState(restored.state.interventions, this.world);
      this.eventDetector = new EventDetector();
      this.eventDetector.restoreState(restored.state.eventDetector);
      this.behaviourEngine = new BehaviourEngine(this.config, this.rng);
      this.social = new SocialSystem(this.config.memory.relationshipLimit);
      this.social.restoreState(restored.state.social);
      this.culturalHistory = new CulturalHistory();
      this.culturalHistory.restoreState(restored.state.culturalHistory);
      if (!restored.state.culturalHistory) this.culturalHistory.bootstrap(this.population);
      this.debugTrace = restored.state.debugTrace;
      this.deathsThisGeneration = restored.state.deathsThisGeneration.map(cloneAgent);
      this.birthsThisGeneration = restored.state.birthsThisGeneration;
      this.telemetry = restored.state.telemetry;
      this.generationStartPositions = new Map(restored.state.generationStartPositions);
      this.deceasedAgentSnapshots = new Map(
        restored.state.deceasedAgentSnapshots.map(([id, snapshot]) => [
          id,
          cloneAgentInspector(snapshot),
        ]),
      );
      this.nextAgentId = restored.state.nextAgentId;
      this.tick = restored.tick;
      this.generation = restored.generation;
      return;
    }
    this.config = createSimulationConfig(config);
    this.history = new EvolutionHistoryRecorder(
      this.config.analytics.historyGenerationLimit,
      this.config.analytics.historyEventLimit,
    );
    this.rng = new SeededRng(this.config.seed);
    this.eventDetector = new EventDetector();
    this.lineage = new LineageRegistry();
    this.world = createWorld(this.config, this.rng);
    scenarios[this.config.scenario].configureWorld(this.world, this.config);
    this.interventions = new EnvironmentInterventionManager(
      {
        foodRegeneration: this.world.baselineFoodRegeneration,
        waterRegeneration: this.world.baselineWaterRegeneration,
        predatorCount: this.config.world.predatorCount,
      },
      this.config.analytics.historyEventLimit,
      this.config.time.ticksPerGeneration,
    );
    this.population = createStartingPopulation(this.config, this.rng, this.world);
    for (const founder of this.population) this.lineage.recordFounder(founder);
    this.generationStartPositions = new Map(
      this.population.map((agent) => [agent.id, { ...agent.position }]),
    );
    this.predators = createPredators(this.config.world.predatorCount, this.world, this.rng);
    this.behaviourEngine = new BehaviourEngine(this.config, this.rng);
    this.social = new SocialSystem(this.config.memory.relationshipLimit);
    this.culturalHistory = new CulturalHistory();
  }

  static restoreCheckpoint(checkpoint: EngineCheckpointV1): SimulationEngine {
    validateCheckpoint(checkpoint);
    return new SimulationEngine(checkpoint.config, checkpoint);
  }

  exportCheckpoint(): EngineCheckpointV1 {
    return cloneCheckpoint({
      schemaVersion: engineCheckpointSchemaVersion,
      engineVersion: engineCheckpointVersion,
      seed: String(this.config.seed),
      tick: this.tick,
      generation: this.generation,
      config: this.config,
      state: {
        rng: this.rng.exportState(),
        world: this.world,
        predators: this.predators.map(clonePredator),
        population: this.population.map(cloneAgent),
        history: this.history.exportState(),
        lineage: this.lineage.exportState(),
        interventions: this.interventions.exportState(),
        eventDetector: this.eventDetector.exportState(),
        debugTrace: [...this.getDebugTrace()],
        deathsThisGeneration: this.deathsThisGeneration.map(cloneAgent),
        birthsThisGeneration: this.birthsThisGeneration,
        telemetry: this.telemetry,
        generationStartPositions: [...this.generationStartPositions.entries()].map(
          ([id, position]) => [id, { ...position }],
        ),
        deceasedAgentSnapshots: [...this.deceasedAgentSnapshots.entries()].map(([id, snapshot]) => [
          id,
          cloneAgentInspector(snapshot),
        ]),
        nextAgentId: this.nextAgentId,
        social: this.social.exportState(),
        culturalHistory: this.culturalHistory.exportState(),
      },
    });
  }

  step(): void {
    if (this.population.length === 0) return;
    this.tick += 1;
    this.history.recordEvents(
      scenarios[this.config.scenario].update(this.world, this.generation, this.tick, this.config),
    );
    this.history.recordEvents(
      this.interventions.processTick(this.tick, this.generation, this.world),
    );
    const active = this.population.filter((agent) => agent.alive);
    const spatialIndex = new AgentSpatialIndex(active);
    this.history.recordEvents(this.social.update(active, this.world, this.tick, this.generation));
    for (const agent of active) {
      const result = stepAgent({
        agent,
        nearby: spatialIndex.query(agent.position, agent.phenotype.visionRange),
        predators: this.predators,
        world: this.world,
        behaviourEngine: this.behaviourEngine,
        config: this.config,
        rng: this.rng,
        tick: this.tick,
        debug: this.config.debug.agentId === agent.id,
      });
      if (result.debug) {
        this.debugTrace.push(result.debug);
        if (this.debugTrace.length > this.config.debug.maxEntries) this.debugTrace.shift();
      }
      if (result.deathCause)
        this.kill(agent, result.deathCause, 'Health declined after sustained unmet needs.');
      this.telemetry.foodConsumed += result.foodConsumed;
      this.telemetry.waterConsumed += result.waterConsumed;
      if (result.eligibleToolOpportunity) this.telemetry.eligibleToolOpportunities += 1;
      if (result.toolDiscovered) this.telemetry.toolDiscoveries += 1;
      if (result.successfulToolUse) this.telemetry.successfulToolUses += 1;
      this.telemetry.toolCalories += result.toolCalories;
      for (const behaviour of result.newlyAcquired) {
        const events = this.culturalHistory.recordDiscovery(
          behaviour,
          agent.id,
          this.tick,
          this.generation,
          agent.groupId,
        );
        this.history.recordEvents(events);
        this.telemetry.learningAcquisitions += 1;
      }
      for (const practice of result.practice)
        this.history.recordEvents(
          this.culturalHistory.recordPractice(
            practice.behaviour,
            agent.id,
            practice.before,
            practice.after,
            practice.successful,
            this.tick,
            this.generation,
          ),
        );
      if (result.socialAction) {
        const target = active.find((candidate) => candidate.id === result.socialAction?.targetId);
        if (target)
          this.history.recordEvents([
            this.social.recordAction(
              agent,
              target,
              result.socialAction.type,
              this.tick,
              this.generation,
              result.socialAction.quantity,
              result.socialAction.success,
            ),
          ]);
      }
    }
    const learningInteractions = imitateNearby(
      active,
      (agent) => spatialIndex.query(agent.position, this.config.learning.observationRadius),
      this.world,
      this.rng,
      this.tick,
      this.config,
    );
    this.history.recordEvents(
      this.culturalHistory.recordInteractions(learningInteractions, this.tick, this.generation),
    );
    this.telemetry.learningObservations += learningInteractions.length;
    this.telemetry.learningAttempts += learningInteractions.filter((item) => item.attempted).length;
    this.telemetry.learningAcquisitions += learningInteractions.filter(
      (item) => item.acquired,
    ).length;
    this.telemetry.learningTransmissions += learningInteractions.filter(
      (item) => item.acquired,
    ).length;
    this.telemetry.learningDemonstrations += learningInteractions.filter(
      (item) => item.demonstrated,
    ).length;
    for (const victim of updatePredators(this.predators, active, this.world, this.rng))
      this.kill(victim, 'predation', 'Caught during a predator chase.');
    this.history.recordEvents(
      this.culturalHistory.reconcile(this.population, this.tick, this.generation),
    );
    const produced = regenerateResources(this.world);
    this.telemetry.foodProduced += produced.food;
    this.telemetry.waterProduced += produced.water;
    this.updateRelocation(active);
    this.attemptReproduction();
    this.history.recordEvents(
      this.eventDetector.detectExtinction(
        this.population.filter((agent) => agent.alive).length,
        this.generation,
        this.tick,
      ),
    );
    if (this.tick % this.config.time.ticksPerGeneration === 0) this.completeGeneration();
  }

  runTicks(count: number): void {
    for (let index = 0; index < count && this.population.length > 0; index += 1) this.step();
  }

  runUntilGeneration(generation: number): void {
    if (generation < this.generation) return;
    while (this.generation < generation && this.population.length > 0) this.step();
  }

  getSnapshot(): SimulationSnapshot {
    return {
      tick: this.tick,
      generation: this.generation,
      populationSize: this.population.filter((agent) => agent.alive).length,
      aliveAgents: this.population.filter((agent) => agent.alive).map(snapshotAgent),
      worldSummary: summarizeEnvironment(this.world, this.predators.length),
      latestStats: this.history.getSummaries().at(-1) ?? null,
      recentEvents: recentEvents(this.history.getEvents()),
    };
  }

  getGenerationSummaries(): GenerationSummary[] {
    return this.history.getSummaries();
  }

  getLatestGenerationSummaries(limit: number): GenerationSummary[] {
    return this.history.getSummaries().slice(-Math.max(0, limit));
  }

  getWorldSnapshot(): WorldSnapshot {
    return {
      width: this.world.width,
      height: this.world.height,
      tiles: this.world.tiles.map((tile) => ({
        terrain: tile.terrain,
        food: tile.food,
        foodCapacity: tile.foodCapacity,
        water: tile.water,
        waterCapacity: tile.waterCapacity,
        hardFood: tile.hardFood,
        objects: [...tile.objects],
      })),
      predators: this.predators.map((predator) => ({
        id: predator.id,
        position: { ...predator.position },
        state: predator.state,
      })),
    };
  }

  getAgentDetailSnapshot(id: string): AgentDetailSnapshot | null {
    const agent = this.population.find((candidate) => candidate.alive && candidate.id === id);
    return agent ? snapshotAgentDetail(agent) : null;
  }

  getAgentInspectorSnapshot(id: string): AgentInspectorSnapshot | null {
    const agent = this.population.find((candidate) => candidate.id === id);
    if (agent) return this.inspectorSnapshot(agent);
    const archived = this.deceasedAgentSnapshots.get(id);
    return archived ? cloneAgentInspector(archived) : null;
  }
  getEvents(): SimulationEvent[] {
    return this.history.getEvents();
  }
  getEvolutionHistorySnapshot(): EvolutionHistorySnapshot {
    return this.history.snapshot(
      this.tick,
      this.generation,
      this.population.filter((agent) => agent.alive).length,
    );
  }
  getPopulationDataSnapshot(): PopulationDataSnapshot {
    return {
      ...this.getEvolutionHistorySnapshot(),
      birthsThisGeneration: this.birthsThisGeneration,
      deathsThisGeneration: this.deathsThisGeneration.length,
      living: this.population.filter((agent) => agent.alive).map(snapshotPopulationAgent),
    };
  }
  getSocialSnapshot(): SocialSnapshot {
    const agents = this.population.filter((agent) => agent.alive);
    const events = this.history
      .getEvents()
      .filter(
        (event): event is SocialEvent =>
          event.type.startsWith('social') ||
          event.type === 'cooperativeForaging' ||
          event.type === 'foodShared',
      );
    const groups = this.social.getGroups();
    return {
      currentTick: this.tick,
      currentGeneration: this.generation,
      groups,
      agents: agents.map(snapshotAgentInspector),
      events,
      metrics: socialMetrics(agents, groups, events),
    };
  }
  getCulturalSnapshot(): CulturalSnapshot {
    const events = this.history
      .getEvents()
      .filter((event): event is LearningEvent => isLearningEvent(event));
    return this.culturalHistory.snapshot(this.population, events, this.tick, this.generation);
  }
  getLineageRegistrySnapshot(): LineageRegistrySnapshot {
    return this.lineage.snapshot(this.tick, this.generation);
  }
  scheduleEnvironmentInterventions(
    commands: readonly EnvironmentInterventionCommand[],
  ): EnvironmentInterventionSnapshot {
    this.interventions.schedule(commands, this.tick, this.generation);
    return this.getEnvironmentInterventionSnapshot();
  }
  cancelEnvironmentIntervention(id: string): EnvironmentInterventionSnapshot {
    if (this.interventions.cancel(id, this.tick, this.generation, this.world)) {
      const event = this.interventions.cancellationEvent(id, this.tick, this.generation);
      if (event) this.history.recordEvents([event]);
    }
    return this.getEnvironmentInterventionSnapshot();
  }
  getEnvironmentInterventionSnapshot(): EnvironmentInterventionSnapshot {
    return this.interventions.snapshot(this.tick, this.generation, this.world);
  }
  getPopulation(): readonly Hominin[] {
    return this.population.map(cloneAgent);
  }

  getDebugTrace(): readonly AgentDebugTrace[] {
    return this.debugTrace.map((entry) => ({
      ...entry,
      needsBefore: { ...entry.needsBefore },
      needsAfter: { ...entry.needsAfter },
      visible: { ...entry.visible },
      recalledMemoryIds: [...entry.recalledMemoryIds],
      scores: { ...entry.scores },
    }));
  }

  private completeGeneration(): void {
    this.generation += 1;
    for (const agent of this.population.filter((item) => item.alive)) {
      const cause = ageAgent(agent, this.rng);
      if (cause) this.kill(agent, cause);
    }
    const previousSummary = this.history.getSummaries().at(-1);
    const summary = createGenerationSummary({
      generation: this.generation,
      population: this.population,
      births: this.birthsThisGeneration,
      deaths: this.deathsThisGeneration,
      world: this.world,
      predatorCount: this.predators.length,
      telemetry: this.telemetry,
      config: this.config,
      generationStartPositions: this.generationStartPositions,
      ...(previousSummary ? { previousCentroid: previousSummary.migration.centroid } : {}),
    });
    this.history.recordSummary(summary);
    this.history.recordEvents(
      this.eventDetector.detect(
        summary,
        this.history.getSummaries(),
        this.population,
        this.tick,
        this.config,
      ),
    );
    this.culturalHistory.completeGeneration(this.population, this.generation);
    this.population = this.population.filter((agent) => agent.alive);
    this.history.recordEvents(
      this.social.update(this.population, this.world, this.tick, this.generation),
    );
    this.generationStartPositions = new Map(
      this.population.map((agent) => [agent.id, { ...agent.position }]),
    );
    this.birthsThisGeneration = 0;
    this.deathsThisGeneration = [];
    this.telemetry = createGenerationTelemetry();
  }

  private attemptReproduction(): void {
    const chancePerTick =
      1 -
      Math.pow(
        1 - this.config.reproduction.chancePerGeneration,
        1 / this.config.time.ticksPerGeneration,
      );
    const result = reproducePopulation({
      population: this.population,
      generation: this.generation + 1,
      tick: this.tick,
      rng: this.rng,
      config: this.config,
      nextId: () => `g${this.generation + 1}-${this.nextAgentId++}`,
      chance: chancePerTick,
    });
    this.population.push(...result.births);
    for (const child of result.births) this.lineage.recordBirth(child, this.tick);
    this.birthsThisGeneration += result.births.length;
    this.telemetry.reproductionAttempts += result.attempts;
    for (const reason of Object.keys(result.failures) as (keyof typeof result.failures)[])
      this.telemetry.reproductionFailures[reason] += result.failures[reason];
    this.telemetry.parentAgeTotal += result.parentAgeTotal;
    this.telemetry.reproducingParents += result.reproducingParents;
  }

  private kill(agent: Hominin, cause: Parameters<typeof markDead>[1], context?: string): void {
    if (!agent.alive) return;
    markDead(agent, cause, this.tick, context);
    this.deceasedAgentSnapshots.set(agent.id, this.inspectorSnapshot(agent));
    this.lineage.recordDeath(agent);
    this.deathsThisGeneration.push(agent);
  }

  private inspectorSnapshot(agent: Hominin): AgentInspectorSnapshot {
    const snapshot = snapshotAgentInspector(agent);
    return {
      ...snapshot,
      socialEvents: this.history
        .getEvents()
        .filter(
          (event): event is SocialEvent =>
            'participantIds' in event && event.participantIds.includes(agent.id),
        )
        .map((event) => ({ ...event, participantIds: [...event.participantIds] })),
      learningEvents: this.history
        .getEvents()
        .filter(
          (event): event is LearningEvent =>
            isLearningEvent(event) &&
            (event.agentId === agent.id || event.sourceAgentId === agent.id),
        )
        .map((event) => ({ ...event })),
    };
  }

  private updateRelocation(population: readonly Hominin[]): void {
    for (const agent of population) {
      const current = regionFor(agent.position);
      if (current !== agent.homeRegion) agent.relocationTicks += 1;
      else agent.relocationTicks = Math.max(0, agent.relocationTicks - 1);
      if (agent.relocationTicks >= 8) {
        agent.previousHomeRegion = agent.homeRegion;
        agent.homeRegion = current;
      }
    }
  }
}

function isLearningEvent(event: SimulationEvent): event is LearningEvent {
  return [
    'behaviourDiscovered',
    'behaviourObserved',
    'imitationAttempted',
    'behaviourAcquired',
    'behaviourPracticed',
    'behaviourDemonstrated',
    'behaviourTransmitted',
    'behaviourLost',
    'behaviourRediscovered',
  ].includes(event.type);
}

function clonePredator(predator: Predator): Predator {
  return {
    ...predator,
    position: { ...predator.position },
    ...(predator.targetId ? { targetId: predator.targetId } : {}),
  };
}
