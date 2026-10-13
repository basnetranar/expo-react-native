import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { LearningEventList, LearningMetric } from '@/features/learning/components/learning-cards';
import { useLearningSnapshot } from '@/features/learning/hooks/use-learning-snapshot';
import { LEARNING_ART } from '@/features/learning/utils/learning-assets';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function BehaviourDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const learning = useLearningSnapshot();
  const { isTablet } = useResponsiveLayout();
  const behaviour = learning?.behaviours.find(
    (item) => item.id === id && item.historicallyDiscovered,
  );
  if (!behaviour)
    return (
      <AppScreen>
        <EmptyState
          title="Behaviour unavailable"
          message="This behaviour has not been recorded in the active history, or the ID is invalid."
        />
      </AppScreen>
    );
  const pathways = new Set(behaviour.practitioners.map((item) => item.acquisitionSource));
  return (
    <AppScreen scroll maxWidth="content" statusBarStyle="light">
      <Image
        source={LEARNING_ART.observation}
        style={[styles.hero, isTablet && styles.heroTablet]}
        contentFit="cover"
        accessibilityLabel="Hominins observing stone use"
      />
      <View style={styles.title}>
        <AppText variant="title">{behaviour.name}</AppText>
        <AppText color="secondary">{behaviour.description}</AppText>
      </View>
      <View style={styles.metrics}>
        <LearningMetric
          label="Practitioners"
          value={behaviour.practitioners.length}
          note={`${behaviour.adoptionPercent}% adoption`}
        />
        <LearningMetric
          label="Average skill"
          value={behaviour.averageProficiency}
          note="living practitioners"
        />
        <LearningMetric
          label="Highest skill"
          value={behaviour.highestProficiency}
          note="current maximum"
        />
      </View>
      <View style={[styles.columns, isTablet && styles.columnsTablet]}>
        <View style={styles.column}>
          <AppCard>
            <AppText variant="heading">Recorded learning pathways</AppText>
            <AppText color="secondary">
              These are observed acquisition sources in this world, not guaranteed ways to learn.
            </AppText>
            {pathways.size ? (
              [...pathways].map((pathway) => (
                <AppText key={pathway}>• {pathwayLabel(pathway)}</AppText>
              ))
            ) : (
              <AppText color="secondary">No acquisition pathway is retained.</AppText>
            )}
          </AppCard>
          <AppText variant="heading">Known by</AppText>
          {behaviour.practitioners.length ? (
            behaviour.practitioners.slice(0, 30).map((person) => (
              <Pressable
                key={person.id}
                onPress={() => router.push(routes.individualLearning(person.id))}
                style={styles.person}
                accessibilityRole="button"
              >
                <View>
                  <AppText variant="label">{person.name}</AppText>
                  <AppText variant="caption">
                    Generation {person.generation} · {person.acquisitionSource}
                  </AppText>
                </View>
                <AppText selectable>{person.proficiency}%</AppText>
              </Pressable>
            ))
          ) : (
            <EmptyState
              title="Knowledge currently lost"
              message="The historical discovery remains, but no living practitioner retains it."
            />
          )}
          <AppButton
            label="View verified transmission"
            variant="secondary"
            onPress={() => router.push(routes.learningTransmission(behaviour.id))}
          />
        </View>
        <View style={styles.column}>
          <AppText variant="heading">Historical record</AppText>
          {behaviour.firstDiscovery ? (
            <AppCard>
              <AppText variant="label">First verified discovery</AppText>
              <AppText>
                Generation {behaviour.firstDiscovery.generation} · Tick{' '}
                {behaviour.firstDiscovery.tick}
              </AppText>
              <AppText variant="caption">{behaviour.firstDiscovery.detail}</AppText>
            </AppCard>
          ) : null}
          <LearningEventList events={behaviour.events.slice(0, 12)} />
        </View>
      </View>
    </AppScreen>
  );
}

function pathwayLabel(source: string) {
  if (source === 'experimentation') return 'Independent experimentation';
  if (source === 'teaching') return 'Social demonstration with trusted observer';
  if (source === 'imitation') return 'Imitation after observation';
  return 'Experience through successful action';
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 240, borderRadius: radius.lg, backgroundColor: colors.surface },
  heroTablet: { height: 330 },
  title: { gap: spacing.xs },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  columns: { gap: spacing.lg },
  columnsTablet: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: spacing.sm },
  person: {
    minHeight: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
