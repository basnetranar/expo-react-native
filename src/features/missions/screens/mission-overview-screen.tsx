import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { StatBadge } from '@/components/common/StatBadge';
import { AppScreen } from '@/components/layout/AppScreen';
import { getMission } from '@/features/missions/data/missions';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function MissionOverviewScreen({ missionId }: { missionId: string }) {
  const mission = getMission(missionId);
  const primary = mission.objectives.find((objective) => !objective.optional)!;
  const optional = mission.objectives.filter((objective) => objective.optional);
  return (
    <AppScreen scroll>
      <SectionHeader eyebrow={mission.location} title={mission.title} />
      <View style={styles.stats}>
        <StatBadge label="Reward" value={`$${mission.reward.toLocaleString()}`} />
        <StatBadge label="Security" value={mission.securityLevel} />
        <StatBadge label="Crew" value={`${mission.crewSize} needed`} />
      </View>
      <AppCard>
        <AppText variant="caption" style={styles.accent}>
          PRIMARY OBJECTIVE
        </AppText>
        <AppText variant="heading">{primary.label}</AppText>
      </AppCard>
      <AppCard>
        <AppText variant="label">Optional objectives</AppText>
        {(optional.length ? optional : [{ id: 'intel', label: 'Gather additional intel' }]).map(
          (objective) => (
            <AppText key={objective.id} color="secondary">
              ◇ {objective.label}
            </AppText>
          ),
        )}
      </AppCard>
      <AppButton
        label="Review Mission Briefing"
        onPress={() => router.push(routes.briefing(mission.id))}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  accent: { color: colors.primary, fontWeight: '800', letterSpacing: 1.2 },
});
