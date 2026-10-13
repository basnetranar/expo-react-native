import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { LearningEventList } from '@/features/learning/components/learning-cards';
import { LearningNavigation } from '@/features/learning/components/learning-navigation';
import { useLearningSnapshot } from '@/features/learning/hooks/use-learning-snapshot';
import type { LearningEventViewModel } from '@/features/learning/types';
import { LEARNING_ART } from '@/features/learning/utils/learning-assets';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';

type Filter = 'all' | 'discoveries' | 'adoption' | 'loss';

export function CulturalHistoryScreen() {
  const learning = useLearningSnapshot();
  const [filter, setFilter] = useState<Filter>('all');
  const { isTablet } = useResponsiveLayout();
  if (!learning)
    return (
      <AppScreen>
        <EmptyState title="Cultural history unavailable" />
      </AppScreen>
    );
  const historical = [...learning.milestones, ...learning.events]
    .filter(
      (event, index, all) => all.findIndex((candidate) => candidate.id === event.id) === index,
    )
    .sort((a, b) => b.tick - a.tick);
  const events = historical.filter((event) => matchesFilter(event, filter));
  return (
    <AppScreen scroll maxWidth="content" statusBarStyle="light">
      <Image
        source={LEARNING_ART.culturalHistory}
        style={[styles.hero, isTablet && styles.heroTablet]}
        contentFit="cover"
        accessibilityLabel="Hominin group sharing knowledge"
      />
      <View style={styles.heading}>
        <AppText variant="title">Cultural History</AppText>
        <AppText color="secondary">
          A chronological record of verified discovery, spread, loss, and rediscovery.
        </AppText>
      </View>
      <LearningNavigation selected="history" />
      <View style={styles.filters} accessibilityRole="tablist">
        {(['all', 'discoveries', 'adoption', 'loss'] as const).map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === item }}
            style={[styles.filter, filter === item && styles.selected]}
          >
            <AppText variant="label">{item[0]!.toUpperCase() + item.slice(1)}</AppText>
          </Pressable>
        ))}
      </View>
      <View style={[styles.columns, isTablet && styles.columnsTablet]}>
        <View style={styles.timeline}>
          <LearningEventList events={events} />
        </View>
        <View style={styles.trends}>
          <AppCard>
            <AppText variant="heading">Cultural trends</AppText>
            {learning.summaries.length ? (
              learning.behaviours
                .filter((item) => item.historicallyDiscovered)
                .map((behaviour) => {
                  const points = learning.summaries.map(
                    (summary) => summary.behaviours[behaviour.id],
                  );
                  const latest = points.at(-1);
                  return (
                    <View key={behaviour.id} style={styles.trend}>
                      <AppText variant="label">{behaviour.name}</AppText>
                      <View style={styles.track}>
                        <View
                          style={[
                            styles.bar,
                            { width: `${Math.round((latest?.adoption ?? 0) * 100)}%` },
                          ]}
                        />
                      </View>
                      <AppText variant="caption" selectable>
                        {Math.round((latest?.adoption ?? 0) * 100)}% adoption ·{' '}
                        {latest?.newAcquisitions ?? 0} new learners in latest completed generation
                      </AppText>
                    </View>
                  );
                })
            ) : (
              <AppText color="secondary">
                No completed-generation cultural summaries are available yet.
              </AppText>
            )}
            {learning.historyLimited ? (
              <AppText variant="caption">
                Older summaries were discarded by the bounded retention policy; the chart shows the
                available range.
              </AppText>
            ) : null}
          </AppCard>
        </View>
      </View>
    </AppScreen>
  );
}

function matchesFilter(event: LearningEventViewModel, filter: Filter) {
  if (filter === 'all') return true;
  if (filter === 'discoveries')
    return event.type === 'behaviourDiscovered' || event.type === 'behaviourRediscovered';
  if (filter === 'loss') return event.type === 'behaviourLost';
  return (
    event.type === 'behaviourAcquired' ||
    event.type === 'behaviourTransmitted' ||
    event.type === 'behaviourDemonstrated'
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 210, borderRadius: radius.lg, backgroundColor: colors.surface },
  heroTablet: { height: 280 },
  heading: { gap: spacing.xs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  selected: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.accentScience,
  },
  columns: { gap: spacing.lg },
  columnsTablet: { flexDirection: 'row', alignItems: 'flex-start' },
  timeline: { flex: 1.4 },
  trends: { flex: 1 },
  trend: { gap: spacing.xs, paddingVertical: spacing.sm },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
    overflow: 'hidden',
  },
  bar: { height: '100%', borderRadius: radius.full, backgroundColor: colors.accentScience },
});
