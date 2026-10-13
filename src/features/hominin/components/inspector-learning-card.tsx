import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { HomininInspectorViewModel } from '@/features/hominin/types';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function InspectorLearningCard({ individual }: { individual: HomininInspectorViewModel }) {
  return (
    <AppCard>
      <AppText variant="heading">Acquired knowledge</AppText>
      <AppText color="secondary">
        Learned behaviours and preferences arise from recorded experience, not the genome.
      </AppText>
      <AppText variant="label">Learned behaviours</AppText>
      {individual.learnedBehaviours.length ? (
        individual.learnedBehaviours.map((behaviour) => (
          <View key={behaviour.key} style={styles.learned}>
            <View style={styles.row}>
              <AppText variant="label">{behaviour.label}</AppText>
              <AppText variant="caption" selectable>
                {behaviour.proficiency}% proficiency
              </AppText>
            </View>
            <AppText variant="caption">
              First learned at tick {behaviour.learnedAtTick} · Reinforced {behaviour.reinforcement}{' '}
              times
            </AppText>
            <AppText variant="caption">
              {behaviour.acquisitionSource} · {behaviour.practiceCount} practices ·{' '}
              {behaviour.successfulAttempts} successful · {behaviour.failedAttempts} failed
            </AppText>
            {behaviour.learnedFrom ? (
              <AppText variant="caption">
                Learned from {behaviour.learnedFrom.name} ({behaviour.learnedFrom.id})
              </AppText>
            ) : null}
          </View>
        ))
      ) : (
        <EmptyCopy text="No learned behaviours are recorded for this individual." />
      )}
      <AppText variant="label">Experience-shaped preferences</AppText>
      {individual.preferences.length ? (
        individual.preferences.map((preference) => (
          <View key={preference.key} style={styles.preference}>
            <AppText>{preference.label}</AppText>
            <AppText
              variant="caption"
              selectable
              style={preference.direction === 'favoured' ? styles.positive : styles.negative}
            >
              {preference.direction} · {preference.value > 0 ? '+' : ''}
              {preference.value}
            </AppText>
          </View>
        ))
      ) : (
        <EmptyCopy text="No durable action preferences have been recorded yet." />
      )}
      <AppButton
        label="View Learning Journey"
        variant="secondary"
        onPress={() => router.push(routes.individualLearning(individual.id))}
      />
    </AppCard>
  );
}

function EmptyCopy({ text }: { text: string }) {
  return (
    <View style={styles.empty}>
      <AppText variant="caption">{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  learned: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  preference: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  positive: { color: colors.accentNature },
  negative: { color: colors.accentDanger },
  empty: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
});
