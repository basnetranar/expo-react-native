import type { BootstrapResult, BootstrapStage } from '@/bootstrap/types';
import { env, validateEnvironment } from '@/config/environment';
import { logger } from '@/logging/logger';
import { runStorageMigrations } from '@/storage/migrations';
import { initializeStorage, storage } from '@/storage/storage';
import { checkStorageHealth, repairStorage } from '@/storage/storageHealth';
import { restoreAppState } from '@/store/appStore';
import { updateManager } from '@/updates/updateService';

let bootstrapPromise: Promise<BootstrapResult> | null = null;

async function loadRequiredAssets(): Promise<void> {
  // Add expo-font loadAsync calls here when a product introduces custom fonts.
}

async function performBootstrap(
  onStage?: (stage: BootstrapStage) => void,
): Promise<BootstrapResult> {
  onStage?.('configuration');
  validateEnvironment(env);
  onStage?.('storage');
  await initializeStorage();
  const health = await checkStorageHealth();
  let storageRepaired = false;
  if (!health.healthy) {
    const repaired = await repairStorage();
    storageRepaired = repaired.healthy;
    if (!repaired.healthy) throw new Error(`Storage is unavailable: ${repaired.issues.join(' ')}`);
  }
  onStage?.('migrations');
  await runStorageMigrations(storage);
  onStage?.('state');
  await restoreAppState();
  onStage?.('assets');
  await loadRequiredAssets();
  onStage?.('updates');
  await updateManager.checkForUpdate({ bypassCooldown: true, download: true, applyIfSafe: true });
  onStage?.('ready');
  logger.info('Application bootstrap completed.');
  return { completedAt: new Date().toISOString(), storageRepaired };
}

export function bootstrapApplication(
  onStage?: (stage: BootstrapStage) => void,
): Promise<BootstrapResult> {
  bootstrapPromise ??= performBootstrap(onStage).catch((error) => {
    bootstrapPromise = null;
    throw error;
  });
  return bootstrapPromise;
}
