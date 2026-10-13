import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { LifeStageStatistic } from '@/features/population/types';
import { stageLabel } from '@/features/population/utils/population-presentation';
import type { LifeStage } from '@/simulation';
import { colors, radius, spacing } from '@/theme';

const stageColors: Record<LifeStage, string> = {
  juvenile: colors.accentScience,
  youngAdult: '#55C7AE',
  adult: colors.accentDiscovery,
  old: '#9489D8',
};

export function LifeStageCard({ stages }: { stages: readonly LifeStageStatistic[] }) {
  return (
    <AppCard>
      <AppText variant="heading">Life stage distribution</AppText>
      <View style={styles.bar} accessibilityLabel={distributionLabel(stages)}>
        {stages.map((item) =>
          item.count ? (
            <View
              key={item.stage}
              style={{ flex: item.count, backgroundColor: stageColors[item.stage] }}
            />
          ) : null,
        )}
        {!stages.some((item) => item.count) ? <View style={styles.emptyBar} /> : null}
      </View>
      <View style={styles.legend}>
        {stages.map((item) => (
          <View key={item.stage} style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: stageColors[item.stage] }]} />
            <View style={styles.legendCopy}>
              <AppText variant="caption">{stageLabel(item.stage)}</AppText>
              <AppText variant="label" selectable>
                {item.count} · {Math.round(item.proportion * 100)}%
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

function distributionLabel(stages: readonly LifeStageStatistic[]): string {
  return stages
    .map((item) => `${stageLabel(item.stage)} ${item.count}, ${Math.round(item.proportion * 100)}%`)
    .join('; ');
}

const styles = StyleSheet.create({
  bar: {
    height: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  emptyBar: { flex: 1, backgroundColor: colors.border },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { minWidth: 118, flex: 1, flexDirection: 'row', gap: spacing.sm },
  legendCopy: { gap: spacing.xs },
  dot: { width: 10, height: 10, marginTop: 4, borderRadius: radius.full },
});
