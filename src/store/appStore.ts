import { create } from 'zustand';

import { storageKeys } from '@/storage/keys';
import { storage } from '@/storage/storage';

interface PersistedAppState {
  hasCompletedOnboarding: boolean;
}

interface AppState extends PersistedAppState {
  hydrated: boolean;
  setHasCompletedOnboarding(value: boolean): Promise<void>;
  reset(): void;
}

const initialState: PersistedAppState = { hasCompletedOnboarding: false };

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  hydrated: false,
  async setHasCompletedOnboarding(value) {
    set({ hasCompletedOnboarding: value });
    await storage.set(storageKeys.appState, { hasCompletedOnboarding: value });
  },
  reset: () => set({ ...initialState, hydrated: true }),
}));

export async function restoreAppState(): Promise<void> {
  const persisted = await storage.get<PersistedAppState>(storageKeys.appState);
  useAppStore.setState({ ...initialState, ...persisted, hydrated: true });
}
