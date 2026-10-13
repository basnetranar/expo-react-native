import type { AppStateStatus } from 'react-native';

import type { HistoryRepository } from '@/features/histories/services/history-repository';
import type { HistoriesSnapshot } from '@/features/histories/types';
import type {
  SimulationSessionSnapshot,
  SimulationSessionUpdate,
  SimulationSpeed,
  SimulationStatus,
  TerrainMacroCell,
  SelectedAgentSnapshot,
} from '@/features/simulation/types';
import { projectTerrain, projectWorld } from '@/features/simulation/utils/world-projection';
import {
  type AgentInspectorSnapshot,
  createSimulationConfig,
  type EvolutionHistorySnapshot,
  type EnvironmentInterventionCommand,
  type EnvironmentInterventionSnapshot,
  type LineageRegistrySnapshot,
  type PopulationDataSnapshot,
  type SocialSnapshot,
  type CulturalSnapshot,
  SimulationEngine,
  type SimulationConfig,
} from '@/simulation';

type Listener = (update: SimulationSessionUpdate) => void;
type Timer = ReturnType<typeof setInterval>;

interface Scheduler {
  setInterval(callback: () => void, milliseconds: number): Timer;
  clearInterval(timer: Timer): void;
}

const scheduler: Scheduler = {
  setInterval: (callback, milliseconds) => setInterval(callback, milliseconds),
  clearInterval: (timer) => clearInterval(timer),
};

const loopIntervalMs = 20;
const publishIntervalMs = 200;
const maximumSliceWorkMs = 12;

export class SimulationSessionController {
  private engine: SimulationEngine;
  private config: SimulationConfig;
  private readonly scheduler: Scheduler;
  private readonly listeners = new Set<Listener>();
  private timer: Timer | null = null;
  private status: SimulationStatus = 'idle';
  private speed: SimulationSpeed = 1;
  private selectedAgentId: string | null = null;
  private peakPopulation = 0;
  private terrainCells: readonly TerrainMacroCell[] = [];
  private disposed = false;
  private selectedAgentCache: SelectedAgentSnapshot | null = null;
  private tickAccumulator = 0;
  private publishAccumulatorMs = 0;
  private pausedViewDepth = 0;
  private resumeAfterPausedView = false;
  private appState: AppStateStatus = 'active';
  private lastEnvironmentSubmission: { tick: number; key: string } | null = null;
  private histories: HistoryRepository | null = null;
  private activeBranchId: string | null = null;
  private historyOperation: Promise<void> = Promise.resolve();
  private historiesInitializing = false;

  constructor(
    config: Partial<SimulationConfig> = {},
    customScheduler: Scheduler = scheduler,
    historyRepository?: HistoryRepository,
  ) {
    this.config = createSimulationConfig(config);
    this.engine = new SimulationEngine(this.config);
    this.scheduler = customScheduler;
    this.histories = historyRepository ?? null;
  }

  initialize(): SimulationSessionUpdate {
    this.assertActive();
    const world = this.engine.getWorldSnapshot();
    this.terrainCells = projectTerrain(world);
    this.selectedAgentId = this.engine.getSnapshot().aliveAgents[0]?.id ?? null;
    this.status = 'paused';
    const update = this.createUpdate(world);
    this.emit(update);
    return update;
  }

  async initializeHistories(
    createdAt = new Date().toISOString(),
    options: { requireExisting?: boolean } = {},
  ): Promise<HistoriesSnapshot> {
    this.assertActive();
    this.historiesInitializing = true;
    if (!this.histories) throw new Error('History persistence is not configured.');
    try {
      const repository = this.histories;
      const snapshot = await repository.initialize(
        this.engine.exportCheckpoint(),
        createdAt,
        options,
      );
      const checkpoint = await repository.loadActiveCheckpoint();
      this.activeBranchId = snapshot.activeBranchId;
      this.replaceEngine(checkpoint);
      this.emit(this.createUpdate());
      return repository.getSnapshot();
    } finally {
      this.historiesInitializing = false;
    }
  }

  getHistoriesSnapshot(): HistoriesSnapshot | null {
    return this.histories?.getSnapshot() ?? null;
  }

  getConfig(): SimulationConfig {
    return structuredClone(this.config);
  }

  createHistoryCheckpoint(label: string, createdAt = new Date().toISOString()) {
    return this.queueHistoryOperation(async () => {
      const repository = this.requireHistories();
      const branchId = this.requireActiveBranchId();
      const checkpoint = this.engine.exportCheckpoint();
      await repository.saveHead(branchId, checkpoint, this.branchStatus());
      return repository.createCheckpoint(branchId, label, checkpoint, createdAt);
    });
  }

  createHistoryBranch(checkpointId: string, name: string, createdAt = new Date().toISOString()) {
    return this.queueHistoryOperation(() =>
      this.requireHistories().createBranch(checkpointId, name, createdAt),
    );
  }

