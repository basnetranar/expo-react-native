import { clamp, tileIndex } from '@/simulation/engine/math';
import type { Position, Tile, World } from '@/simulation/engine/types';

export function getTile(world: World, position: Position): Tile {
  const x = clamp(Math.round(position.x), 0, world.width - 1);
  const y = clamp(Math.round(position.y), 0, world.height - 1);
  return world.tiles[tileIndex({ x, y }, world.width)]!;
}

export function totalResources(world: World): { food: number; hardFood: number; water: number } {
  let food = 0;
  let hardFood = 0;
  let water = 0;
  for (const tile of world.tiles) {
    food += tile.food;
    hardFood += tile.hardFood;
    water += tile.water;
  }
  return { food, hardFood, water };
}

export function clonePosition(position: Position): Position {
  return { x: position.x, y: position.y };
}
