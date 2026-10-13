import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { LearningEventList } from '@/features/learning/components/learning-cards';
import { useIndividualLearning } from '@/features/learning/hooks/use-individual-learning';
import { LEARNING_ART } from '@/features/learning/utils/learning-assets';
import { presentEvent } from '@/features/learning/utils/learning-presentation';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function IndividualLearningScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const agent = useIndividualLearning(id);
  if (!agent)
    return (
      <AppScreen>
        <EmptyState
          title="Individual learning unavailable"
          message="No current or archived individual matches this ID."
        />
      </AppScreen>
    );
  return (
    <AppScreen scroll maxWidth="readable" statusBarStyle="light">
      <Image
        source={LEARNING_ART.groupPractice}
        style={styles.hero}
        contentFit="cover"
        accessibilityLabel="Hominins practicing together"
      />
      <View style={styles.title}>
        <View>
          <AppText variant="title">{getFriendlyName(agent.id)}</AppText>
          <AppText color="secondary">
            Generation {agent.generation} · Age {agent.age} ·{' '}
            {agent.alive ? 'Living' : 'Deceased — final recorded knowledge'}
          </AppText>
        </View>
        <AppText variant="caption" selectable>
          {agent.id}
        </AppText>
      </View>
      <AppCard>
        <AppText variant="heading">Learning potential</AppText>
        <AppText color="secondary">
          Inherited traits shape learning probability. They are not acquired knowledge.
        </AppText>
        <View style={styles.traits}>
          <Trait label="Learning" value={agent.genome.learningAbility} />
          <Trait label="Memory" value={agent.genome.memoryPotential} />
          <Trait label="Curiosity" value={agent.genome.curiosity} />
          <Trait label="Social" value={agent.genome.socialSensitivity} />
        </View>
      </AppCard>
      <AppText variant="heading">Acquired behaviours</AppText>
      {agent.learnedBehaviours.length ? (
        agent.learnedBehaviours.map((behaviour) => (
          <Pressable
            key={behaviour.type}
            onPress={() => router.push(routes.learningBehaviour(behaviour.type))}
            style={styles.behaviour}
            accessibilityRole="button"
          >
            <View style={styles.behaviourCopy}>
              <AppText variant="label">
                {behaviour.type === 'stoneCracking' ? 'Stone cracking' : 'Social foraging'}
              </AppText>
              <AppText variant="caption">
                Acquired through {behaviour.acquisitionSource}
                {behaviour.learnedFrom ? ` from ${getFriendlyName(behaviour.learnedFrom)}` : ''}
              </AppText>
              <AppText variant="caption">
                First learned tick {behaviour.firstLearnedAtTick} · last practiced tick{' '}
                {behaviour.lastPracticedAtTick}
              </AppText>
              <AppText variant="caption">
                {behaviour.successfulAttempts} successful · {behaviour.failedAttempts} failed ·{' '}
                {behaviour.practiceCount} practices
              </AppText>
            </View>
            <AppText variant="metric" selectable>
              {Math.round(behaviour.proficiency)}%
            </AppText>
          </Pressable>
        ))
      ) : (
        <EmptyState
          title="No acquired knowledge"
          message="No learned behaviour is recorded for this individual."
        />
      )}
      <AppText variant="heading">Recent learning record</AppText>
      <LearningEventList
        events={agent.learningEvents
          .map(presentEvent)
          .sort((a, b) => b.tick - a.tick)
          .slice(0, 20)}
      />
    </AppScreen>
  );
}

function Trait({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.trait}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="label" selectable>
        {Math.round(value)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { width: '100%', height: 240, borderRadius: radius.lg, backgroundColor: colors.surface },
  title: { gap: spacing.xs },
  traits: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  trait: {
    flex: 1,
    minWidth: 100,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  behaviour: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  behaviourCopy: { flex: 1, gap: spacing.xs },
});
