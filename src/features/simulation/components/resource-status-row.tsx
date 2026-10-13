import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SimulationSessionSnapshot } from '@/features/simulation/types';
import { colors, radius, spacing } from '@/theme';

type Status = 'Surplus' | 'Balanced' | 'Deficit' | 'Moderate';

export function ResourceStatusRow({ snapshot }: { snapshot: SimulationSessionSnapshot }) {
  const [expanded, setExpanded] = useState(false);
  const population = Math.max(1, snapshot.populationSize);
  const foodPerAgent = snapshot.worldSummary.food / population;
  const waterPerAgent = snapshot.worldSummary.water / population;
  const safety = Math.max(0, 100 - snapshot.worldSummary.predatorCount * 12);
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Resource pressure details"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.row}
      >
        <StatusItem
          label="Food"
          status={resourceStatus(foodPerAgent, 8, 18)}
          value={Math.min(1, foodPerAgent / 24)}
          color={colors.resourceFood}
        />
        <StatusItem
          label="Water"
          status={resourceStatus(waterPerAgent, 5, 12)}
          value={Math.min(1, waterPerAgent / 18)}
          color={colors.resourceWater}
        />
        <StatusItem
          label="Safety"
          status={safety > 75 ? 'Balanced' : safety > 45 ? 'Moderate' : 'Deficit'}
          value={safety / 100}
          color={colors.resourceSafety}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.details} accessibilityLiveRegion="polite">
          <AppText variant="caption">
            {foodPerAgent.toFixed(1)} food and {waterPerAgent.toFixed(1)} water per hominin ·{' '}
            {snapshot.worldSummary.predatorCount} predators
          </AppText>
          <AppText variant="caption">
            Engine resource pressure: {Math.round(snapshot.worldSummary.resourcePressure * 100)}%
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function resourceStatus(value: number, deficit: number, surplus: number): Status {
  return value < deficit ? 'Deficit' : value > surplus ? 'Surplus' : 'Balanced';
}

function StatusItem({
  label,
  status,
  value,
  color,
}: {
  label: string;
  status: Status;
  value: number;
  color: string;
}) {
  return (
    <View style={styles.item} accessibilityLabel={`${label}, ${status}`}>
      <View style={styles.labelRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <AppText variant="caption" style={styles.label}>
          {label}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { backgroundColor: color, width: `${value * 100}%` }]} />
      </View>
      <AppText variant="caption" style={[styles.status, { color }]}>
        {status}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  details: {
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  item: { flex: 1, gap: spacing.xs, padding: spacing.sm },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  dot: { width: 8, height: 8, borderRadius: radius.full },
  label: { color: colors.textPrimary },
  track: { height: 5, borderRadius: radius.full, backgroundColor: colors.surfaceStrong },
  fill: { height: '100%', borderRadius: radius.full },
  status: { fontSize: 11, lineHeight: 14 },
});
