import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { StatBadge } from '@/components/common/StatBadge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { spacing } from '@/theme';
import type { CrewMember } from '@/types/game';

export function CrewCard({
  member,
  selected,
  onPress,
}: {
  member: CrewMember;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppCard style={styles.card}>
        <View style={styles.heading}>
          <View>
            <AppText variant="heading">{member.name}</AppText>
            <AppText variant="caption">{member.role.toUpperCase()}</AppText>
          </View>
          {selected ? <StatusBadge label="Selected" tone="success" /> : null}
        </View>
        <AppText color="secondary">Specialty: {member.skill}</AppText>
        <View style={styles.stats}>
          <StatBadge label="Speed" value={`${member.speed}`} />
          <StatBadge label="Risk" value={member.risk} />
        </View>
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  heading: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  stats: { flexDirection: 'row', gap: spacing.sm },
  pressed: { opacity: 0.72 },
});
