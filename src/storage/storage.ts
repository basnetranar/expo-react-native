import AsyncStorage from '@react-native-async-storage/async-storage';

import type { StorageKey } from '@/storage/keys';
import type { StorageAdapter } from '@/storage/types';

export class StorageParseError extends Error {
  constructor(
    readonly key: StorageKey,
    options?: ErrorOptions,
  ) {
    super(`Stored value for ${key} is not valid JSON.`, options);
    this.name = 'StorageParseError';
  }
}

export const storage: StorageAdapter = {
  async get<T>(key: StorageKey): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      throw new StorageParseError(key, { cause: error });
    }
  },
  async set<T>(key: StorageKey, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: StorageKey): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
  async contains(key: StorageKey): Promise<boolean> {
    return (await AsyncStorage.getItem(key)) !== null;
  },
  async clear(): Promise<void> {
    const ownedKeys = (await AsyncStorage.getAllKeys()).filter(
      (key) => key.startsWith('@infrastructure/') || key.startsWith('@feature/'),
    );
    if (ownedKeys.length) await AsyncStorage.multiRemove(ownedKeys);
  },
};

export async function initializeStorage(): Promise<void> {
  await AsyncStorage.getAllKeys();
}
