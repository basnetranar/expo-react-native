import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { WorldPresentationSnapshot } from '@/features/simulation/types';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import {
  HOMININ_ASSETS,
  PREDATOR_ASSETS,
  RESOURCE_ASSETS,
} from '@/features/simulation/utils/simulation-assets';
import {
  getAgentRenderSize,
  getDeterministicVariant,
  resolveAgentAssetIndex,
  sortAgentsForHitTesting,
  worldToViewport,
} from '@/features/simulation/utils/world-projection';
import type { AgentSnapshot } from '@/simulation';
import { colors, radius } from '@/theme';

export const ResourceLayer = memo(function ResourceLayer({
  world,
}: {
  world: WorldPresentationSnapshot;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {world.resources.map((marker) => {
        const point = worldToViewport(marker.position, world.width, world.height);
        return (
          <Image
            key={marker.id}
            source={RESOURCE_ASSETS[marker.kind]}
            contentFit="contain"
            style={[styles.resource, point, { opacity: 0.55 + marker.strength * 0.35 }]}
          />
        );
      })}
    </View>
  );
});

export const PredatorLayer = memo(function PredatorLayer({
  world,
}: {
  world: WorldPresentationSnapshot;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {world.predators.map((predator) => (
        <Image
          key={predator.id}
          source={PREDATOR_ASSETS[getDeterministicVariant(predator.id, PREDATOR_ASSETS.length)]}
          contentFit="contain"
          style={[styles.predator, worldToViewport(predator.position, world.width, world.height)]}
        />
      ))}
    </View>
  );
});

export const AgentLayer = memo(function AgentLayer({
  agents,
  world,
  selectedId,
  onSelect,
  compact,
}: {
  agents: readonly AgentSnapshot[];
  world: WorldPresentationSnapshot;
  selectedId: string | null;
  onSelect(id: string): void;
  compact?: boolean;
}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {sortAgentsForHitTesting(agents, selectedId).map((agent) => {
        const stage = agent.phenotype.lifeStage;
        const size = getAgentRenderSize(stage, compact ? 26 : 34);
        const selected = selectedId === agent.id;
        return (
          <Pressable
            key={agent.id}
            accessibilityRole="button"
            accessibilityLabel={`${getFriendlyName(agent.id)}, ${stage}, ${agent.currentBehaviour}`}
            accessibilityHint={`Engine ID ${agent.id}`}
            onPress={() => onSelect(agent.id)}
            hitSlop={6}
            style={[
              styles.agentButton,
              worldToViewport(agent.position, world.width, world.height),
              {
                width: Math.max(44, size + 12),
                height: Math.max(44, size + 12),
                marginLeft: -Math.max(44, size + 12) / 2,
                marginTop: -Math.max(44, size + 12) / 2,
              },
              selected && styles.selected,
            ]}
          >
            <Image
              source={HOMININ_ASSETS[stage][resolveAgentAssetIndex(agent)]!}
              contentFit="contain"
              style={{ width: size, height: size }}
            />
            {selected ? (
              <AppText variant="caption" numberOfLines={1} style={styles.agentName}>
                {getFriendlyName(agent.id)}
              </AppText>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  resource: { position: 'absolute', width: 34, height: 28, marginLeft: -17, marginTop: -14 },
  predator: { position: 'absolute', width: 58, height: 44, marginLeft: -29, marginTop: -22 },
  agentButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.accentScience,
    backgroundColor: 'rgba(243, 183, 79, 0.16)',
  },
  agentName: {
    position: 'absolute',
    top: '100%',
    maxWidth: 86,
    paddingHorizontal: 5,
    color: colors.textPrimary,
    backgroundColor: 'rgba(4, 12, 18, 0.82)',
    borderRadius: radius.sm,
    fontSize: 10,
    lineHeight: 14,
  },
});
