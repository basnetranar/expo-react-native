import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { InspectorHistoryCard } from '@/features/hominin/components/inspector-history-card';
import { InspectorIdentityCard } from '@/features/hominin/components/inspector-identity-card';
import { InspectorLearningCard } from '@/features/hominin/components/inspector-learning-card';
import { InspectorNeedsCard } from '@/features/hominin/components/inspector-needs-card';
import { InspectorRelationshipsCard } from '@/features/hominin/components/inspector-relationships-card';
import { InspectorTraitsCard } from '@/features/hominin/components/inspector-traits-card';
import { useHomininInspector } from '@/features/hominin/hooks/use-hominin-inspector';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function HomininScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { loading, individual, reason } = useHomininInspector(id);
  const { isTablet } = useResponsiveLayout();

  if (loading)
    return (
      <AppScreen>
        <EmptyState title="Opening individual record…" />
      </AppScreen>
    );

  if (!individual)
    return (
      <AppScreen>
        <EmptyState
          title="Individual unavailable"
          message={
            reason === 'no-session'
              ? 'Open an individual from the active Live Simulation. No second simulation is created for this screen.'
              : `No current or archived individual matches ${id ?? 'this ID'}.`
          }
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Create a World'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.createWorld))}
        />
      </AppScreen>
    );

  const openRelated = (relatedId: string) => router.push(routes.hominin(relatedId));

  return (
    <AppScreen scroll maxWidth="content" statusBarStyle="light">
      <View style={styles.introduction}>
        <AppText variant="caption" style={styles.eyebrow}>
          HOMININ INSPECTOR
        </AppText>
        <AppText color="secondary">
          Inherited potential, lived experience, and social learning from the active simulation.
        </AppText>
      </View>
      <View style={[styles.layout, isTablet && styles.tabletLayout]}>
        <View style={styles.column}>
          <InspectorIdentityCard individual={individual} />
          <InspectorNeedsCard individual={individual} />
          <InspectorTraitsCard traits={individual.traits} />
        </View>
        <View style={styles.column}>
          <InspectorLearningCard individual={individual} />
          <InspectorRelationshipsCard
            individual={individual}
            onOpen={openRelated}
            onOpenExplorer={() => router.push(routes.socialRelationships(individual.id))}
            onOpenGroup={(groupId) => router.push(routes.socialGroup(groupId))}
          />
          <InspectorHistoryCard individual={individual} />
        </View>
      </View>
      <AppButton
        label="View Family Tree"
        variant="secondary"
        onPress={() => router.push(routes.lineage(individual.id))}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  introduction: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.1 },
  layout: { gap: spacing.md },
  tabletLayout: { flexDirection: 'row', alignItems: 'flex-start' },
  column: { flex: 1, minWidth: 0, gap: spacing.md },
});
