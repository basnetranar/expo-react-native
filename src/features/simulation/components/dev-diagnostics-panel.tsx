import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SimulationSessionSnapshot } from '@/features/simulation/types';
import { colors, radius, spacing } from '@/theme';

export function DevDiagnosticsPanel({ snapshot }: { snapshot: SimulationSessionSnapshot }) {
  const [open, setOpen] = useState(false);
  if (!__DEV__) return null;
  const summary = snapshot.latestStats;
  const population = Math.max(1, snapshot.populationSize);
  const rows: [string, string | number][] = [
    ['Total food', snapshot.worldSummary.food.toFixed(1)],
    ['Total water', snapshot.worldSummary.water.toFixed(1)],
    ['Food / agent', (snapshot.worldSummary.food / population).toFixed(2)],
    ['Water / agent', (snapshot.worldSummary.water / population).toFixed(2)],
    ['Nearest water', summary?.resources.averageDistanceToWater.toFixed(2) ?? '—'],
    ['Dehydration deaths', summary?.deathCauses.dehydration ?? 0],
    ['Starvation deaths', summary?.deathCauses.starvation ?? 0],
    ['Ready adults', summary?.reproduction.conditionReadyPopulation ?? '—'],
    ['Local pairs', summary?.reproduction.localEligiblePairs ?? '—'],
    ['Migration rate', summary ? `${Math.round(summary.migrationRate * 100)}%` : '—'],
  ];
  return (
    <View style={styles.panel}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${open ? 'Collapse' : 'Expand'} developer diagnostics`}
        onPress={() => setOpen((value) => !value)}
      >
        <AppText variant="caption" style={styles.title}>
          DEV DIAGNOSTICS {open ? '−' : '+'}
        </AppText>
      </Pressable>
      {open ? (
        <View style={styles.grid}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <AppText variant="caption">{label}</AppText>
              <AppText variant="caption" style={styles.value}>
                {value}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
  },
  title: { color: colors.accentScience, fontWeight: '700' },
  grid: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  value: { color: colors.textPrimary, fontVariant: ['tabular-nums'] },
});
