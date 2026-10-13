import { checkpointChecksum } from '@/features/histories/services/checkpoint-integrity';
import { HistoryRepository } from '@/features/histories/services/history-repository';
import type { HistoryStorageAdapter } from '@/features/histories/services/history-storage-adapter';
import type { HistoriesManifest } from '@/features/histories/types';
import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';

class SessionMemoryAdapter implements HistoryStorageAdapter {
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

describe('history session integration', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('pauses on switch, isolates branches, and restores the selected active state', async () => {
    const repository = new HistoryRepository(new SessionMemoryAdapter());
    const controller = new SimulationSessionController(
      { seed: 'session-branches', time: { ticksPerGeneration: 5 } },
      undefined,
      repository,
    );
    controller.initialize();
    const initialized = await controller.initializeHistories('2026-01-01T00:00:00.000Z');
    controller.setSpeed(50);
    controller.resume();
    jest.advanceTimersByTime(200);
    controller.pause();
    const forkTick = controller.getUpdate().snapshot.tick;
    const fork = await controller.createHistoryCheckpoint('Before drought');

    controller.resume();
    jest.advanceTimersByTime(200);
    controller.pause();
    const originalTick = controller.getUpdate().snapshot.tick;
    expect(originalTick).toBeGreaterThan(forkTick);

    const branch = await controller.createHistoryBranch(fork.id, 'Drought branch');
    await controller.switchHistoryBranch(branch.id);
    expect(controller.getUpdate()).toMatchObject({
      status: 'paused',
      snapshot: { tick: forkTick },
    });
    controller.scheduleEnvironmentInterventions([{ type: 'drought', value: 1, durationTicks: 10 }]);
    controller.resume();
    jest.advanceTimersByTime(200);
    controller.pause();
    const droughtState = controller.getEnvironmentInterventionSnapshot();

    await controller.switchHistoryBranch(initialized.activeBranchId);
    expect(controller.getUpdate()).toMatchObject({
      status: 'paused',
      snapshot: { tick: originalTick },
    });
    expect(controller.getEnvironmentInterventionSnapshot().interventions).toHaveLength(0);
    await controller.switchHistoryBranch(branch.id);
    expect(controller.getEnvironmentInterventionSnapshot()).toEqual(droughtState);
    controller.dispose();
  });

  it('preserves the active engine when destination restoration fails', async () => {
    const adapter = new SessionMemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const controller = new SimulationSessionController(
      { seed: 'failed-switch-preserves-source' },
      undefined,
      repository,
    );
    controller.initialize();
    const initialized = await controller.initializeHistories();
    const point = await controller.createHistoryCheckpoint('Safe source');
    const branch = await controller.createHistoryBranch(point.id, 'Corrupt destination');
    const branchHead = repository
      .getSnapshot()
      .branches.find((item) => item.id === branch.id)!.headCheckpointId;
    adapter.files.set(branchHead, '{broken');
    const before = controller.getUpdate();
    await expect(controller.switchHistoryBranch(branch.id)).rejects.toThrow('integrity check');
    const after = controller.getUpdate();
    expect(after.snapshot).toEqual(before.snapshot);
    expect(repository.getSnapshot().activeBranchId).toBe(initialized.activeBranchId);
    controller.dispose();
  });

  it('serializes duplicate saves and concurrent branch switches without ID collisions', async () => {
    const adapter = new SessionMemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const controller = new SimulationSessionController(
      { seed: 'concurrent-history-operations' },
      undefined,
      repository,
    );
    controller.initialize();
    const initialized = await controller.initializeHistories();
    const [first, second] = await Promise.all([
      controller.createHistoryCheckpoint('Duplicate request'),
      controller.createHistoryCheckpoint('Duplicate request'),
    ]);
    expect(first.id).not.toBe(second.id);
    const firstBranch = await controller.createHistoryBranch(first.id, 'First');
    const secondBranch = await controller.createHistoryBranch(second.id, 'Second');
    await Promise.all([
      controller.switchHistoryBranch(firstBranch.id),
      controller.switchHistoryBranch(secondBranch.id),
    ]);
    expect(repository.getSnapshot().activeBranchId).toBe(secondBranch.id);
    expect(repository.getSnapshot().branches).toHaveLength(3);
    expect(initialized.activeBranchId).not.toBe(secondBranch.id);
    controller.dispose();
  });

  it('rejects an integrity-valid envelope with an unsupported checkpoint schema', async () => {
    const adapter = new SessionMemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const controller = new SimulationSessionController(
      { seed: 'unsupported-checkpoint-version' },
      undefined,
      repository,
    );
    controller.initialize();
    await controller.initializeHistories();
    const point = await controller.createHistoryCheckpoint('Version source');
    const branch = await controller.createHistoryBranch(point.id, 'Future version');
    const head = repository
      .getSnapshot()
      .branches.find((item) => item.id === branch.id)!.headCheckpointId;
    const envelope = JSON.parse(adapter.files.get(head)!) as {
      checksum: string;
      checkpoint: Record<string, unknown>;
    };
    envelope.checkpoint.schemaVersion = 99;
    envelope.checksum = checkpointChecksum(JSON.stringify(envelope.checkpoint));
    adapter.files.set(head, JSON.stringify(envelope));
    await expect(controller.switchHistoryBranch(branch.id)).rejects.toThrow('integrity check');
    controller.dispose();
  });
});
