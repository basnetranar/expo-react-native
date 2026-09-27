import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { StatBadge } from '@/components/common/StatBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { spacing } from '@/theme';
import type { Mission } from '@/types/game';
import { routes } from '@/types/navigation';

export function MissionCard({ mission }: { mission: Mission }) {
  return (
    <Pressable
      onPress={() => router.push(routes.mission(mission.id))}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppCard style={styles.card}>
        <View style={styles.heading}>
          <View style={styles.title}>
            <AppText variant="heading">{mission.title}</AppText>
            <AppText variant="caption">{mission.location}</AppText>
          </View>
          <StatusBadge
            label={mission.difficulty}
            tone={mission.difficulty === 'Hard' ? 'danger' : 'warning'}
          />
        </View>
        <View style={styles.stats}>
          <StatBadge label="Reward" value={`$${mission.reward.toLocaleString()}`} />
          <StatBadge label="Crew" value={String(mission.crewSize)} />
          <StatBadge label="Security" value={mission.securityLevel} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  heading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: { flex: 1, gap: spacing.xs },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pressed: { opacity: 0.72 },
});
