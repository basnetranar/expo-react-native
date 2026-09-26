import { logger } from '@/logging/logger';
import { storageKeys } from '@/storage/keys';
import { CURRENT_STORAGE_VERSION, runStorageMigrations } from '@/storage/migrations';
import { storage } from '@/storage/storage';
import type { MigrationMetadata, StorageHealth } from '@/storage/types';

export async function checkStorageHealth(): Promise<StorageHealth> {
  const issues: string[] = [];
  try {
    const schemaVersion = await storage.get<number>(storageKeys.schemaVersion);
    const metadata = await storage.get<MigrationMetadata>(storageKeys.migrationMetadata);
    if (schemaVersion !== null && (!Number.isInteger(schemaVersion) || schemaVersion < 0)) {
      issues.push('Schema version is invalid.');
    }
    if (schemaVersion !== null && schemaVersion > CURRENT_STORAGE_VERSION) {
      issues.push('Stored schema is newer than this application supports.');
    }
    return {
      healthy: issues.length === 0,
      accessible: true,
      schemaVersion,
      lastSuccessfulMigration: metadata?.lastSuccessfulMigration ?? null,
      issues,
    };
  } catch (error) {
    logger.error('Storage health check failed.', error);
    return {
      healthy: false,
      accessible: false,
      schemaVersion: null,
      lastSuccessfulMigration: null,
      issues: ['Storage could not be read.'],
    };
  }
}

export async function repairStorage(): Promise<StorageHealth> {
  const health = await checkStorageHealth();
  if (!health.accessible) return health;
  await runStorageMigrations(storage);
  return checkStorageHealth();
}