  switchHistoryBranch(branchId: string) {
    return this.queueHistoryOperation(async () => {
      const repository = this.requireHistories();
      const sourceId = this.requireActiveBranchId();
      this.pause();
      await repository.saveHead(sourceId, this.engine.exportCheckpoint(), this.branchStatus());
      const checkpoint = await repository.switchActive(branchId);
      this.activeBranchId = branchId;
      this.replaceEngine(checkpoint);
      this.emit(this.createUpdate());
      return repository.getSnapshot();
    });
  }

  renameHistoryBranch(branchId: string, name: string) {
    return this.queueHistoryOperation(() => this.requireHistories().renameBranch(branchId, name));
  }

  renameHistoryCheckpoint(checkpointId: string, label: string) {
    return this.queueHistoryOperation(() =>
      this.requireHistories().renameCheckpoint(checkpointId, label),
    );
  }

  persistActiveHistory() {
    return this.queueHistoryOperation(async () => {
      if (!this.histories || !this.activeBranchId) return null;
      return this.histories.saveHead(
        this.activeBranchId,
        this.engine.exportCheckpoint(),
        this.branchStatus(),
      );
    });
  }

  deleteHistoryBranch(branchId: string) {
    return this.queueHistoryOperation(() => this.requireHistories().deleteBranch(branchId));
  }

