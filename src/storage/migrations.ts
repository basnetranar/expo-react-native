import { logger } from '@/logging/logger';
import { storageKeys } from '@/storage/keys';
import type { MigrationMetadata, StorageAdapter } from '@/storage/types';

export const CURRENT_STORAGE_VERSION = 1;

export interface StorageMigration {
  from: number;
  to: number;
  migrate(storage: StorageAdapter): Promise<void>;
}

export const migrations: readonly StorageMigration[] = [
  {
    from: 0,
    to: 1,
    async migrate(storageAdapter) {
      const metadata = await storageAdapter.get<MigrationMetadata>(storageKeys.migrationMetadata);
      if (!metadata) {
        await storageAdapter.set(storageKeys.migrationMetadata, {
          lastSuccessfulMigration: 0,
          migratedAt: new Date(0).toISOString(),
        });
      }
    },
  },
];

export async function runStorageMigrations(
  storageAdapter: StorageAdapter,
  availableMigrations: readonly StorageMigration[] = migrations,
): Promise<number> {
  let version = (await storageAdapter.get<number>(storageKeys.schemaVersion)) ?? 0;
  if (!Number.isInteger(version) || version < 0 || version > CURRENT_STORAGE_VERSION) {
    throw new Error(`Unsupported storage schema version: ${version}`);
  }

  while (version < CURRENT_STORAGE_VERSION) {
    const migration = availableMigrations.find((candidate) => candidate.from === version);
    if (!migration || migration.to !== version + 1) {
      throw new Error(`Missing sequential storage migration from version ${version}.`);
    }
    await migration.migrate(storageAdapter);
    version = migration.to;
    await storageAdapter.set(storageKeys.schemaVersion, version);
    await storageAdapter.set(storageKeys.migrationMetadata, {
      lastSuccessfulMigration: version,
      migratedAt: new Date().toISOString(),
    });
    logger.info('Storage migration completed.', { version });
  }
  return version;
}
