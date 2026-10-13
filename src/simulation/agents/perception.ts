import { distance } from '@/simulation/engine/math';
import type { Hominin, Position, Predator, World } from '@/simulation/engine/types';
import { getTile } from '@/simulation/world/World';

export interface Perception {
  food?: Position;
  water?: Position;
  hardFood?: Position;
  stone?: Position;
  predator?: Predator;
  hominins: Hominin[];
  danger: number;
}

export function perceive(
  agent: Hominin,
  world: World,
  population: readonly Hominin[],
  predators: readonly Predator[],
): Perception {
  const radius = agent.phenotype.visionRange;
  let food: Position | undefined;
  let water: Position | undefined;
  let hardFood: Position | undefined;
  let stone: Position | undefined;
  let foodDistance = Infinity;
  let waterDistance = Infinity;
  let hardFoodDistance = Infinity;
  let stoneDistance = Infinity;
  let dangerTotal = 0;
  let visibleTileCount = 0;
  const rounded = Math.ceil(radius);
  for (
    let y = Math.max(0, agent.position.y - rounded);
    y <= Math.min(world.height - 1, agent.position.y + rounded);
    y += 1
  ) {
    for (
      let x = Math.max(0, agent.position.x - rounded);
      x <= Math.min(world.width - 1, agent.position.x + rounded);
      x += 1
    ) {
      const position = { x, y };
      const itemDistance = distance(agent.position, position);
      if (itemDistance > radius) continue;
      const tile = getTile(world, position);
      dangerTotal += tile.predatorRisk;
      visibleTileCount += 1;
      if (tile.food > 0.5 && itemDistance < foodDistance) {
        food = position;
        foodDistance = itemDistance;
      }
      if (tile.water > 0.5 && itemDistance < waterDistance) {
        water = position;
        waterDistance = itemDistance;
      }
      if (tile.hardFood > 0.5 && itemDistance < hardFoodDistance) {
        hardFood = position;
        hardFoodDistance = itemDistance;
      }
      if (tile.objects.includes('stone') && itemDistance < stoneDistance) {
        stone = position;
        stoneDistance = itemDistance;
      }
    }
  }
  let predator: Predator | undefined;
  let predatorDistance = Infinity;
  for (const candidate of predators) {
    const candidateDistance = distance(agent.position, candidate.position);
    if (candidateDistance <= radius && candidateDistance < predatorDistance) {
      predator = candidate;
      predatorDistance = candidateDistance;
    }
  }
  const hominins = population.filter(
    (other) =>
      other.alive && other.id !== agent.id && distance(agent.position, other.position) <= radius,
  );
  return {
    ...(food ? { food } : {}),
    ...(water ? { water } : {}),
    ...(hardFood ? { hardFood } : {}),
    ...(stone ? { stone } : {}),
    ...(predator ? { predator } : {}),
    hominins,
    danger: Math.min(100, (predator ? 70 : 0) + dangerTotal / Math.max(1, visibleTileCount)),
  };
}
