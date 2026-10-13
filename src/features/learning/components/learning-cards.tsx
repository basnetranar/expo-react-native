import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { BehaviourCultureViewModel, LearningEventViewModel } from '@/features/learning/types';
import { LEARNING_ART } from '@/features/learning/utils/learning-assets';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function LearningMetric({
  label,
  value,
  note,
}: {
  label: string;
  value: number;
  note: string;
}) {
  return (
    <AppCard style={styles.metric} accessible accessibilityLabel={`${label}: ${value}. ${note}`}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="metric" selectable style={styles.tabular}>
        {value}
      </AppText>
      <AppText variant="caption">{note}</AppText>
    </AppCard>
  );
}

export function BehaviourCard({ behaviour }: { behaviour: BehaviourCultureViewModel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${behaviour.name}. ${behaviour.status}. ${behaviour.adoptionPercent} percent adoption.`}
      onPress={() => router.push(routes.learningBehaviour(behaviour.id))}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppCard style={styles.behaviour}>
        {behaviour.id === 'stoneCracking' ? (
          <Image
            source={LEARNING_ART.stoneCracking}
            style={styles.icon}
            contentFit="contain"
            accessibilityLabel="Stone core"
          />
        ) : (
          <View style={styles.icon} accessible accessibilityLabel="Foraging knowledge symbol" />
        )}
        <View style={styles.behaviourCopy}>
          <View style={styles.rowBetween}>
            <AppText variant="label">{behaviour.name}</AppText>
            <Status status={behaviour.status} />
          </View>
          <AppText variant="caption">{behaviour.description}</AppText>
          <View style={styles.progressTrack}>
            <View style={[styles.progress, { width: `${behaviour.adoptionPercent}%` }]} />
          </View>
          <AppText variant="caption" selectable>
            {behaviour.practitioners.length} practitioners · {behaviour.adoptionPercent}% adoption
          </AppText>
        </View>
      </AppCard>
    </Pressable>
  );
}

export function LearningEventList({ events }: { events: readonly LearningEventViewModel[] }) {
  if (!events.length)
    return (
      <AppCard>
        <AppText variant="label">No recorded learning history</AppText>
        <AppText color="secondary">
          Events appear only after actual discovery, observation, practice, transmission, or loss.
        </AppText>
      </AppCard>
    );
  return (
    <View style={styles.eventList}>
      {events.map((event) => (
        <Pressable
          key={event.id}
          disabled={!event.agentId}
          onPress={() => event.agentId && router.push(routes.individualLearning(event.agentId))}
          style={styles.event}
          accessibilityRole={event.agentId ? 'button' : undefined}
          accessibilityLabel={`${event.title}. ${event.detail}. Generation ${event.generation}.`}
        >
          <View style={styles.eventDot} />
          <View style={styles.eventCopy}>
            <AppText variant="label">{event.title}</AppText>
            <AppText variant="caption">{event.detail || 'Population record'}</AppText>
          </View>
          <AppText variant="caption" selectable>
            Gen {event.generation}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

function Status({ status }: { status: BehaviourCultureViewModel['status'] }) {
  return (
    <View
      style={[
        styles.status,
        status === 'known' ? styles.known : status === 'lost' ? styles.lost : styles.unknown,
      ]}
    >
      <AppText variant="caption">
        {status === 'known' ? 'Known' : status === 'lost' ? 'Lost' : 'Undiscovered'}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { flex: 1, minWidth: 120 },
  tabular: { fontVariant: ['tabular-nums'], color: colors.accentDiscovery },
  behaviour: { flexDirection: 'row', alignItems: 'center' },
  icon: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  behaviourCopy: { flex: 1, gap: spacing.xs },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    alignItems: 'center',
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
    overflow: 'hidden',
  },
  progress: { height: '100%', borderRadius: radius.full, backgroundColor: colors.accentScience },
  status: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  known: { backgroundColor: colors.culturalKnownSurface },
  lost: { backgroundColor: colors.culturalLostSurface },
  unknown: { backgroundColor: colors.backgroundElevated },
  pressed: { opacity: 0.72 },
  eventList: {
    gap: 0,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  event: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  eventDot: {
    width: 9,
    height: 9,
    borderRadius: radius.full,
    backgroundColor: colors.accentDiscovery,
  },
  eventCopy: { flex: 1, minWidth: 0 },
});
