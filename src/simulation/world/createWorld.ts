import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Terrain, Tile, World } from '@/simulation/engine/types';

function emptyTile(terrain: Terrain, rng: SeededRng): Tile {
  return {
    terrain,
    food: 0,
    foodCapacity: 0,
    hardFood: 0,
    hardFoodCapacity: 0,
    water: 0,
    waterCapacity: 0,
    baselineWaterCapacity: 0,
    cover: terrain === 'scrub' ? 65 : terrain === 'rocky' ? 35 : 15,
    temperature: rng.range(24, 34),
    predatorRisk: rng.range(5, terrain === 'scrub' ? 35 : 22),
    objects: [],
  };
}

export function createWorld(config: SimulationConfig, rng: SeededRng): World {
  const { width, height, foodPatches, waterSources } = config.world;
  const tiles = Array.from({ length: width * height }, (_, index) => {
    const x = index % width;
    const terrain: Terrain =
      x % 11 === 0
        ? 'riverbank'
        : rng.chance(0.14)
          ? 'scrub'
          : rng.chance(0.08)
            ? 'rocky'
            : 'plains';
    return emptyTile(terrain, rng);
  });
  const world: World = {
    width,
    height,
    tiles,
    baselineFoodRegeneration: config.resources.foodRegeneration,
    baselineWaterRegeneration: config.resources.waterRegeneration,
    foodRegenerationMultiplier: 1,
    interventionFoodMultiplier: 1,
    interventionWaterMultiplier: 1,
    predatorPressureMultiplier: 1,
    activeWaterSources: waterSources,
    resourcePressure: 0,
  };
  placePatches(world, rng, foodPatches, waterSources);
  return world;
}

function placePatches(
  world: World,
  rng: SeededRng,
  foodPatches: number,
  waterSources: number,
): void {
  const chosen = new Set<number>();
  const choosePosition = () => {
    let x = rng.integer(1, world.width - 2);
    let y = rng.integer(1, world.height - 2);
    let index = y * world.width + x;
    while (chosen.has(index)) {
      x = rng.integer(1, world.width - 2);
      y = rng.integer(1, world.height - 2);
      index = y * world.width + x;
    }
    chosen.add(index);
    return { x, y };
  };
  for (let count = 0; count < foodPatches; count += 1) {
    const center = choosePosition();
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const tile = world.tiles[(center.y + offsetY) * world.width + center.x + offsetX]!;
        tile.foodCapacity = Math.max(tile.foodCapacity, rng.range(28, 75));
        tile.hardFoodCapacity = Math.max(tile.hardFoodCapacity, rng.range(3, 16));
        tile.food = tile.foodCapacity;
        tile.hardFood = tile.hardFoodCapacity;
      }
    }
  }
  for (let count = 0; count < waterSources; count += 1) {
    const center = choosePosition();
    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        const tile = world.tiles[(center.y + offsetY) * world.width + center.x + offsetX]!;
        tile.waterCapacity = Math.max(tile.waterCapacity, rng.range(65, 100));
        tile.baselineWaterCapacity = tile.waterCapacity;
        tile.water = tile.waterCapacity;
        tile.foodCapacity = Math.max(tile.foodCapacity, rng.range(18, 38));
        tile.food = tile.foodCapacity;
        tile.terrain = 'riverbank';
      }
    }
  }
  for (let count = 0; count < 42; count += 1) {
    const tile = world.tiles[rng.integer(0, world.tiles.length - 1)]!;
    if (!tile.objects.includes('stone')) tile.objects.push('stone');
  }
}
