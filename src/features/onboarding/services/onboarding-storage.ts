import { storage } from '@/storage/storage';
import type { StorageAdapter } from '@/storage/types';

const onboardingKey = '@feature/onboarding/v1' as const;
export const onboardingVersion = 1;

export interface OnboardingState {
  version: number;
  status: 'completed' | 'skipped';
}

export async function hasDismissedOnboarding(adapter: StorageAdapter = storage): Promise<boolean> {
  const state = await adapter.get<OnboardingState>(onboardingKey);
  return state?.version === onboardingVersion && Boolean(state.status);
}

export async function dismissOnboarding(
  status: OnboardingState['status'],
  adapter: StorageAdapter = storage,
): Promise<void> {
  await adapter.set(onboardingKey, { version: onboardingVersion, status });
}
