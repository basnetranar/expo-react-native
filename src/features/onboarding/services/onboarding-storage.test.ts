import {
  dismissOnboarding,
  hasDismissedOnboarding,
  onboardingVersion,
} from '@/features/onboarding/services/onboarding-storage';
import type { StorageKey } from '@/storage/keys';
import type { StorageAdapter } from '@/storage/types';

jest.mock('@/storage/storage', () => ({ storage: {} }));

function memoryStorage(initial?: unknown): StorageAdapter {
  const values = new Map<string, unknown>();
  if (initial !== undefined) values.set('@feature/onboarding/v1', initial);
  return {
    get: async <T>(key: StorageKey) => (values.get(key) as T | undefined) ?? null,
    set: async <T>(key: StorageKey, value: T) => void values.set(key, value),
    remove: async (key) => void values.delete(key),
    contains: async (key) => values.has(key),
    clear: async () => void values.clear(),
  };
}

describe('onboarding persistence', () => {
  it('detects first launch without mutating storage', async () => {
    await expect(hasDismissedOnboarding(memoryStorage())).resolves.toBe(false);
  });

  it.each(['completed', 'skipped'] as const)('persists %s across reads', async (status) => {
    const adapter = memoryStorage();
    await dismissOnboarding(status, adapter);
    await expect(hasDismissedOnboarding(adapter)).resolves.toBe(true);
  });

  it('treats interrupted and older records as incomplete', async () => {
    await expect(
      hasDismissedOnboarding(memoryStorage({ version: onboardingVersion })),
    ).resolves.toBe(false);
    await expect(
      hasDismissedOnboarding(
        memoryStorage({ version: onboardingVersion - 1, status: 'completed' }),
      ),
    ).resolves.toBe(false);
  });
});
