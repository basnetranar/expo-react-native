import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { SOCIAL_ART } from '@/features/simulation/utils/simulation-assets';
import { SocialActivityList } from '@/features/social/components/social-activity-list';
import { useSocialSnapshot } from '@/features/social/hooks/use-social-snapshot';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function SocialGroupScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const social = useSocialSnapshot();
  const group = social?.groups.find((item) => item.id === id);
  const { isTablet } = useResponsiveLayout();
  if (!group)
    return (
      <AppScreen>
        <EmptyState
          title="Group unavailable"
          message="It may have dissolved, or no active simulation is open."
        />
      </AppScreen>
    );
  return (
    <AppScreen scroll statusBarStyle="light">
      <Image source={SOCIAL_ART.hero} style={styles.hero} contentFit="cover" />
      <AppText variant={isTablet ? 'display' : 'heading'}>{group.label}</AppText>
      <AppText color="secondary">
        Stable ID {group.id} · Formed generation {group.formedGeneration} · {group.ageTicks} ticks
        old
      </AppText>
      <View style={[styles.layout, isTablet && styles.tablet]}>
        <View style={styles.column}>
          <AppText variant="heading">Members ({group.members.length})</AppText>
          {group.members.map((member) => (
            <Pressable key={member.id} onPress={() => router.push(routes.hominin(member.id))}>
              <AppCard style={styles.member}>
                <Image source={SOCIAL_ART.portrait} style={styles.portrait} contentFit="cover" />
                <View style={styles.copy}>
                  <AppText variant="label">{member.name}</AppText>
                  <AppText variant="caption">
                    {member.id} · Gen {member.generation} · Age {member.age.toFixed(1)}
                  </AppText>
                </View>
                <AppText variant="heading" style={styles.link}>
                  ›
                </AppText>
              </AppCard>
            </Pressable>
          ))}
        </View>
        <View style={styles.column}>
          <AppText variant="heading">Recorded group activity</AppText>
          <SocialActivityList
            events={group.events}
            onPerson={(personId) => router.push(routes.hominin(personId))}
            illustrated
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 220, borderRadius: radius.lg, backgroundColor: colors.surface },
  layout: { gap: spacing.lg },
  tablet: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, gap: spacing.sm },
  member: { flexDirection: 'row', alignItems: 'center' },
  portrait: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
  },
  copy: { flex: 1, gap: 2 },
  link: { color: colors.accentScience },
});
