import type { World } from '@/simulation/engine/types';

export function retainWaterSources(world: World, count: number): void {
  const waterTiles = world.tiles.filter((tile) => tile.baselineWaterCapacity > 0);
  waterTiles.forEach((tile, index) => {
    if (index >= count * 9) {
      tile.water = 0;
      tile.waterCapacity = 0;
    } else {
      tile.waterCapacity = tile.baselineWaterCapacity;
    }
  });
  world.activeWaterSources = Math.min(count, waterTiles.length);
}
