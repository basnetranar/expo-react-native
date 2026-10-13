import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { CulturalAdoptionStatistic } from '@/features/population/types';
import { behaviourLabel } from '@/features/population/utils/population-presentation';
import { colors, radius, spacing } from '@/theme';

export function CulturalAdoptionCard({
  adoption,
}: {
  adoption: readonly CulturalAdoptionStatistic[];
}) {
  return (
    <AppCard>
      <AppText variant="heading">Cultural adoption</AppText>
      <AppText variant="caption" color="secondary">
        Durable learned records among living individuals—not inherited potential.
      </AppText>
      {adoption.map((item) => (
        <View key={item.behaviour} style={styles.item}>
          <View style={styles.labelRow}>
            <AppText variant="label">{behaviourLabel(item.behaviour)}</AppText>
            <AppText variant="caption" selectable>
              {item.count} · {Math.round(item.proportion * 100)}%
            </AppText>
          </View>
          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                {
                  width: `${item.proportion * 100}%`,
                  backgroundColor:
                    item.behaviour === 'stoneCracking'
                      ? colors.accentDiscovery
                      : colors.accentScience,
                },
              ]}
            />
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  item: { gap: spacing.xs },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  track: {
    height: 10,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  fill: { height: '100%', borderRadius: radius.full },
});
