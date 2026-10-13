import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { MetricTile } from '@/components/common/MetricTile';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { SocialNavigation } from '@/features/social/components/social-navigation';
import { useSocialSnapshot } from '@/features/social/hooks/use-social-snapshot';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, spacing } from '@/theme';

export function SocialInsightsScreen() {
  const social = useSocialSnapshot();
  const { isTablet } = useResponsiveLayout();
  if (!social)
    return (
      <AppScreen>
        <EmptyState title="No active simulation" />
      </AppScreen>
    );
  const m = social.metrics;
  return (
    <AppScreen scroll>
      <AppText variant="caption" style={styles.eyebrow}>
        FIRST MINDS / SOCIAL
      </AppText>
      <AppText variant={isTablet ? 'display' : 'heading'}>Social Insights</AppText>
      <SocialNavigation selected="insights" />
      <View style={styles.metrics}>
        <MetricTile
          label="Active groups"
          value={String(m.activeGroups)}
          accent={colors.accentDiscovery}
        />
        <MetricTile label="Solitary" value={String(m.solitaryIndividuals)} />
        <MetricTile
          label="Positive ties"
          value={String(m.positiveRelationships)}
          accent={colors.positive}
        />
        <MetricTile
          label="Negative ties"
          value={String(m.negativeRelationships)}
          accent={colors.destructive}
        />
      </View>
      <View style={[styles.columns, isTablet && styles.tablet]}>
        <Insight
          title="Social structure"
          rows={[
            ['Group sizes', m.groupSizes.length ? m.groupSizes.join(', ') : 'None'],
            ['Grouped individuals', String(m.groupedIndividuals)],
            ['Socially isolated', String(m.isolatedIndividuals)],
          ]}
        />
        <Insight
          title="Relationships"
          rows={[
            ['Active relationships', String(m.activeRelationships)],
            ['Average familiarity', m.averageFamiliarity.toFixed(1)],
            ['Average trust', m.averageTrust.toFixed(1)],
            ['Neutral ties', String(m.neutralRelationships)],
          ]}
        />
        <Insight
          title="Cooperation"
          rows={[
            ['Cooperative foraging', String(m.cooperativeForagingEvents)],
            ['Food sharing', String(m.foodSharingEvents)],
            ['Grooming', String(m.groomingEvents)],
            ['Groups dissolved', String(m.groupDissolutionEvents)],
          ]}
        />
      </View>
      <AppCard>
        <AppText variant="heading">Trends</AppText>
        <AppText color="secondary">
          Current metrics are recorded from real engine state. Per-generation social trend summaries
          are not yet retained, so no synthetic chart is shown.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

function Insight({ title, rows }: { title: string; rows: readonly (readonly [string, string])[] }) {
  return (
    <AppCard style={styles.insight}>
      <AppText variant="heading">{title}</AppText>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <AppText color="secondary">{label}</AppText>
          <AppText variant="label">{value}</AppText>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.2 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  columns: { gap: spacing.md },
  tablet: { flexDirection: 'row', alignItems: 'stretch' },
  insight: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
