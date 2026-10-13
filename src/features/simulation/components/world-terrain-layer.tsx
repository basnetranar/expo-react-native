import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import type { WorldPresentationSnapshot } from '@/features/simulation/types';
import { TERRAIN_ASSETS } from '@/features/simulation/utils/simulation-assets';
import { colors } from '@/theme';

export const WorldTerrainLayer = memo(function WorldTerrainLayer({
  world,
}: {
  world: WorldPresentationSnapshot;
}) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, styles.background]} />
      {world.terrainCells.map((cell) => (
        <View
          key={cell.id}
          style={[
            styles.cell,
            styles[terrainStyle(cell.terrain)],
            cell.hasWater && styles.waterCell,
            cell.decoration && styles.decoratedCell,
            {
              left: `${(cell.x / world.width) * 100}%`,
              top: `${(cell.y / world.height) * 100}%`,
              width: `${(cell.width / world.width) * 100 + 0.7}%`,
              height: `${(cell.height / world.height) * 100 + 0.7}%`,
            },
          ]}
        >
          {cell.decoration ? (
            <Image
              source={TERRAIN_ASSETS[cell.terrain]}
              contentFit="cover"
              recyclingKey={cell.terrain}
              style={styles.texture}
            />
          ) : null}
        </View>
      ))}
      <View style={styles.vignette} />
    </View>
  );
}, areTerrainPropsEqual);

function areTerrainPropsEqual(
  previous: { world: WorldPresentationSnapshot },
  next: { world: WorldPresentationSnapshot },
) {
  return (
    previous.world.width === next.world.width &&
    previous.world.height === next.world.height &&
    previous.world.terrainCells === next.world.terrainCells
  );
}

function terrainStyle(terrain: WorldPresentationSnapshot['terrainCells'][number]['terrain']) {
  if (terrain === 'rocky') return 'rocky' as const;
  if (terrain === 'scrub') return 'scrub' as const;
  if (terrain === 'riverbank') return 'riverbank' as const;
  return 'plains' as const;
}

const styles = StyleSheet.create({
  background: { backgroundColor: '#526039' },
  cell: { position: 'absolute', overflow: 'hidden' },
  plains: { backgroundColor: '#5f6e36' },
  scrub: { backgroundColor: '#485f35' },
  riverbank: { backgroundColor: '#6d7146' },
  rocky: { backgroundColor: '#625b4d' },
  waterCell: {
    backgroundColor: '#315a61',
    borderWidth: 1,
    borderColor: colors.resourceWater,
    borderRadius: 12,
  },
  decoratedCell: { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.05)' },
  texture: { position: 'absolute', inset: 0, opacity: 0.38 },
  vignette: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(4, 12, 18, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
});
