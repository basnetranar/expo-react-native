import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Alert, DevSettings, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { exportDiagnostics, runDiagnostics } from '@/errors/diagnostics';
import type { CapturedError } from '@/errors/errorTypes';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { storage } from '@/storage/storage';
import { repairStorage } from '@/storage/storageHealth';
import { colors, spacing } from '@/theme';

interface Props {
  error: CapturedError;
  onRetry(): void;
}

export function ErrorFallback({ error, onRetry }: Props) {
  const layout = useResponsiveLayout();
  const [busy, setBusy] = useState(false);

  const run = async (task: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await task();
    } finally {
      setBusy(false);
    }
  };

  const confirmReset = () =>
    Alert.alert(
      'Reset app data?',
      'This permanently removes local app data from this installation. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset App Data', style: 'destructive', onPress: () => void run(storage.clear) },
      ],
    );

  const restart = async () => {
    if (Updates.isEnabled) await Updates.reloadAsync();
    else DevSettings.reload();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="title">Something went wrong</AppText>
        <AppText color="secondary" selectable>
          {error.message}
        </AppText>
        <View style={styles.actions}>
          <AppButton label="Try Again" onPress={onRetry} disabled={busy} />
          <AppButton label="Restart App" variant="secondary" onPress={() => void run(restart)} />
          <AppButton
            label="Run Diagnostics"
            variant="secondary"
            onPress={() => void run(() => runDiagnostics(error, layout))}
          />
          <AppButton
            label="Export Diagnostics"
            variant="secondary"
            onPress={() =>
              void run(async () => exportDiagnostics(await runDiagnostics(error, layout)))
            }
          />
          <AppButton
            label="Repair Local Data"
            variant="secondary"
            onPress={() => void run(repairStorage)}
          />
          <AppButton label="Reset App Data" variant="destructive" onPress={confirmReset} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { flexGrow: 1, justifyContent: 'center', gap: spacing.lg, padding: spacing.lg },
  actions: { gap: spacing.sm },
});
