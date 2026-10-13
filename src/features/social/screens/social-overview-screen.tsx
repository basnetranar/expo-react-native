import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { SOCIAL_ART } from '@/features/simulation/utils/simulation-assets';
import { SocialActivityList } from '@/features/social/components/social-activity-list';
import { SocialNavigation } from '@/features/social/components/social-navigation';
import { SocialSummary } from '@/features/social/components/social-summary';
import { useSocialSnapshot } from '@/features/social/hooks/use-social-snapshot';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function SocialOverviewScreen() {
  const social = useSocialSnapshot();
  const { isTablet } = useResponsiveLayout();
  if (!social)
    return (
      <AppScreen>
        <EmptyState
          title="No active simulation"
          message="Create or restore a world before viewing its social life."
        />
      </AppScreen>
    );
  return (
    <AppScreen scroll maxWidth="content" statusBarStyle="light" edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="caption" style={styles.eyebrow}>
            FIRST MINDS / SOCIAL
          </AppText>
          <AppText variant={isTablet ? 'display' : 'heading'}>Social Groups</AppText>
          <AppText color="secondary">
            Generation {social.generation} · Tick {social.tick}
          </AppText>
        </View>
        <Image
          source={SOCIAL_ART.hero}
          style={[styles.hero, isTablet && styles.heroTablet]}
          contentFit="cover"
        />
      </View>
      <SocialNavigation selected="groups" />
      <SocialSummary social={social} />
      <View style={[styles.columns, isTablet && styles.columnsTablet]}>
        <View style={styles.main}>
          <AppText variant="heading">Active groups</AppText>
          {social.groups.length ? (
            social.groups.map((group) => (
              <Pressable key={group.id} onPress={() => router.push(routes.socialGroup(group.id))}>
                <AppCard style={styles.groupCard}>
                  <View style={styles.groupHeading}>
                    <View>
                      <AppText variant="heading">{group.label}</AppText>
                      <AppText variant="caption">
                        Formed Gen {group.formedGeneration} · {group.ageTicks} ticks active
                      </AppText>
                    </View>
                    <AppText variant="metric" style={styles.count}>
                      {group.members.length}
                    </AppText>
                  </View>
                  <View style={styles.members}>
                    {group.members.map((member) => (
                      <AppText key={member.id} variant="caption" style={styles.member}>
                        {member.name}
                      </AppText>
                    ))}
                  </View>
                </AppCard>
              </Pressable>
            ))
          ) : (
            <EmptyState
              title="No active groups"
              message="Groups form only after nearby individuals build sufficient familiarity."
            />
          )}
        </View>
        <View style={styles.side}>
          <AppText variant="heading">Recent social activity</AppText>
          <SocialActivityList
            events={social.recentActivity.slice(0, 6)}
            onPerson={(id) => router.push(routes.hominin(id))}
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md },
  headerCopy: { gap: spacing.xs },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.2 },
  hero: { width: '100%', height: 180, borderRadius: radius.lg, backgroundColor: colors.surface },
  heroTablet: { height: 260 },
  columns: { gap: spacing.lg },
  columnsTablet: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1.35, gap: spacing.sm },
  side: { flex: 1, gap: spacing.sm },
  groupCard: { gap: spacing.md },
  groupHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  count: { color: colors.accentDiscovery },
  members: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  member: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
  },
});
