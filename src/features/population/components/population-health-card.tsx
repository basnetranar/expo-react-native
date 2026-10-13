import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { PopulationOverviewSnapshot } from '@/features/population/types';
import { colors, radius, spacing } from '@/theme';

export function PopulationHealthCard({ population }: { population: PopulationOverviewSnapshot }) {
  return (
    <AppCard>
      <AppText variant="heading">Average condition</AppText>
      {population.averageHealth === null ? (
        <AppText color="secondary">No living individuals to measure.</AppText>
      ) : (
        <View style={styles.rows}>
          <ConditionRow label="Health" value={population.averageHealth} color={colors.positive} />
          <ConditionRow
            label="Energy"
            value={population.averageEnergy!}
            color={colors.resourceFood}
          />
          <ConditionRow
            label="Hydration"
            value={population.averageHydration!}
            color={colors.resourceWater}
          />
          <ConditionRow
            label="Safety"
            value={population.averageSafety!}
            color={colors.resourceSafety}
          />
        </View>
      )}
      <AppText variant="caption" color="secondary">
        Arithmetic means of current 0–100 engine values for living individuals only.
      </AppText>
    </AppCard>
  );
}

function ConditionRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color },
          ]}
        />
      </View>
      <AppText variant="caption" selectable style={styles.value}>
        {Math.round(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: spacing.sm },
  row: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { width: 68 },
  value: { width: 28, textAlign: 'right', fontVariant: ['tabular-nums'] },
  track: {
    flex: 1,
    height: 8,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  fill: { height: '100%', borderRadius: radius.full },
});
