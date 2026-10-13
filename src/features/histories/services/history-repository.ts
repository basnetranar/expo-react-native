import {
  checkpointChecksum,
  utf8ByteLength,
} from '@/features/histories/services/checkpoint-integrity';
import type { HistoryStorageAdapter } from '@/features/histories/services/history-storage-adapter';
import type {
  BranchStatus,
  CheckpointMetadata,
  EvolutionBranch,
  HistoriesManifest,
  HistoriesSnapshot,
} from '@/features/histories/types';
import type { EngineCheckpointV1 } from '@/simulation';
import { validateCheckpoint } from '@/simulation';

const manifestSchemaVersion = 1 as const;
const defaultStorageLimit = 50 * 1024 * 1024;

interface StoredEnvelope {
  checksum: string;
  checkpoint: EngineCheckpointV1;
}

export class HistoryRepository {
  private manifest: HistoriesManifest | null = null;
  private operation: Promise<void> = Promise.resolve();

  constructor(
    private readonly adapter: HistoryStorageAdapter,
    private readonly storageLimitBytes = defaultStorageLimit,
  ) {}

  initialize(
    checkpoint: EngineCheckpointV1,
    createdAt = new Date().toISOString(),
    options: { requireExisting?: boolean } = {},
  ) {
    return this.exclusive(async () => {
      await this.adapter.recoverInterruptedWrites();
      const stored = await this.adapter.readManifest();
      if (stored) {
        validateManifest(stored);
        this.manifest = stored;
        await this.removeOrphans();
        return this.snapshot();
      }
      if (options.requireExisting) throw new MissingCheckpointError('active-history-manifest');
      const branchId = 'branch-000001';
      const checkpointId = 'checkpoint-000002';
      const metadata = await this.writeCheckpoint(
        checkpointId,
        branchId,
        'Initial State',
        'head',
        checkpoint,
        createdAt,
      );
      this.manifest = {
        schemaVersion: manifestSchemaVersion,
        activeBranchId: branchId,
        nextSequence: 3,
        branches: [
          createBranch(
            branchId,
            'Main History',
            null,
            null,
            checkpointId,
            checkpoint,
            createdAt,
            'active',
          ),
        ],
        checkpoints: [metadata],
      };
      await this.adapter.writeManifest(this.manifest);
      await this.removeOrphans();
      return this.snapshot();
    });
  }

  getSnapshot(): HistoriesSnapshot {
    return this.snapshot();
  }

