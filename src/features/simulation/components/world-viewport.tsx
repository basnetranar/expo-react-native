import { StyleSheet, View } from 'react-native';

import { AgentLayer, PredatorLayer, ResourceLayer } from './world-overlay-layers';
import { WorldTerrainLayer } from './world-terrain-layer';

import type { WorldPresentationSnapshot } from '@/features/simulation/types';
import type { AgentSnapshot } from '@/simulation';
import { colors, radius } from '@/theme';

export function WorldViewport({
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
    <View style={[styles.viewport, compact ? styles.compact : styles.expanded]}>
      <WorldTerrainLayer world={world} />
      <ResourceLayer world={world} />
      <PredatorLayer world={world} />
      <AgentLayer
        agents={agents}
        world={world}
        selectedId={selectedId}
        onSelect={onSelect}
        {...(compact === undefined ? {} : { compact })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  compact: { aspectRatio: 0.94, borderRadius: 0 },
  expanded: { flex: 1, minHeight: 420, aspectRatio: 1.45 },
});
