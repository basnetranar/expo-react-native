import { createEvolutionTimelineViewModel } from '@/features/evolution/utils/evolution-timeline-presentation';
import { HistoryRepository } from '@/features/histories/services/history-repository';
import type { HistoryStorageAdapter } from '@/features/histories/services/history-storage-adapter';
import type { HistoriesManifest } from '@/features/histories/types';
import { createLineageIndex } from '@/features/lineage/utils/lineage-selectors';
import { createPopulationOverviewSnapshot } from '@/features/population/utils/population-presentation';
import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import { projectTerrain, projectWorld } from '@/features/simulation/utils/world-projection';
import { defaultSimulationConfig, SimulationEngine, type ScenarioName } from '@/simulation';
import { canonicalStateHash } from '@/simulation/testing/canonicalState';
import {
  argument,
  integerArgument,
  latencyDistribution,
  listArgument,
  markdownTable,
  timed,
  writeQualityReport,
} from '@/simulation/testing/qualityCli';

class MemoryHistoryStorage implements HistoryStorageAdapter {
  manifest: HistoriesManifest | null = null;
  files = new Map<string, string>();
  async readManifest() {
    return this.manifest ? structuredClone(this.manifest) : null;
  }
  async writeManifest(value: HistoriesManifest) {
    this.manifest = structuredClone(value);
  }
  async readCheckpoint(id: string) {
    return this.files.get(id) ?? null;
  }
  async writeCheckpointAtomic(id: string, payload: string) {
    this.files.set(id, payload);
  }
  async deleteCheckpoint(id: string) {
    this.files.delete(id);
  }
  async listCheckpointIds() {
    return [...this.files.keys()];
  }
  async recoverInterruptedWrites() {}
}

function benchmarkPlaybackSlicing(population: number, samples: number, scenario: ScenarioName) {
  const config = {
    seed: `PLAYBACK-BENCHMARK-${scenario}-${population}`,
    scenario,
    population: { ...defaultSimulationConfig.population, initial: population, maximum: population },
  };
  const legacy = new SimulationEngine(config);
  const bounded = new SimulationEngine(config);
  const callbacks = Math.min(20, samples);
  const legacyCallbackMs: number[] = [];
  const boundedCallbackMs: number[] = [];
  let accumulator = 0;
  for (let index = 0; index < callbacks; index += 1) {
    legacyCallbackMs.push(timed(() => legacy.runTicks(5)).milliseconds);
    accumulator += 5;
    const started = performance.now();
    while (accumulator >= 1) {
      bounded.step();
      accumulator -= 1;
      if (performance.now() - started >= 12) break;
    }
    boundedCallbackMs.push(performance.now() - started);
  }
  const boundedTick = bounded.getSnapshot().tick;
  const direct = new SimulationEngine(config);
  direct.runTicks(boundedTick);
  return {
    callbacks,
    requestedTicksPerCallback: 5,
    achievedTicksPerCallback: Number((boundedTick / callbacks).toFixed(3)),
    backlogTicks: accumulator,
    legacyCallbackMs: latencyDistribution(legacyCallbackMs),
    boundedCallbackMs: latencyDistribution(boundedCallbackMs),
    deterministicStatePreserved:
      canonicalStateHash(bounded.exportCheckpoint()) ===
      canonicalStateHash(direct.exportCheckpoint()),
  };
}

