import type { StorageKey } from '@/storage/keys';

export interface StorageAdapter {
  get<T>(key: StorageKey): Promise<T | null>;
  set<T>(key: StorageKey, value: T): Promise<void>;
  remove(key: StorageKey): Promise<void>;
  contains(key: StorageKey): Promise<boolean>;
  clear(): Promise<void>;
}

export interface MigrationMetadata {
  lastSuccessfulMigration: number;
  migratedAt: string;
}

export interface StorageHealth {
  healthy: boolean;
  accessible: boolean;
  schemaVersion: number | null;
  lastSuccessfulMigration: number | null;
  issues: string[];
}
