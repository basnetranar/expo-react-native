import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { SocialActivityList } from '@/features/social/components/social-activity-list';
import { SocialNavigation } from '@/features/social/components/social-navigation';
import { useSocialSnapshot } from '@/features/social/hooks/use-social-snapshot';
import type { SocialEventType } from '@/simulation';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

type Filter = 'all' | 'foraging' | 'sharing' | 'grooming' | 'groups' | 'conflicts';
const filters: Filter[] = ['all', 'foraging', 'sharing', 'grooming', 'groups', 'conflicts'];

export function SocialActivityScreen() {
  const social = useSocialSnapshot();
  const [filter, setFilter] = useState<Filter>('all');
  if (!social)
    return (
      <AppScreen>
        <EmptyState title="No active simulation" />
      </AppScreen>
    );
  const events = social.recentActivity.filter((event) => matches(filter, event.type));
  return (
    <AppScreen scroll>
      <AppText variant="caption" style={styles.eyebrow}>
        FIRST MINDS / SOCIAL
      </AppText>
      <AppText variant="heading">Group Activity</AppText>
      <SocialNavigation selected="activity" />
      <View style={styles.filters}>
        {filters.map((item) => (
          <Pressable
            key={item}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.selected]}
          >
            <AppText variant="caption" style={filter === item && styles.selectedText}>
              {item[0]?.toUpperCase()}
              {item.slice(1)}
            </AppText>
          </Pressable>
        ))}
      </View>
      <SocialActivityList
        events={events}
        illustrated
        onPerson={(id) => router.push(routes.hominin(id))}
      />
    </AppScreen>
  );
}

function matches(filter: Filter, type: SocialEventType): boolean {
  if (filter === 'all') return true;
  if (filter === 'foraging') return type === 'cooperativeForaging';
  if (filter === 'sharing') return type === 'foodShared';
  if (filter === 'grooming') return type === 'socialGrooming';
  if (filter === 'conflicts') return type === 'socialConflict';
  return type.startsWith('socialGroup');
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filter: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
  },
  selected: {
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.accentScience,
  },
  selectedText: { color: colors.accentScience },
});
