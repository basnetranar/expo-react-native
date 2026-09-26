import type { StorageKey } from '@/storage/keys';
import { runStorageMigrations, type StorageMigration } from '@/storage/migrations';
import type { StorageAdapter } from '@/storage/types';

function memoryStorage(): StorageAdapter {
  const values = new Map<string, unknown>();
  return {
    get: async <T>(key: StorageKey) => (values.get(key) as T | undefined) ?? null,
    set: async <T>(key: StorageKey, value: T) => void values.set(key, value),
    remove: async (key) => void values.delete(key),
    contains: async (key) => values.has(key),
    clear: async () => void values.clear(),
  };
}

describe('storage migrations', () => {
  it('runs migrations sequentially and persists the version', async () => {
    const calls: number[] = [];
    const migrations: readonly StorageMigration[] = [
      { from: 0, to: 1, migrate: async () => void calls.push(1) },
    ];
    const adapter = memoryStorage();
    await expect(runStorageMigrations(adapter, migrations)).resolves.toBe(1);
    expect(calls).toEqual([1]);
    await expect(runStorageMigrations(adapter, migrations)).resolves.toBe(1);
    expect(calls).toEqual([1]);
  });
});
