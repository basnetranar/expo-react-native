import * as Application from 'expo-application';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Updates from 'expo-updates';
import { Platform, Share } from 'react-native';

import { env } from '@/config/environment';
import type { CapturedError } from '@/errors/errorTypes';
import { logger } from '@/logging/logger';
import type { ResponsiveLayout } from '@/responsive/types';
import { checkStorageHealth } from '@/storage/storageHealth';

export interface DiagnosticsReport {
  timestamp: string;
  app: { version: string | null; nativeBuildNumber: string | null; environment: string };
  device: { platform: string; osVersion: string | null; deviceType: string };
  update: { runtimeVersion: string | null; updateId: string | null; channel: string | null };
  storage: Awaited<ReturnType<typeof checkStorageHealth>>;
  responsive: Partial<ResponsiveLayout> | null;
  error: CapturedError | null;
}

export async function runDiagnostics(
  error: CapturedError | null = null,
  responsive: Partial<ResponsiveLayout> | null = null,
): Promise<DiagnosticsReport> {
  try {
    return {
      timestamp: new Date().toISOString(),
      app: {
        version: Application.nativeApplicationVersion ?? Constants.expoConfig?.version ?? null,
        nativeBuildNumber: Application.nativeBuildVersion,
        environment: env.name,
      },
      device: {
        platform: Platform.OS,
        osVersion: Device.osVersion,
        deviceType: Device.DeviceType[Device.deviceType ?? Device.DeviceType.UNKNOWN],
      },
      update: {
        runtimeVersion: Updates.runtimeVersion,
        updateId: Updates.updateId,
        channel: Updates.channel,
      },
      storage: await checkStorageHealth(),
      responsive,
      error,
    };
  } catch (diagnosticError) {
    logger.error('Diagnostics collection failed.', diagnosticError);
    return {
      timestamp: new Date().toISOString(),
      app: { version: null, nativeBuildNumber: null, environment: env.name },
      device: { platform: Platform.OS, osVersion: null, deviceType: 'UNKNOWN' },
      update: { runtimeVersion: null, updateId: null, channel: null },
      storage: {
        healthy: false,
        accessible: false,
        schemaVersion: null,
        lastSuccessfulMigration: null,
        issues: ['Diagnostics collection failed.'],
      },
      responsive,
      error,
    };
  }
}

export async function exportDiagnostics(report?: DiagnosticsReport): Promise<void> {
  try {
    const contents = JSON.stringify(report ?? (await runDiagnostics()), null, 2);
    if (Platform.OS === 'web' || !(await Sharing.isAvailableAsync())) {
      await Share.share({ message: contents, title: 'App diagnostics' });
      return;
    }
    const file = new File(Paths.cache, `diagnostics-${Date.now()}.json`);
    file.create({ overwrite: true });
    file.write(contents);
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export diagnostics',
    });
  } catch (error) {
    logger.error('Diagnostics export failed.', error);
  }
}
