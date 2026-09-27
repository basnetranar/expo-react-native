import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { NavigationCard } from '@/components/common/NavigationCard';
import { StatBadge } from '@/components/common/StatBadge';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function HomeScreen() {
  return (
    <AppScreen scroll>
      <View style={styles.topBar}>
        <View style={styles.titleBlock}>
          <AppText variant="caption" style={styles.eyebrow}>
            OPERATIONS DESK
          </AppText>
          <AppText variant="title">Heist Planner</AppText>
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push(routes.settings)}>
          <AppText style={styles.settings}>Settings</AppText>
        </Pressable>
      </View>
      <View style={styles.stats}>
        <StatBadge label="Funds" value="$12,500" />
        <StatBadge label="Profile" value="Level 1" />
      </View>
      <AppCard style={styles.hero}>
        <AppText variant="caption" style={styles.eyebrow}>
          ACTIVE OPERATION
        </AppText>
        <AppText variant="heading">Museum Vault</AppText>
        <AppText color="secondary">Planning started · crew and route still need review.</AppText>
        <AppButton
          label="Continue Mission"
          onPress={() => router.push(routes.planning('museum-vault'))}
        />
      </AppCard>
      <View style={styles.sectionRow}>
        <AppText variant="heading">Available Missions</AppText>
        <Pressable onPress={() => router.push(routes.missions)}>
          <AppText style={styles.link}>View all</AppText>
        </Pressable>
      </View>
      <NavigationCard
        title="Museum Vault"
        description="Medium risk · $12,500 reward"
        href={routes.mission('museum-vault')}
      />
      <ResponsiveGrid phoneColumns={1} tabletColumns={3} largeTabletColumns={3}>
        <NavigationCard title="Crew" description="5 specialists ready" href={routes.crew} />
        <NavigationCard
          title="Equipment"
          description="Review field inventory"
          href={routes.equipment}
          accent={colors.accentBlue}
        />
        <NavigationCard
          title="Upgrades"
          description="Expand your operation"
          href={routes.upgrades}
          accent={colors.warning}
        />
      </ResponsiveGrid>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  titleBlock: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.primary, fontWeight: '800', letterSpacing: 1.4 },
  settings: { color: colors.accentBlue, fontWeight: '700' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  hero: { gap: spacing.md, backgroundColor: colors.surfaceRaised },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  link: { color: colors.primary, fontWeight: '700' },
});
