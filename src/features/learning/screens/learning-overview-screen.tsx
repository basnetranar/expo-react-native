import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import {
  BehaviourCard,
  LearningEventList,
  LearningMetric,
} from '@/features/learning/components/learning-cards';
import { LearningNavigation } from '@/features/learning/components/learning-navigation';
import { useLearningSnapshot } from '@/features/learning/hooks/use-learning-snapshot';
import { LEARNING_ART } from '@/features/learning/utils/learning-assets';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function LearningOverviewScreen() {
  const learning = useLearningSnapshot();
  const { isTablet } = useResponsiveLayout();
  if (!learning)
    return (
      <AppScreen>
        <EmptyState
          title="No active simulation"
          message="Create or restore a world to inspect its cultural record."
        />
      </AppScreen>
    );
  const visible = learning.behaviours.filter((item) => item.historicallyDiscovered);
  return (
    <AppScreen scroll maxWidth="content" statusBarStyle="light" edges={['top', 'bottom']}>
      <View style={[styles.hero, isTablet && styles.heroTablet]}>
        <Image
          source={LEARNING_ART.hero}
          style={styles.heroImage}
          contentFit="cover"
          accessibilityLabel="Hominin experimenting with a stone"
        />
        <View style={styles.scrim} />
        <View style={styles.heroCopy}>
          <AppText variant="caption" style={styles.eyebrow}>
            FIRST MINDS / LEARNING
          </AppText>
          <AppText variant={isTablet ? 'display' : 'title'}>Learning & Cultural Evolution</AppText>
          <AppText>Discover. Observe. Learn. Pass it on.</AppText>
          <AppText variant="caption">
            Generation {learning.generation} · Population {learning.population}
          </AppText>
        </View>
      </View>
      <LearningNavigation selected="overview" />
      <View style={styles.metrics}>
        <LearningMetric label="Currently known" value={learning.knownCount} note="living culture" />
        <LearningMetric
          label="Discovered"
          value={learning.historicalCount}
          note="historical record"
        />
        <LearningMetric
          label="Knowledge holders"
          value={learning.knowledgeableIndividuals}
          note="living individuals"
        />
      </View>
      <View style={[styles.columns, isTablet && styles.columnsTablet]}>
        <View style={styles.column}>
          <View style={styles.sectionHeading}>
            <AppText variant="heading">Learned behaviours</AppText>
            <AppButton
              label="View all"
              variant="secondary"
              onPress={() => router.push(routes.learningBehaviours)}
            />
          </View>
          {visible.length ? (
            visible.map((item) => <BehaviourCard key={item.id} behaviour={item} />)
          ) : (
            <EmptyState
              title="No discoveries yet"
              message="Knowledge will appear after a living individual succeeds through experimentation or experience."
            />
          )}
        </View>
        <View style={styles.column}>
          <View style={styles.sectionHeading}>
            <AppText variant="heading">Recent learning activity</AppText>
            <AppButton
              label="History"
              variant="secondary"
              onPress={() => router.push(routes.learningHistory)}
            />
          </View>
          <LearningEventList events={learning.events.slice(0, isTablet ? 8 : 5)} />
          <AppCard>
            <AppText variant="label">Inherited potential ≠ acquired knowledge</AppText>
            <AppText color="secondary">
              Learning-related traits affect opportunity and success. Behaviours are acquired only
              through lived action and social interaction.
            </AppText>
          </AppCard>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 280,
    borderRadius: radius.lg,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    backgroundColor: colors.surface,
  },
  heroTablet: { height: 330 },
  heroImage: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(3, 10, 15, 0.58)' },
  heroCopy: { gap: spacing.xs, padding: spacing.lg },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.2 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  columns: { gap: spacing.lg },
  columnsTablet: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: spacing.sm },
  sectionHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
