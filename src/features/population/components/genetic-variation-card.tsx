import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { GeneticDiversitySummary } from '@/features/population/types';
import { colors, radius } from '@/theme';

export function GeneticVariationCard({ diversity }: { diversity: GeneticDiversitySummary }) {
  return (
    <AppCard accessibilityLabel="Genetic trait variation information">
      <View style={styles.heading}>
        <AppText variant="heading">Inherited trait variation</AppText>
        <AppText variant="caption" style={styles.info} accessibilityLabel="Information">
          i
        </AppText>
      </View>
      <AppText variant="metric" selectable style={styles.value}>
        {diversity.index === null ? '—' : `${diversity.index.toFixed(1)}%`}
      </AppText>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${Math.max(0, Math.min(100, diversity.index ?? 0))}%` }]}
        />
      </View>
      <AppText variant="caption" color="secondary">
        {diversity.explanation}
      </AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  info: {
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 22,
    borderWidth: 1,
    borderColor: colors.accentScience,
    borderRadius: radius.full,
    color: colors.accentScience,
  },
  value: { color: colors.accentScience, fontVariant: ['tabular-nums'] },
  track: {
    height: 9,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  fill: { height: '100%', borderRadius: radius.full, backgroundColor: colors.accentScience },
});
