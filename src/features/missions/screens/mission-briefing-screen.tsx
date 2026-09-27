import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AppScreen } from '@/components/layout/AppScreen';
import { getMission } from '@/features/missions/data/missions';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const security = ['4 Cameras', '6 Guards', '2 Laser Grids', '3 Locked Doors', '2 Alarm Panels'];

export function MissionBriefingScreen({ missionId }: { missionId: string }) {
  const mission = getMission(missionId);
  return (
    <AppScreen scroll>
      <View style={styles.header}>
        <AppText variant="caption" style={styles.eyebrow}>
          MISSION BRIEFING
        </AppText>
        <AppText variant="title">{mission.title}</AppText>
        <AppText color="secondary">{mission.location}</AppText>
      </View>
      <AppCard>
        <SectionHeader eyebrow="Primary Objective" title="Steal the Emerald Crown" />
      </AppCard>
      <AppCard>
        <AppText variant="label">Optional Objectives</AppText>
        {['No alarms', 'Recover security records', 'Finish under 90 seconds'].map((item) => (
          <AppText key={item} color="secondary">
            ◇ {item}
          </AppText>
        ))}
      </AppCard>
      <SectionHeader eyebrow="Threat Analysis" title="Security Overview" />
      <View style={styles.securityGrid}>
        {security.map((item) => (
          <View key={item} style={styles.securityItem}>
            <AppText>{item}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.preview}>
        <AppText variant="heading">Building Preview</AppText>
        <AppText color="secondary">Floor-plan intelligence will appear here.</AppText>
        <View style={styles.floorLine} />
        <View style={[styles.floorLine, styles.shortLine]} />
      </View>
      <AppButton label="Start Planning" onPress={() => router.push(routes.planning(mission.id))} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 150,
    justifyContent: 'flex-end',
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  eyebrow: { color: colors.primary, fontWeight: '800', letterSpacing: 1.4 },
  securityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  securityItem: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.guardVision,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  preview: {
    minHeight: 190,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
  },
  floorLine: { height: 2, width: '80%', backgroundColor: colors.border },
  shortLine: { width: '52%', backgroundColor: colors.accentBlue },
});
