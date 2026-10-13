import type { Scenario } from '@/simulation/scenarios/types';

export const hardFood: Scenario = {
  name: 'hardFood',
  configureWorld(world, config) {
    for (const [index, tile] of world.tiles.entries()) {
      const originalSoft = tile.food;
      tile.food *= config.hardFood.softFoodFraction;
      tile.foodCapacity *= config.hardFood.softFoodFraction;
      tile.hardFood += originalSoft * config.hardFood.hardFoodConversion;
      tile.hardFoodCapacity += originalSoft * config.hardFood.hardFoodConversion;
      const placement = ((index * 2_654_435_761) % 1_000) / 1_000;
      if (
        tile.hardFoodCapacity > 0 &&
        placement < config.hardFood.stoneTileFrequency &&
        !tile.objects.includes('stone')
      )
        tile.objects.push('stone');
      tile.predatorRisk = Math.min(100, tile.predatorRisk * config.hardFood.predatorRiskMultiplier);
    }
  },
  update() {
    return [];
  },
};