  loadActiveCheckpoint(): Promise<EngineCheckpointV1> {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      const branch = requireBranch(manifest, manifest.activeBranchId);
      return this.readCheckpoint(branch.headCheckpointId);
    });
  }

  saveHead(branchId: string, checkpoint: EngineCheckpointV1, status: BranchStatus) {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      const branch = requireBranch(manifest, branchId);
      const previous = requireMetadata(manifest, branch.headCheckpointId);
      const metadata = await this.writeCheckpoint(
        previous.id,
        branchId,
        previous.label,
        'head',
        checkpoint,
        previous.createdAt,
        previous.sizeBytes,
      );
      replaceMetadata(manifest, metadata);
      replaceBranch(manifest, updateBranch(branch, checkpoint, status));
      await this.adapter.writeManifest(manifest);
      return this.snapshot();
    });
  }

  createCheckpoint(
    branchId: string,
    label: string,
    checkpoint: EngineCheckpointV1,
    createdAt = new Date().toISOString(),
  ) {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      requireBranch(manifest, branchId);
      const id = allocateId(manifest, 'checkpoint');
      const metadata = await this.writeCheckpoint(
        id,
        branchId,
        label.trim() || `Generation ${checkpoint.generation}`,
        'manual',
        checkpoint,
        createdAt,
      );
      manifest.checkpoints.push(metadata);
      await this.adapter.writeManifest(manifest);
      return metadata;
    });
  }

  createBranch(checkpointId: string, name: string, createdAt = new Date().toISOString()) {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      const sourceMetadata = requireMetadata(manifest, checkpointId);
      const sourceBranch = requireBranch(manifest, sourceMetadata.branchId);
      const checkpoint = await this.readCheckpoint(checkpointId);
      const branchId = allocateId(manifest, 'branch');
      const headId = allocateId(manifest, 'checkpoint');
      const head = await this.writeCheckpoint(
        headId,
        branchId,
        `${name.trim() || 'New Branch'} Head`,
        'head',
        checkpoint,
        createdAt,
      );
      const branch = createBranch(
        branchId,
        name.trim() || 'New Branch',
        sourceBranch.id,
        checkpointId,
        headId,
        checkpoint,
        createdAt,
      );
      manifest.branches.push(branch);
      manifest.checkpoints.push(head);
      await this.adapter.writeManifest(manifest);
      return branch;
    });
  }

  switchActive(branchId: string): Promise<EngineCheckpointV1> {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      const destination = requireBranch(manifest, branchId);
      const checkpoint = await this.readCheckpoint(destination.headCheckpointId);
      manifest.activeBranchId = branchId;
      for (const branch of manifest.branches)
        if (branch.status === 'active') branch.status = 'paused';
      destination.status = checkpoint.state.population.some((agent) => agent.alive)
        ? 'active'
        : 'extinct';
      await this.adapter.writeManifest(manifest);
      return checkpoint;
    });
  }

  renameBranch(branchId: string, name: string): Promise<HistoriesSnapshot> {
    return this.updateManifest((manifest) => {
      requireBranch(manifest, branchId).name = name.trim() || 'Untitled History';
    });
  }

  renameCheckpoint(id: string, label: string): Promise<HistoriesSnapshot> {
    return this.updateManifest((manifest) => {
      requireMetadata(manifest, id).label = label.trim() || 'Untitled Checkpoint';
    });
  }

  deleteCheckpoint(id: string): Promise<HistoriesSnapshot> {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      const metadata = requireMetadata(manifest, id);
      if (
        metadata.kind === 'head' ||
        manifest.branches.some((branch) => branch.originCheckpointId === id)
      )
        throw new HistoryStorageError(
          'This checkpoint is required by a branch and cannot be deleted.',
        );
      await this.adapter.deleteCheckpoint(id);
      manifest.checkpoints = manifest.checkpoints.filter((item) => item.id !== id);
      await this.adapter.writeManifest(manifest);
      return this.snapshot();
    });
  }

  deleteBranch(branchId: string): Promise<HistoriesSnapshot> {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      if (manifest.branches[0]?.id === branchId)
        throw new HistoryStorageError('Main History cannot be deleted.');
      if (manifest.activeBranchId === branchId)
        throw new HistoryStorageError('Switch away from this branch before deleting it.');
      if (manifest.branches.some((item) => item.parentBranchId === branchId))
        throw new HistoryStorageError('Delete descendant histories before deleting their parent.');
      const owned = manifest.checkpoints.filter((item) => item.branchId === branchId);
      for (const checkpoint of owned) await this.adapter.deleteCheckpoint(checkpoint.id);
      manifest.checkpoints = manifest.checkpoints.filter((item) => item.branchId !== branchId);
      manifest.branches = manifest.branches.filter((item) => item.id !== branchId);
      for (const child of manifest.branches)
        if (child.parentBranchId === branchId) child.parentBranchId = null;
      await this.adapter.writeManifest(manifest);
      return this.snapshot();
    });
  }

  private updateManifest(change: (manifest: HistoriesManifest) => void) {
    return this.exclusive(async () => {
      const manifest = this.requireManifest();
      change(manifest);
      await this.adapter.writeManifest(manifest);
      return this.snapshot();
    });
  }

  private async writeCheckpoint(
    id: string,
    branchId: string,
    label: string,
    kind: 'head' | 'manual',
    checkpoint: EngineCheckpointV1,
    createdAt: string,
    replacedBytes = 0,
  ): Promise<CheckpointMetadata> {
    validateCheckpoint(checkpoint);
    const checkpointText = JSON.stringify(checkpoint);
    const checksum = checkpointChecksum(checkpointText);
    const payload = JSON.stringify({ checksum, checkpoint } satisfies StoredEnvelope);
    const sizeBytes = utf8ByteLength(payload);
    const used = this.manifest?.checkpoints.reduce((total, item) => total + item.sizeBytes, 0) ?? 0;
    if (used - replacedBytes + sizeBytes > this.storageLimitBytes)
      throw new HistoryStorageError(
        'Checkpoint storage limit reached. Delete an older branch or checkpoint.',
      );
    await this.adapter.writeCheckpointAtomic(id, payload);
    return {
      id,
      branchId,
      label,
      kind,
      tick: checkpoint.tick,
      generation: checkpoint.generation,
      population: checkpoint.state.population.filter((agent) => agent.alive).length,
      createdAt,
      schemaVersion: checkpoint.schemaVersion,
      checksum,
      sizeBytes,
    };
  }

  private async readCheckpoint(id: string): Promise<EngineCheckpointV1> {
    const raw = await this.adapter.readCheckpoint(id);
    if (raw === null) throw new MissingCheckpointError(id);
    let envelope: StoredEnvelope;
    try {
      envelope = JSON.parse(raw) as StoredEnvelope;
    } catch (error) {
      throw new CorruptCheckpointError(id, { cause: error });
    }
    const text = JSON.stringify(envelope.checkpoint);
    if (envelope.checksum !== checkpointChecksum(text)) throw new CorruptCheckpointError(id);
    try {
      validateCheckpoint(envelope.checkpoint);
    } catch (error) {
      throw new CorruptCheckpointError(id, { cause: error });
    }
    return envelope.checkpoint;
  }

  private async removeOrphans(): Promise<void> {
    const manifest = this.requireManifest();
    const referenced = new Set(manifest.checkpoints.map((item) => item.id));
    for (const id of await this.adapter.listCheckpointIds())
      if (!referenced.has(id)) await this.adapter.deleteCheckpoint(id);
  }

  private requireManifest(): HistoriesManifest {
    if (!this.manifest) throw new HistoryStorageError('History repository is not initialized.');
    return this.manifest;
  }

  private snapshot(): HistoriesSnapshot {
    const manifest = this.requireManifest();
    return JSON.parse(
      JSON.stringify({
        activeBranchId: manifest.activeBranchId,
        branches: manifest.branches,
        checkpoints: manifest.checkpoints,
        totalStorageBytes: manifest.checkpoints.reduce((total, item) => total + item.sizeBytes, 0),
        storageLimitBytes: this.storageLimitBytes,
      }),
    ) as HistoriesSnapshot;
  }

  private exclusive<T>(task: () => Promise<T>): Promise<T> {
    const result = this.operation.then(task, task);
    this.operation = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}