async function benchmarkPopulation(population: number, samples: number, scenario: ScenarioName) {
  const engine = new SimulationEngine({
    seed: `BENCHMARK-${scenario}-${population}`,
    scenario,
    population: { ...defaultSimulationConfig.population, initial: population, maximum: population },
  });
  engine.runTicks(integerArgument('warmup', 20));
  const tick: number[] = [];
  const publicSnapshot: number[] = [];
  let peakHeapBytes = process.memoryUsage().heapUsed;
  for (let index = 0; index < samples; index += 1) {
    tick.push(timed(() => engine.step()).milliseconds);
    publicSnapshot.push(timed(() => engine.getSnapshot()).milliseconds);
    peakHeapBytes = Math.max(peakHeapBytes, process.memoryUsage().heapUsed);
  }
  const worldSnapshot = timed(() => engine.getWorldSnapshot());
  const terrain = timed(() => projectTerrain(worldSnapshot.value));
  const worldProjection = timed(() => projectWorld(worldSnapshot.value, terrain.value));
  const populationSnapshot = timed(() => engine.getPopulationDataSnapshot());
  const populationProjection = timed(() =>
    createPopulationOverviewSnapshot(populationSnapshot.value, {
      scenario,
      status: engine.getSnapshot().populationSize ? 'paused' : 'extinct',
      peakPopulation: population,
    }),
  );
  const historySnapshot = timed(() => engine.getEvolutionHistorySnapshot());
  const timelineProjection = timed(() =>
    createEvolutionTimelineViewModel(historySnapshot.value, scenario),
  );
  const lineageSnapshot = timed(() => engine.getLineageRegistrySnapshot());
  const lineageProjection = timed(() => createLineageIndex(lineageSnapshot.value.records));
  const socialSnapshot = timed(() => engine.getSocialSnapshot());
  const culturalSnapshot = timed(() => engine.getCulturalSnapshot());
  const learningEventCount = culturalSnapshot.value.retention.eventsRecorded;
  const checkpointTimes: number[] = [];
  const restorationTimes: number[] = [];
  let checkpointBytes = 0;
  for (let index = 0; index < Math.min(20, samples); index += 1) {
    const exported = timed(() => JSON.stringify(engine.exportCheckpoint()));
    checkpointTimes.push(exported.milliseconds);
    checkpointBytes = new TextEncoder().encode(exported.value).length;
    restorationTimes.push(
      timed(() => SimulationEngine.restoreCheckpoint(JSON.parse(exported.value))).milliseconds,
    );
  }

  const repository = new HistoryRepository(new MemoryHistoryStorage());
  const controller = new SimulationSessionController(
    {
      seed: `BRANCH-BENCHMARK-${population}`,
      scenario,
      population: {
        ...defaultSimulationConfig.population,
        initial: population,
        maximum: population,
      },
    },
    undefined,
    repository,
  );
  controller.initialize();
  const histories = await controller.initializeHistories('2026-10-10T00:00:00.000Z');
  const point = await controller.createHistoryCheckpoint('Benchmark point');
  const branch = await controller.createHistoryBranch(point.id, 'Benchmark branch');
  const branchSwitch: number[] = [];
  let destination = branch.id;
  for (let index = 0; index < Math.min(10, samples); index += 1) {
    const switched = performance.now();
    await controller.switchHistoryBranch(destination);
    branchSwitch.push(performance.now() - switched);
    destination = destination === branch.id ? histories.activeBranchId : branch.id;
  }
  const publication = Array.from(
    { length: samples },
    () => timed(() => controller.getUpdate()).milliseconds,
  );
  controller.dispose();

  return {
    requestedPopulation: population,
    finalLivingPopulation: engine.getSnapshot().populationSize,
    tickMs: latencyDistribution(tick),
    publicSnapshotMs: latencyDistribution(publicSnapshot),
    sessionPublicationMs: latencyDistribution(publication),
    worldSnapshotMs: worldSnapshot.milliseconds,
    terrainProjectionMs: terrain.milliseconds,
    worldProjectionMs: worldProjection.milliseconds,
    populationSnapshotMs: populationSnapshot.milliseconds,
    populationProjectionMs: populationProjection.milliseconds,
    timelineSnapshotMs: historySnapshot.milliseconds,
    timelineProjectionMs: timelineProjection.milliseconds,
    lineageSnapshotMs: lineageSnapshot.milliseconds,
    lineageProjectionMs: lineageProjection.milliseconds,
    socialSnapshotMs: socialSnapshot.milliseconds,
    culturalSnapshotMs: culturalSnapshot.milliseconds,
    learningEvents: learningEventCount,
    learningEventsPerTick: Number(
      (learningEventCount / Math.max(1, engine.getSnapshot().tick)).toFixed(3),
    ),
    observationCandidateLimit: engine.exportCheckpoint().config.learning.observationCandidateLimit,
    socialRelationships: socialSnapshot.value.metrics.activeRelationships,
    socialGroups: socialSnapshot.value.metrics.activeGroups,
    checkpointBytes,
    checkpointSerializationMs: latencyDistribution(checkpointTimes),
    checkpointRestorationMs: latencyDistribution(restorationTimes),
    branchSwitchMs: latencyDistribution(branchSwitch),
    playback50x: benchmarkPlaybackSlicing(population, samples, scenario),
    peakHeapBytes,
  };
}

async function main() {
  const populations = listArgument('populations', [50, 150, 500]);
  const samples = integerArgument('samples', 200);
  const scenario = argument('scenario', 'stableSavannah') as ScenarioName;
  if (!['stableSavannah', 'drought', 'hardFood'].includes(scenario))
    throw new Error(`Unknown scenario: ${scenario}`);
  const results = [];
  for (const population of populations) {
    const result = await benchmarkPopulation(population, samples, scenario);
    results.push(result);
    console.log(
      `${population}: tick p95 ${result.tickMs.p95} ms, checkpoint ${result.checkpointBytes} bytes`,
    );
  }
  const report = {
    createdAt: new Date().toISOString(),
    environment: {
      runtime: process.version,
      platform: process.platform,
      architecture: process.arch,
    },
    configuration: { populations, samples, scenario },
    results,
    limitations: [
      'React Native commit/render and image decoding require device profiling and are not measured by Node.',
      'Branch switching uses an in-memory storage adapter; device filesystem latency is excluded.',
      'heapUsed is Node heap sampling, not mobile resident memory.',
    ],
  };
  const table = markdownTable(
    [
      'Population',
      'Living',
      'Tick mean',
      'Tick p95',
      'Publish p95',
      'Checkpoint bytes',
      'Serialize p95',
      'Restore p95',
      'Switch p95',
      'Peak heap',
      '50× legacy p95',
      '50× bounded p95',
      '50× achieved ticks/callback',
      'Relationships',
      'Groups',
      'Social snapshot ms',
      'Learning events/tick',
      'Learning snapshot ms',
      'Observation candidates max',
      '50× backlog ticks',
    ],
    results.map((item) => [
      item.requestedPopulation,
      item.finalLivingPopulation,
      item.tickMs.mean,
      item.tickMs.p95,
      item.sessionPublicationMs.p95,
      item.checkpointBytes,
      item.checkpointSerializationMs.p95,
      item.checkpointRestorationMs.p95,
      item.branchSwitchMs.p95,
      item.peakHeapBytes,
      item.playback50x.legacyCallbackMs.p95,
      item.playback50x.boundedCallbackMs.p95,
      item.playback50x.achievedTicksPerCallback,
      item.socialRelationships,
      item.socialGroups,
      item.socialSnapshotMs,
      item.learningEventsPerTick,
      item.culturalSnapshotMs,
      item.observationCandidateLimit,
      item.playback50x.backlogTicks,
    ]),
  );
  writeQualityReport('performance', report, `# Simulation performance report\n\n${table}`);
}

void main();
