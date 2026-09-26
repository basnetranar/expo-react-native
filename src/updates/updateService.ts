import * as Updates from 'expo-updates';

import { logger } from '@/logging/logger';
import { motion } from '@/theme';
import type { UpdateAction, UpdateCheckOptions } from '@/updates/types';
import { useUpdateStore } from '@/updates/updateStore';

let activeCheck: Promise<boolean> | null = null;

function setUpdateState(action: UpdateAction) {
  useUpdateStore.getState().dispatch(action);
}

function canUseUpdates(): boolean {
  return Updates.isEnabled && !__DEV__;
}

async function downloadUpdate(): Promise<boolean> {
  if (!canUseUpdates()) return false;
  try {
    setUpdateState({ type: 'download' });
    const result = await Updates.fetchUpdateAsync();
    if (!result.isNew) {
      setUpdateState({ type: 'idle' });
      return false;
    }
    setUpdateState({ type: 'ready' });
    return true;
  } catch (error) {
    logger.warn('OTA update download failed; continuing with current update.', {
      error: String(error),
    });
    setUpdateState({ type: 'error', message: 'Update download failed.' });
    return false;
  }
}

async function applyUpdate(): Promise<void> {
  if (!canUseUpdates() || useUpdateStore.getState().status !== 'ready') return;
  try {
    setUpdateState({ type: 'apply' });
    await Updates.reloadAsync();
  } catch (error) {
    logger.warn('OTA update could not be applied.', { error: String(error) });
    setUpdateState({ type: 'error', message: 'Update could not be applied.' });
  }
}

async function performCheck(options: UpdateCheckOptions): Promise<boolean> {
  if (!canUseUpdates()) {
    setUpdateState({ type: 'idle' });
    return false;
  }
  const { lastCheckedAt } = useUpdateStore.getState();
  if (
    !options.bypassCooldown &&
    lastCheckedAt !== null &&
    Date.now() - lastCheckedAt < motion.foregroundUpdateCooldownMs
  ) {
    return false;
  }

  try {
    setUpdateState({ type: 'check' });
    const result = await Updates.checkForUpdateAsync();
    if (!result.isAvailable) {
      setUpdateState({ type: 'idle' });
      return false;
    }
    setUpdateState({ type: 'available' });
    if (options.download) {
      const ready = await downloadUpdate();
      if (ready && options.applyIfSafe) await applyUpdate();
    }
    return true;
  } catch (error) {
    logger.warn('OTA update check failed; continuing with current update.', {
      error: String(error),
    });
    setUpdateState({ type: 'error', message: 'Update check failed.' });
    return false;
  }
}

async function checkForUpdate(options: UpdateCheckOptions = {}): Promise<boolean> {
  if (activeCheck) return activeCheck;
  activeCheck = performCheck(options).finally(() => {
    activeCheck = null;
  });
  return activeCheck;
}

export const updateManager = {
  isSupported: canUseUpdates,
  checkForUpdate,
  downloadUpdate,
  applyUpdate,
  applyWhenSafe: applyUpdate,
};
