import { distance } from '@/simulation/engine/math';
import type { Position, Tile, World } from '@/simulation/engine/types';
import { getTile } from '@/simulation/world/World';

export function consumeFood(
  world: World,
  position: Position,
  amount: number,
  allowHardFood: boolean,
): { soft: number; hard: number } {
  const tile = getTile(world, position);
  const soft = Math.min(tile.food, amount);
  tile.food -= soft;
  if (!allowHardFood || soft >= amount) return { soft, hard: 0 };
  const hard = Math.min(tile.hardFood, amount - soft);
  tile.hardFood -= hard;
  return { soft, hard };
}

export function consumeWater(world: World, position: Position, amount: number): number {
  const tile = getTile(world, position);
  const consumed = Math.min(tile.water, amount);
  tile.water -= consumed;
  return consumed;
}

export function regenerateResources(world: World): { food: number; water: number } {
  let scarcity = 0;
  let resourceTiles = 0;
  let food = 0;
  let water = 0;
  for (const tile of world.tiles) {
    const supportsResources =
      tile.foodCapacity > 0 || tile.hardFoodCapacity > 0 || tile.baselineWaterCapacity > 0;
    if (supportsResources) resourceTiles += 1;
    if (tile.foodCapacity > 0) {
      const before = tile.food;
      tile.food = Math.min(
        tile.foodCapacity,
        tile.food +
          world.baselineFoodRegeneration *
            world.foodRegenerationMultiplier *
            world.interventionFoodMultiplier,
      );
      food += tile.food - before;
    }
    if (tile.hardFoodCapacity > 0) {
      const before = tile.hardFood;
      tile.hardFood = Math.min(
        tile.hardFoodCapacity,
        tile.hardFood +
          world.baselineFoodRegeneration *
            0.4 *
            world.foodRegenerationMultiplier *
            world.interventionFoodMultiplier,
      );
      food += tile.hardFood - before;
    }
    if (tile.waterCapacity > 0) {
      const before = tile.water;
      tile.water = Math.min(
        tile.waterCapacity,
        tile.water + world.baselineWaterRegeneration * world.interventionWaterMultiplier,
      );
      water += tile.water - before;
    }
    if (supportsResources && tile.food + tile.hardFood < 10 && tile.water < 10) scarcity += 1;
  }
  world.resourcePressure = scarcity / Math.max(1, resourceTiles);
  return { food, water };
}

export function getVisibleResources(
  world: World,
  position: Position,
  radius: number,
): { position: Position; tile: Tile }[] {
  const visible: { position: Position; tile: Tile }[] = [];
  const minX = Math.max(0, Math.floor(position.x - radius));
  const maxX = Math.min(world.width - 1, Math.ceil(position.x + radius));
  const minY = Math.max(0, Math.floor(position.y - radius));
  const maxY = Math.min(world.height - 1, Math.ceil(position.y + radius));
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const candidate = { x, y };
      if (distance(position, candidate) <= radius)
        visible.push({ position: candidate, tile: getTile(world, candidate) });
    }
  }
  return visible;
}
