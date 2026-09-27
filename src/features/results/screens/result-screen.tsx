import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { StatBadge } from '@/components/common/StatBadge';
import { AppScreen } from '@/components/layout/AppScreen';
import { colors, spacing } from '@/theme';
import type { MissionResult } from '@/types/game';
import { routes } from '@/types/navigation';

export function ResultScreen({ missionId, status }: { missionId: string; status: MissionResult }) {
  const success = status === 'success';
  return (
    <AppScreen scroll maxWidth="readable">
      <View style={styles.header}>
        <AppText style={[styles.icon, { color: success ? colors.primary : colors.destructive }]}>
          {success ? '✓' : '×'}
        </AppText>
        <AppText variant="title">Heist {success ? 'Successful' : 'Failed'}</AppText>
      </View>
      {success ? (
        <>
          <AppCard>
            <AppText variant="label">Primary Objective</AppText>
            <AppText>✓ Steal the Emerald Crown</AppText>
            <AppText variant="label">Optional Objectives</AppText>
            {['No alarms', 'Recover security records', 'Finish under 90 seconds'].map((item) => (
              <AppText key={item}>✓ {item}</AppText>
            ))}
          </AppCard>
          <View style={styles.stats}>
            <StatBadge label="Completion" value="00:38" />
            <StatBadge label="Alarms" value="0" />
            <StatBadge label="Detected" value="0" />
            <StatBadge label="Rating" value="S" />
          </View>
        </>
      ) : (
        <AppCard>
          <AppText variant="label">Reason</AppText>
          <AppText color="destructive">Runner detected by guard</AppText>
        </AppCard>
      )}
      <AppButton label="Replay" onPress={() => router.replace(routes.execution(missionId))} />
      <AppButton
        label={success ? 'Continue' : 'Adjust Plan'}
        variant="secondary"
        onPress={() => router.replace(success ? routes.home : routes.planning(missionId))}
      />
      {success ? (
        <AppButton
          label="Preview Failure State"
          variant="secondary"
          onPress={() => router.replace(routes.result(missionId, 'failure'))}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.lg },
  icon: { fontSize: 56, lineHeight: 62, fontWeight: '800' },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
