import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { PlanningCanvas } from '@/features/planning/components/planning-canvas';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function ExecutionScreen({ missionId }: { missionId: string }) {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  return (
    <AppScreen scroll>
      <View style={styles.header}>
        <AppText variant="caption" style={styles.live}>
          ● LIVE OPERATION
        </AppText>
        <AppText variant="title">Executing Plan…</AppText>
        <AppText style={styles.timer}>00:16 / 00:40</AppText>
      </View>
      <PlanningCanvas compact />
      <AppCard>
        <View style={styles.progress}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.controls}>
          <AppButton
            label={paused ? 'Resume' : 'Pause'}
            variant="secondary"
            onPress={() => setPaused((value) => !value)}
            style={styles.button}
          />
          <AppButton
            label={`${speed}× Speed`}
            variant="secondary"
            onPress={() => setSpeed((value) => (value === 1 ? 2 : 1))}
            style={styles.button}
          />
        </View>
      </AppCard>
      <AppButton
        label="View Placeholder Result"
        onPress={() => router.replace(routes.result(missionId))}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm },
  live: { color: colors.destructive, fontWeight: '800', letterSpacing: 1.2 },
  timer: { color: colors.primary, fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  progress: {
    height: 8,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressFill: { width: '40%', height: 8, backgroundColor: colors.primary },
  controls: { flexDirection: 'row', gap: spacing.sm },
  button: { flex: 1 },
});
