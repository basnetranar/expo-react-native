import {
  CorruptCheckpointError,
  HistoryRepository,
  HistoryStorageError,
  MissingCheckpointError,
} from '@/features/histories/services/history-repository';
import type { HistoryStorageAdapter } from '@/features/histories/services/history-storage-adapter';
import type { HistoriesManifest } from '@/features/histories/types';
import { SimulationEngine } from '@/simulation';

class MemoryAdapter implements HistoryStorageAdapter {
  manifest: HistoriesManifest | null = null;
  files = new Map<string, string>();
  recovered = false;
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
  async recoverInterruptedWrites() {
    this.recovered = true;
  }
}

describe('alternate history persistence', () => {
  const checkpoint = () => {
    const engine = new SimulationEngine({
      seed: 'persistent-branches',
      time: { ticksPerGeneration: 5 },
    });
    engine.runTicks(12);
    return engine.exportCheckpoint();
  };

  it('survives a repository restart and recovers interrupted writes', async () => {
    const adapter = new MemoryAdapter();
    const first = new HistoryRepository(adapter);
    const original = checkpoint();
    const initialized = await first.initialize(original, '2026-01-01T00:00:00.000Z');
    const manual = await first.createCheckpoint(
      initialized.activeBranchId,
      'Fork point',
      original,
      '2026-01-02T00:00:00.000Z',
    );
    const branch = await first.createBranch(manual.id, 'Dry future', '2026-01-03T00:00:00.000Z');
    await first.switchActive(branch.id);

    const restarted = new HistoryRepository(adapter);
    const restored = await restarted.initialize(checkpoint());
    expect(adapter.recovered).toBe(true);
    expect(restored.activeBranchId).toBe(branch.id);
    expect(await restarted.loadActiveCheckpoint()).toEqual(original);
  });

  it('never creates a replacement when restore mode requires existing history', async () => {
    const adapter = new MemoryAdapter();
    const repository = new HistoryRepository(adapter);
    await expect(
      repository.initialize(checkpoint(), undefined, { requireExisting: true }),
    ).rejects.toBeInstanceOf(MissingCheckpointError);
    expect(adapter.manifest).toBeNull();
    expect(adapter.files.size).toBe(0);
  });

  it('removes orphan payloads when a missing manifest is rebuilt', async () => {
    const adapter = new MemoryAdapter();
    adapter.files.set('abandoned-write', 'partial');
    const repository = new HistoryRepository(adapter);
    await repository.initialize(checkpoint());
    expect(adapter.files.has('abandoned-write')).toBe(false);
    expect(adapter.files.size).toBe(1);
  });

  it('detects corrupted and missing checkpoint payloads', async () => {
    const adapter = new MemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const snapshot = await repository.initialize(checkpoint());
    const head = snapshot.branches[0]!.headCheckpointId;
    adapter.files.set(head, '{bad json');
    await expect(repository.loadActiveCheckpoint()).rejects.toBeInstanceOf(CorruptCheckpointError);
    adapter.files.delete(head);
    await expect(repository.loadActiveCheckpoint()).rejects.toBeInstanceOf(MissingCheckpointError);
  });

  it('removes orphan files and preserves referenced checkpoints', async () => {
    const adapter = new MemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const initial = checkpoint();
    const snapshot = await repository.initialize(initial);
    adapter.files.set('orphan', 'unused');
    const manual = await repository.createCheckpoint(snapshot.activeBranchId, 'Origin', initial);
    await repository.createBranch(manual.id, 'Child');
    await expect(repository.deleteCheckpoint(manual.id)).rejects.toThrow('required by a branch');
    const restarted = new HistoryRepository(adapter);
    await restarted.initialize(initial);
    expect(adapter.files.has('orphan')).toBe(false);
  });

  it('enforces the storage limit before writing a payload', async () => {
    const adapter = new MemoryAdapter();
    const repository = new HistoryRepository(adapter, 128);
    await expect(repository.initialize(checkpoint())).rejects.toBeInstanceOf(HistoryStorageError);
    expect(adapter.files.size).toBe(0);
  });

  it('protects main, active, and parent branches from unsafe deletion', async () => {
    const adapter = new MemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const initial = checkpoint();
    const state = await repository.initialize(initial);
    const main = state.branches[0]!;
    const child = await repository.createBranch(main.headCheckpointId, 'Child');
    await repository.switchActive(child.id);
    await expect(repository.deleteBranch(main.id)).rejects.toThrow('Main History');
    await expect(repository.deleteBranch(child.id)).rejects.toThrow('Switch away');
  });

  it('restores nested branches after restart and isolates sibling deletion', async () => {
    const adapter = new MemoryAdapter();
    const repository = new HistoryRepository(adapter);
    const original = checkpoint();
    const state = await repository.initialize(original);
    const main = state.branches[0]!;
    const origin = await repository.createCheckpoint(main.id, 'Shared origin', original);
    const child = await repository.createBranch(origin.id, 'Child');
    const childPoint = await repository.createCheckpoint(child.id, 'Nested origin', original);
    const grandchild = await repository.createBranch(childPoint.id, 'Grandchild');
    const sibling = await repository.createBranch(origin.id, 'Disposable sibling');

    await repository.switchActive(grandchild.id);
    const restarted = new HistoryRepository(adapter);
    expect((await restarted.initialize(original)).activeBranchId).toBe(grandchild.id);
    expect(await restarted.loadActiveCheckpoint()).toEqual(original);

    await restarted.switchActive(main.id);
    await restarted.deleteBranch(sibling.id);
    expect(restarted.getSnapshot().branches.map((branch) => branch.id)).toEqual(
      expect.arrayContaining([main.id, child.id, grandchild.id]),
    );
    await restarted.switchActive(grandchild.id);
    expect(await restarted.loadActiveCheckpoint()).toEqual(original);
  });
});
