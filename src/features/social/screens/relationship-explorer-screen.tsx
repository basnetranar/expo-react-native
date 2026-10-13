import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import { SOCIAL_ART } from '@/features/simulation/utils/simulation-assets';
import { useSocialSnapshot } from '@/features/social/hooks/use-social-snapshot';
import { relationshipCategory } from '@/features/social/utils/social-presentation';
import type { Relationship } from '@/simulation';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function RelationshipExplorerScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const social = useSocialSnapshot();
  const agent =
    social?.agents.find((candidate) => candidate.id === id) ??
    (id ? getActiveSimulationSession()?.getInspectorSnapshot(id) : null);
  const [showWeak, setShowWeak] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const relationships = useMemo(
    () => agent?.relationships.filter((item) => showWeak || item.familiarity >= 5) ?? [],
    [agent, showWeak],
  );
  const relationship = relationships.find((item) => item.agentId === selected) ?? null;
  if (!agent)
    return (
      <AppScreen>
        <EmptyState
          title="Individual unavailable"
          message="The selected individual is not available in the current or archived simulation records."
        />
      </AppScreen>
    );
  return (
    <AppScreen scroll>
      <AppText variant="caption" style={styles.eyebrow}>
        RELATIONSHIP EXPLORER
      </AppText>
      <AppText variant="heading">{getFriendlyName(agent.id)}’s relationships</AppText>
      <Pressable onPress={() => setShowWeak((value) => !value)} style={styles.toggle}>
        <AppText variant="label">
          {showWeak ? 'Hide weak connections' : 'Show weak connections'}
        </AppText>
      </Pressable>
      <AppCard style={styles.network}>
        <Image source={SOCIAL_ART.portrait} style={styles.centrePortrait} contentFit="cover" />
        <AppText variant="heading">{getFriendlyName(agent.id)}</AppText>
        <View style={styles.nodes}>
          {relationships.map((item) => (
            <RelationshipNode
              key={item.agentId}
              relationship={item}
              selected={selected === item.agentId}
              onPress={() => setSelected(item.agentId)}
            />
          ))}
        </View>
        {!relationships.length ? (
          <AppText color="secondary">No relationships meet the current filter.</AppText>
        ) : null}
      </AppCard>
      {relationship ? (
        <RelationshipDetail
          agentId={agent.id}
          relationship={relationship}
          onOpen={() => router.push(routes.hominin(relationship.agentId))}
        />
      ) : null}
    </AppScreen>
  );
}

function RelationshipNode({
  relationship,
  selected,
  onPress,
}: {
  relationship: Relationship;
  selected: boolean;
  onPress(): void;
}) {
  const category =
    relationship.kinship > 0 ? 'family' : relationshipCategory(relationship.affinity);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.node, styles[category], selected && styles.selected]}
    >
      <Image source={SOCIAL_ART.portrait} style={styles.nodePortrait} contentFit="cover" />
      <View style={styles.nodeCopy}>
        <AppText variant="label">{getFriendlyName(relationship.agentId)}</AppText>
        <AppText variant="caption">
          {category} · affinity {relationship.affinity.toFixed(0)}
        </AppText>
      </View>
    </Pressable>
  );
}

function RelationshipDetail({
  agentId,
  relationship,
  onOpen,
}: {
  agentId: string;
  relationship: Relationship;
  onOpen(): void;
}) {
  return (
    <AppCard>
      <AppText variant="heading">Relationship detail</AppText>
      <AppText color="secondary">
        {getFriendlyName(agentId)} and {getFriendlyName(relationship.agentId)}
      </AppText>
      <Metric label="Familiarity" value={relationship.familiarity} />
      <Metric label="Trust" value={relationship.trust} />
      <Metric label="Affinity" value={relationship.affinity} signed />
      <AppText variant="caption">
        Interactions {relationship.interactionCount} · First{' '}
        {relationship.firstInteractionTick ?? 'Not recorded'} · Last{' '}
        {relationship.lastInteractionTick ?? 'Not recorded'}
      </AppText>
      <AppText variant="caption">
        Cooperation {relationship.cooperationCount} · Sharing {relationship.sharingCount} · Grooming{' '}
        {relationship.groomingCount}
      </AppText>
      <Pressable onPress={onOpen} style={styles.open}>
        <AppText variant="label" style={styles.link}>
          Open {getFriendlyName(relationship.agentId)} ›
        </AppText>
      </Pressable>
    </AppCard>
  );
}

function Metric({
  label,
  value,
  signed = false,
}: {
  label: string;
  value: number;
  signed?: boolean;
}) {
  const width = signed ? Math.abs(value) : value;
  return (
    <View style={styles.metric}>
      <View style={styles.metricRow}>
        <AppText variant="caption">{label}</AppText>
        <AppText variant="caption">{value.toFixed(1)}</AppText>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.min(100, width)}%` },
            signed && value < 0 && styles.negativeFill,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.2 },
  toggle: {
    alignSelf: 'flex-start',
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
  },
  network: { alignItems: 'center', paddingVertical: spacing.xl },
  centrePortrait: {
    width: 92,
    height: 92,
    borderRadius: radius.full,
    borderWidth: 3,
    borderColor: colors.accentDiscovery,
  },
  nodes: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  node: {
    width: 160,
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElevated,
  },
  nodePortrait: { width: 42, height: 42, borderRadius: radius.full },
  nodeCopy: { flex: 1 },
  positive: { borderColor: colors.positive },
  neutral: {},
  negative: { borderColor: colors.destructive },
  family: { borderColor: colors.accentBlue },
  selected: { borderWidth: 3 },
  metric: { gap: 4 },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between' },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  fill: { height: '100%', backgroundColor: colors.accentScience },
  negativeFill: { backgroundColor: colors.destructive },
  open: { paddingVertical: spacing.sm },
  link: { color: colors.accentScience },
});