export class HistoryStorageError extends Error {
  override name = 'HistoryStorageError';
}
export class CorruptCheckpointError extends HistoryStorageError {
  constructor(
    readonly checkpointId: string,
    options?: ErrorOptions,
  ) {
    super(`Checkpoint ${checkpointId} failed its integrity check.`, options);
  }
}
export class MissingCheckpointError extends HistoryStorageError {
  constructor(readonly checkpointId: string) {
    super(`Checkpoint ${checkpointId} is missing.`);
  }
}

function validateManifest(value: HistoriesManifest): void {
  if (
    value.schemaVersion !== manifestSchemaVersion ||
    !Number.isSafeInteger(value.nextSequence) ||
    value.nextSequence < 1 ||
    !Array.isArray(value.branches) ||
    !Array.isArray(value.checkpoints) ||
    !value.branches.some((branch) => branch.id === value.activeBranchId) ||
    value.branches.some(
      (branch) => !value.checkpoints.some((item) => item.id === branch.headCheckpointId),
    )
  )
    throw new HistoryStorageError('History manifest is corrupt or incompatible.');
}
function requireBranch(manifest: HistoriesManifest, id: string): EvolutionBranch {
  const branch = manifest.branches.find((item) => item.id === id);
  if (!branch) throw new HistoryStorageError(`Branch ${id} was not found.`);
  return branch;
}
function requireMetadata(manifest: HistoriesManifest, id: string): CheckpointMetadata {
  const item = manifest.checkpoints.find((candidate) => candidate.id === id);
  if (!item) throw new MissingCheckpointError(id);
  return item;
}
function allocateId(manifest: HistoriesManifest, prefix: 'branch' | 'checkpoint'): string {
  return `${prefix}-${String(manifest.nextSequence++).padStart(6, '0')}`;
}
function replaceMetadata(manifest: HistoriesManifest, metadata: CheckpointMetadata): void {
  manifest.checkpoints = manifest.checkpoints.map((item) =>
    item.id === metadata.id ? metadata : item,
  );
}
function replaceBranch(manifest: HistoriesManifest, branch: EvolutionBranch): void {
  manifest.branches = manifest.branches.map((item) => (item.id === branch.id ? branch : item));
}
function createBranch(
  id: string,
  name: string,
  parentBranchId: string | null,
  originCheckpointId: string | null,
  headCheckpointId: string,
  checkpoint: EngineCheckpointV1,
  createdAt: string,
  status: BranchStatus = 'paused',
): EvolutionBranch {
  return updateBranch(
    {
      id,
      name,
      parentBranchId,
      originCheckpointId,
      originTick: checkpoint.tick,
      originGeneration: checkpoint.generation,
      status,
      headCheckpointId,
      scenario: checkpoint.config.scenario,
      createdAt,
      population: 0,
      tick: 0,
      generation: 0,
      history: [],
      interventions: [],
      events: [],
    },
    checkpoint,
    status,
  );
}
function updateBranch(
  branch: EvolutionBranch,
  checkpoint: EngineCheckpointV1,
  status: BranchStatus,
): EvolutionBranch {
  return {
    ...branch,
    status,
    population: checkpoint.state.population.filter((agent) => agent.alive).length,
    tick: checkpoint.tick,
    generation: checkpoint.generation,
    history: checkpoint.state.history.summaries,
    interventions: checkpoint.state.interventions.interventions,
    events: checkpoint.state.history.events,
  };
}
