import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { BehaviourCard } from '@/features/learning/components/learning-cards';
import { LearningNavigation } from '@/features/learning/components/learning-navigation';
import { useLearningSnapshot } from '@/features/learning/hooks/use-learning-snapshot';
import { colors, radius, spacing } from '@/theme';

type Filter = 'all' | 'known' | 'lost';

export function LearnedBehavioursScreen() {
  const learning = useLearningSnapshot();
  const [filter, setFilter] = useState<Filter>('all');
  if (!learning)
    return (
      <AppScreen>
        <EmptyState
          title="Learning record unavailable"
          message="Open this screen from an active world."
        />
      </AppScreen>
    );
  const discovered = learning.behaviours.filter((item) => item.historicallyDiscovered);
  const filtered = discovered.filter((item) => filter === 'all' || item.status === filter);
  return (
    <AppScreen scroll maxWidth="readable" statusBarStyle="light">
      <View style={styles.header}>
        <AppText variant="heading">Learned Behaviours</AppText>
        <AppText color="secondary">
          Only behaviours supported by real simulation mechanics are listed.
        </AppText>
      </View>
      <LearningNavigation selected="behaviours" />
      <View style={styles.filters} accessibilityRole="tablist">
        {(['all', 'known', 'lost'] as const).map((value) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === value }}
            onPress={() => setFilter(value)}
            style={[styles.filter, filter === value && styles.filterSelected]}
          >
            <AppText variant="label" style={filter === value && styles.filterText}>
              {value === 'all' ? 'All discovered' : value === 'known' ? 'Currently known' : 'Lost'}
            </AppText>
          </Pressable>
        ))}
      </View>
      {filtered.length ? (
        filtered.map((item) => <BehaviourCard key={item.id} behaviour={item} />)
      ) : (
        <EmptyState
          title={discovered.length ? 'No matching behaviours' : 'No behaviours discovered'}
          message={
            discovered.length
              ? 'Choose another cultural-status filter.'
              : 'Undiscovered behaviours remain hidden until the simulation records them.'
          }
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  filter: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterSelected: { backgroundColor: colors.surfaceStrong, borderColor: colors.accentScience },
  filterText: { color: colors.accentScience },
});
