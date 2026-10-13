import { StyleSheet, View } from 'react-native';

import { MetricTile } from '@/components/common/MetricTile';
import type { SocialOverviewViewModel } from '@/features/social/types';
import { colors, spacing } from '@/theme';

export function SocialSummary({ social }: { social: SocialOverviewViewModel }) {
  return (
    <View style={styles.metrics}>
      <MetricTile
        label="Population"
        value={String(social.population)}
        accent={colors.accentScience}
      />
      <MetricTile
        label="Groups"
        value={String(social.metrics.activeGroups)}
        accent={colors.accentDiscovery}
      />
      <MetricTile
        label="Grouped"
        value={String(social.metrics.groupedIndividuals)}
        accent={colors.positive}
      />
      <MetricTile
        label="Relationships"
        value={String(social.metrics.activeRelationships)}
        accent={colors.accentBlue}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
