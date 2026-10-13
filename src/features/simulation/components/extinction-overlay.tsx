import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import type { SimulationSessionSnapshot } from '@/features/simulation/types';
import { colors, radius, spacing } from '@/theme';

export function ExtinctionOverlay({
  snapshot,
  onTimeline,
  onNewWorld,
}: {
  snapshot: SimulationSessionSnapshot;
  onTimeline(): void;
  onNewWorld(): void;
}) {
  const causes = snapshot.latestStats?.deathCauses;
  const dominant = causes
    ? (Object.entries(causes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'unknown')
    : 'unknown';
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <AppText variant="title">Population Extinct</AppText>
        <AppText variant="body" color="secondary">
          The final hominin has died. This world will not restart automatically.
        </AppText>
        <View style={styles.metrics}>
          <Metric label="Final generation" value={snapshot.generation} />
          <Metric label="Peak population" value={snapshot.peakPopulation} />
          <Metric label="Dominant cause" value={dominant} />
        </View>
        <View style={styles.actions}>
          <AppButton label="View Timeline" variant="secondary" onPress={onTimeline} />
          <AppButton label="Start New World" onPress={onNewWorld} />
        </View>
      </View>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    inset: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(2, 8, 13, 0.88)',
  },
  card: {
    width: '100%',
    maxWidth: 480,
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.accentDanger,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metric: { flex: 1, minWidth: 100, gap: spacing.xs },
  actions: { gap: spacing.sm },
});
