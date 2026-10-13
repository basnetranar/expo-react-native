import { ExpoHistoryStorageAdapter } from '@/features/histories/services/history-storage-adapter';
import type { HistoriesManifest } from '@/features/histories/types';
import type { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import type { SimulationStatus } from '@/features/simulation/types';
import type { SimulationConfig } from '@/simulation';
import { storage } from '@/storage/storage';

const activeWorldKey = '@feature/active-world/v1' as const;

export interface ActiveWorldRecord {
  schemaVersion: 1;
  config: SimulationConfig;
  scenario: SimulationConfig['scenario'];
  generation: number;
  population: number;
  status: SimulationStatus;
  activeBranchId: string;
  activeBranchName: string;
  lastSavedAt: string;
}

export interface SavedWorldSummary {
  record: ActiveWorldRecord;
  manifest: HistoriesManifest;
  mostRecentCheckpoint: HistoriesManifest['checkpoints'][number] | null;
}

export async function saveActiveWorldRecord(
  controller: SimulationSessionController,
  savedAt = new Date().toISOString(),
): Promise<ActiveWorldRecord | null> {
  const histories = controller.getHistoriesSnapshot();
  if (!histories) return null;
  const update = controller.getUpdate();
  const branch = histories.branches.find((item) => item.id === histories.activeBranchId);
  if (!branch) return null;
  const record: ActiveWorldRecord = {
    schemaVersion: 1,
    config: controller.getConfig(),
    scenario: update.snapshot.scenario,
    generation: update.snapshot.generation,
    population: update.snapshot.populationSize,
    status: update.status,
    activeBranchId: branch.id,
    activeBranchName: branch.name,
    lastSavedAt: savedAt,
  };
  await storage.set(activeWorldKey, record);
  return record;
}

export async function loadActiveWorldRecord(): Promise<ActiveWorldRecord | null> {
  const value = await storage.get<ActiveWorldRecord>(activeWorldKey);
  return isActiveWorldRecord(value) ? value : null;
}

export async function loadSavedWorldSummary(): Promise<SavedWorldSummary | null> {
  const record = await loadActiveWorldRecord();
  if (!record) return null;
  const manifest = await new ExpoHistoryStorageAdapter(String(record.config.seed)).readManifest();
  if (!manifest) return null;
  const activeBranch = manifest.branches.find((item) => item.id === manifest.activeBranchId);
  if (!activeBranch) return null;
  const mostRecentCheckpoint = manifest.checkpoints.reduce<
    HistoriesManifest['checkpoints'][number] | null
  >((latest, item) => (!latest || item.createdAt > latest.createdAt ? item : latest), null);
  return { record, manifest, mostRecentCheckpoint };
}

function isActiveWorldRecord(value: unknown): value is ActiveWorldRecord {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<ActiveWorldRecord>;
  return (
    candidate.schemaVersion === 1 &&
    Boolean(candidate.config) &&
    typeof candidate.config?.seed === 'string' &&
    typeof candidate.activeBranchId === 'string' &&
    typeof candidate.lastSavedAt === 'string'
  );
}
