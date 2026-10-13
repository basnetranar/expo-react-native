import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { useLearningSnapshot } from '@/features/learning/hooks/use-learning-snapshot';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function TransmissionExplorerScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const learning = useLearningSnapshot();
  const behaviour = learning?.behaviours.find(
    (item) => item.id === id && item.historicallyDiscovered,
  );
  if (!behaviour)
    return (
      <AppScreen>
        <EmptyState title="Transmission record unavailable" />
      </AppScreen>
    );
  const edges = behaviour.events
    .filter(
      (event) => event.type === 'behaviourTransmitted' && event.agentId && event.sourceAgentId,
    )
    .slice(0, 40);
  const independent = behaviour.events
    .filter(
      (event) => event.type === 'behaviourDiscovered' || event.type === 'behaviourRediscovered',
    )
    .slice(0, 12);
  return (
    <AppScreen scroll maxWidth="readable" statusBarStyle="light">
      <View style={styles.heading}>
        <AppText variant="title">{behaviour.name} transmission</AppText>
        <AppText color="secondary">
          Only verified acquisition links are shown. Shared group membership alone never creates an
          edge.
        </AppText>
      </View>
      <AppCard>
        <AppText variant="label">Bounded network</AppText>
        <AppText color="secondary">
          Showing up to 40 most recent verified transfers to keep rendering and interpretation
          bounded.
        </AppText>
      </AppCard>
      {edges.length ? (
        <View style={styles.network}>
          {edges.map((edge) => (
            <View
              key={edge.id}
              style={styles.edge}
              accessible
              accessibilityLabel={`${getFriendlyName(edge.sourceAgentId!)} transmitted to ${getFriendlyName(edge.agentId!)} in generation ${edge.generation}`}
            >
              <Person id={edge.sourceAgentId!} />
              <View style={styles.link}>
                <View style={styles.line} />
                <AppText variant="caption">
                  {edge.outcome === 'success' ? 'learned from' : 'observed from'} · Gen{' '}
                  {edge.generation}
                </AppText>
              </View>
              <Person id={edge.agentId!} />
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          title="No verified transfers"
          message="Individuals may know this behaviour independently, but no direct social acquisition edge is retained."
        />
      )}
      {independent.length ? (
        <>
          <AppText variant="heading">Independent origins</AppText>
          {independent.map((event) => (
            <Pressable
              key={event.id}
              style={styles.origin}
              onPress={() => event.agentId && router.push(routes.individualLearning(event.agentId))}
            >
              <AppText variant="label">
                {event.agentId ? getFriendlyName(event.agentId) : 'Population record'}
              </AppText>
              <AppText variant="caption">
                {event.type === 'behaviourRediscovered' ? 'Rediscovery' : 'Independent discovery'} ·
                Generation {event.generation}
              </AppText>
            </Pressable>
          ))}
        </>
      ) : null}
    </AppScreen>
  );
}

function Person({ id }: { id: string }) {
  return (
    <Pressable
      onPress={() => router.push(routes.individualLearning(id))}
      style={styles.person}
      accessibilityRole="button"
    >
      <View style={styles.avatar}>
        <AppText variant="label">{getFriendlyName(id).slice(0, 1)}</AppText>
      </View>
      <AppText variant="caption" numberOfLines={1}>
        {getFriendlyName(id)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { gap: spacing.xs },
  network: { gap: spacing.sm },
  edge: {
    minHeight: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  person: { width: 88, alignItems: 'center', gap: spacing.xs },
  avatar: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.accentScience,
  },
  link: { flex: 1, alignItems: 'center', gap: spacing.xs },
  line: { width: '100%', height: 2, backgroundColor: colors.accentDiscovery },
  origin: {
    minHeight: 56,
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
});
