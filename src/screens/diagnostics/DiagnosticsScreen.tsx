import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { env } from '@/config/environment';
import { exportDiagnostics, runDiagnostics, type DiagnosticsReport } from '@/errors/diagnostics';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { storage } from '@/storage/storage';
import { checkStorageHealth, repairStorage } from '@/storage/storageHealth';
import { useAppUpdates } from '@/updates/useAppUpdates';

export function DiagnosticsScreen() {
  const layout = useResponsiveLayout();
  const network = useNetworkStatus();
  const updates = useAppUpdates();
  const [report, setReport] = useState<DiagnosticsReport | null>(null);

  const refresh = async () => setReport(await runDiagnostics(null, layout));
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
    // Responsive primitives below are the only inputs diagnostics needs to refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout.breakpoint, layout.height, layout.width]);

  const confirmReset = () =>
    Alert.alert(
      'Reset storage?',
      'All local starter and feature data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Storage',
          style: 'destructive',
          onPress: () => void storage.clear().then(refresh),
        },
      ],
    );

  const rows = {
    Environment: env.name,
    Version: report?.app.version ?? 'Unknown',
    'Build number': report?.app.nativeBuildNumber ?? 'Unknown',
    'Runtime version': report?.update.runtimeVersion ?? 'Unavailable',
    'Update channel': report?.update.channel ?? 'Unavailable',
    'Update ID': report?.update.updateId ?? 'Embedded/development',
    Dimensions: `${layout.width} × ${layout.height}`,
    Breakpoint: layout.breakpoint,
    Classification: layout.isTablet ? 'Tablet' : 'Phone',
    Orientation: layout.orientation,
    'Storage schema': String(report?.storage.schemaVersion ?? 'Not initialized'),
    'Storage health': report?.storage.healthy ? 'Healthy' : 'Needs attention',
    Network: `${String(network.isConnected)} / internet ${String(network.isInternetReachable)}`,
    'Update status': updates.status,
  };

  return (
    <AppScreen scroll maxWidth="readable">
      <AppCard>
        {Object.entries(rows).map(([label, value]) => (
          <AppText key={label} selectable>
            {label}: {value}
          </AppText>
        ))}
      </AppCard>
      <AppButton label="Check for OTA Update" onPress={() => void updates.checkForUpdate()} />
      <AppButton
        label="Apply Ready Update"
        variant="secondary"
        disabled={!updates.updateReady}
        onPress={() => void updates.applyUpdate()}
      />
      <AppButton label="Run Diagnostics" variant="secondary" onPress={() => void refresh()} />
      <AppButton
        label="Export Diagnostics"
        variant="secondary"
        onPress={() => void exportDiagnostics(report ?? undefined)}
      />
      <AppButton
        label="Check Storage"
        variant="secondary"
        onPress={() => void checkStorageHealth().then(refresh)}
      />
      <AppButton
        label="Repair Storage"
        variant="secondary"
        onPress={() => void repairStorage().then(refresh)}
      />
      <AppButton label="Reset Storage" variant="destructive" onPress={confirmReset} />
    </AppScreen>
  );
}