  deleteHistoryCheckpoint(checkpointId: string) {
    return this.queueHistoryOperation(() => this.requireHistories().deleteCheckpoint(checkpointId));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  start(): void {
    this.resume();
  }

  resume(): void {
    this.assertActive();
    if (this.status === 'extinct' || this.timer || this.historiesInitializing) return;
    this.status = 'running';
    this.emit(this.createUpdate());
    this.timer = this.scheduler.setInterval(() => this.advanceSlice(), loopIntervalMs);
  }

  pause(): void {
    if (this.disposed || this.status === 'extinct') return;
    this.stopLoop();
    this.status = 'paused';
    this.emit(this.createUpdate());
  }

  setSpeed(speed: SimulationSpeed): void {
    this.assertActive();
    this.speed = speed;
    this.emit(this.createUpdate());
  }

  selectAgent(id: string | null): void {
    this.assertActive();
    this.selectedAgentId = id;
    this.selectedAgentCache = null;
    this.emit(this.createUpdate());
  }

  handleAppState(status: AppStateStatus): void {
    this.appState = status;
    if (status !== 'active' && this.status === 'running') this.pause();
    if (status !== 'active') void this.persistActiveHistory();
  }

  beginInspection(id: string): AgentInspectorSnapshot | null {
    this.assertActive();
    this.beginPausedView();
    return this.engine.getAgentInspectorSnapshot(id);
  }

  endInspection(): void {
    this.endPausedView();
  }

  beginTimeline(): EvolutionHistorySnapshot {
    this.assertActive();
    this.beginPausedView();
    return this.engine.getEvolutionHistorySnapshot();
  }

  endTimeline(): void {
    this.endPausedView();
  }

  beginLineage(): LineageRegistrySnapshot {
    this.assertActive();
    this.beginPausedView();
    return this.engine.getLineageRegistrySnapshot();
  }

  endLineage(): void {
    this.endPausedView();
  }

  beginSocial(): SocialSnapshot {
    this.assertActive();
    this.beginPausedView();
    return this.engine.getSocialSnapshot();
  }

  endSocial(): void {
    this.endPausedView();
  }

  beginLearning(): CulturalSnapshot {
    this.assertActive();
    this.beginPausedView();
    return this.engine.getCulturalSnapshot();
  }

  endLearning(): void {
    this.endPausedView();
  }

  getCulturalSnapshot(): CulturalSnapshot {
    this.assertActive();
    return this.engine.getCulturalSnapshot();
  }

  getSocialSnapshot(): SocialSnapshot {
    this.assertActive();
    return this.engine.getSocialSnapshot();
  }

  getLineageRegistrySnapshot(): LineageRegistrySnapshot {
    this.assertActive();
    return this.engine.getLineageRegistrySnapshot();
  }

  getEvolutionHistorySnapshot(): EvolutionHistorySnapshot {
    this.assertActive();
    return this.engine.getEvolutionHistorySnapshot();
  }

  getPopulationDataSnapshot(): PopulationDataSnapshot {
    this.assertActive();
    return this.engine.getPopulationDataSnapshot();
  }

  getEnvironmentInterventionSnapshot(): EnvironmentInterventionSnapshot {
    this.assertActive();
    return this.engine.getEnvironmentInterventionSnapshot();
  }

  scheduleEnvironmentInterventions(
    commands: readonly EnvironmentInterventionCommand[],
  ): EnvironmentInterventionSnapshot {
    this.assertActive();
    if (!commands.length || this.status === 'extinct')
      return this.engine.getEnvironmentInterventionSnapshot();
    const current = this.engine.getEnvironmentInterventionSnapshot();
    const key = JSON.stringify(commands);
    if (
      this.lastEnvironmentSubmission?.tick === current.currentTick &&
      this.lastEnvironmentSubmission.key === key
    )
      return current;
    const snapshot = this.engine.scheduleEnvironmentInterventions(commands);
    this.lastEnvironmentSubmission = { tick: current.currentTick, key };
    this.emit(this.createUpdate());
    return snapshot;
  }

  cancelEnvironmentIntervention(id: string): EnvironmentInterventionSnapshot {
    this.assertActive();
    const snapshot = this.engine.cancelEnvironmentIntervention(id);
    this.emit(this.createUpdate());
    return snapshot;
  }

  private beginPausedView(): void {
    if (this.pausedViewDepth === 0) {
      this.resumeAfterPausedView = this.status === 'running';
      if (this.resumeAfterPausedView) this.pause();
    }
    this.pausedViewDepth += 1;
  }

  private replaceEngine(checkpoint: ReturnType<SimulationEngine['exportCheckpoint']>): void {
    this.stopLoop();
    this.engine = SimulationEngine.restoreCheckpoint(checkpoint);
    this.config = checkpoint.config;
    const world = this.engine.getWorldSnapshot();
    this.terrainCells = projectTerrain(world);
    this.selectedAgentId = this.engine.getSnapshot().aliveAgents[0]?.id ?? null;
    this.selectedAgentCache = null;
    this.peakPopulation = this.engine.getSnapshot().populationSize;
    this.lastEnvironmentSubmission = null;
    this.status = this.peakPopulation > 0 ? 'paused' : 'extinct';
  }

  private branchStatus(): 'active' | 'paused' | 'extinct' {
    if (this.status === 'extinct') return 'extinct';
    return 'active';
  }

  private requireHistories(): HistoryRepository {
    if (!this.histories) throw new Error('Alternate histories are not initialized.');
    return this.histories;
  }

  private requireActiveBranchId(): string {
    if (!this.activeBranchId) throw new Error('No active evolutionary history is available.');
    return this.activeBranchId;
  }

  private queueHistoryOperation<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.historyOperation.then(operation, operation);
    this.historyOperation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private endPausedView(): void {
    if (this.disposed || this.pausedViewDepth === 0) return;
    this.pausedViewDepth -= 1;
    if (this.pausedViewDepth > 0) return;
    const shouldResume =
      this.resumeAfterPausedView && this.status === 'paused' && this.appState === 'active';
    this.resumeAfterPausedView = false;
    if (shouldResume) this.resume();
  }

  getInspectorSnapshot(id: string): AgentInspectorSnapshot | null {
    this.assertActive();
    return this.engine.getAgentInspectorSnapshot(id);
  }

  getUpdate(): SimulationSessionUpdate {
    return this.createUpdate();
  }

  dispose(): void {
    if (this.disposed) return;
    this.stopLoop();
    this.listeners.clear();
    this.disposed = true;
  }

  private advanceSlice(): void {
    if (this.status !== 'running') return;
    this.tickAccumulator += this.speed / (publishIntervalMs / loopIntervalMs);
    const sliceStarted = performance.now();
    while (this.tickAccumulator >= 1) {
      this.engine.step();
      this.tickAccumulator -= 1;
      if (performance.now() - sliceStarted >= maximumSliceWorkMs) break;
    }
    this.publishAccumulatorMs += loopIntervalMs;
    if (this.publishAccumulatorMs < publishIntervalMs) return;
    this.publishAccumulatorMs = 0;
    const update = this.createUpdate();
    if (update.snapshot.populationSize === 0) {
      this.stopLoop();
      this.status = 'extinct';
      update.status = 'extinct';
    }
    this.emit(update);
  }

  private createUpdate(existingWorld = this.engine.getWorldSnapshot()): SimulationSessionUpdate {
    const engineSnapshot = this.engine.getSnapshot();
    this.peakPopulation = Math.max(this.peakPopulation, engineSnapshot.populationSize);
    const currentDetail = this.selectedAgentId
      ? this.engine.getAgentDetailSnapshot(this.selectedAgentId)
      : null;
    if (currentDetail) this.selectedAgentCache = { ...currentDetail, selectionState: 'alive' };
    else if (this.selectedAgentCache)
      this.selectedAgentCache = { ...this.selectedAgentCache, selectionState: 'deceased' };
    const recentSummaries = this.engine.getLatestGenerationSummaries(2);
    const currentSummary = recentSummaries.at(-1);
    const previousSummary = recentSummaries.at(-2);
    const snapshot: SimulationSessionSnapshot = {
      ...engineSnapshot,
      world: projectWorld(existingWorld, this.terrainCells),
      peakPopulation: this.peakPopulation,
      latestSummary: engineSnapshot.latestStats,
      scenario: this.config.scenario,
      populationChange:
        currentSummary && previousSummary
          ? currentSummary.population - previousSummary.population
          : null,
    };
    return {
      status: this.status,
      speed: this.speed,
      snapshot,
      selectedAgentId: this.selectedAgentId,
      selectedAgent: this.selectedAgentCache,
    };
  }

  private emit(update: SimulationSessionUpdate): void {
    for (const listener of this.listeners) listener(update);
  }

  private stopLoop(): void {
    if (!this.timer) return;
    this.scheduler.clearInterval(this.timer);
    this.timer = null;
    this.tickAccumulator = 0;
    this.publishAccumulatorMs = 0;
  }

  private assertActive(): void {
    if (this.disposed) throw new Error('Simulation session has been disposed.');
  }
}
