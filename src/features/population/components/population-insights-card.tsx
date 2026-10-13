import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function PopulationInsightsCard({ insights }: { insights: readonly string[] }) {
  return (
    <AppCard>
      <AppText variant="heading">Key insights</AppText>
      {insights.map((insight) => (
        <View key={insight} style={styles.row}>
          <View style={styles.marker} />
          <AppText variant="caption" style={styles.copy}>
            {insight}
          </AppText>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs },
  marker: {
    width: 7,
    height: 7,
    marginTop: 5,
    borderRadius: radius.full,
    backgroundColor: colors.accentScience,
  },
  copy: { flex: 1 },
});
