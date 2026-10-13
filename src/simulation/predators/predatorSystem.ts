import { clamp, distance, moveOneStep } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { Hominin, Predator, World } from '@/simulation/engine/types';
import { getTile } from '@/simulation/world/World';

export function updatePredators(
  predators: Predator[],
  population: readonly Hominin[],
  world: World,
  rng: SeededRng,
): Hominin[] {
  const killed: Hominin[] = [];
  const targeted = new Set<string>();
  const alive = population.filter((agent) => agent.alive);
  for (const predator of predators) {
    if (predator.restTicks > 0) {
      predator.state = 'rest';
      predator.restTicks -= 1;
      predator.stamina = clamp(predator.stamina + 2);
      continue;
    }
    const target = alive
      .filter(
        (agent) =>
          !killed.includes(agent) &&
          !targeted.has(agent.id) &&
          distance(predator.position, agent.position) <= 6,
      )
      .sort(
        (first, second) =>
          distance(predator.position, first.position) -
          distance(predator.position, second.position),
      )[0];
    if (!target) {
      predator.state = 'patrol';
      predator.position = {
        x: clamp(predator.position.x + rng.integer(-1, 1), 0, world.width - 1),
        y: clamp(predator.position.y + rng.integer(-1, 1), 0, world.height - 1),
      };
      continue;
    }
    targeted.add(target.id);
    const continuingChase = predator.state !== 'patrol' && predator.targetId === target.id;
    predator.targetId = target.id;
    if (!continuingChase) {
      predator.state = 'detect';
      continue;
    }
    predator.state = 'chase';
    if (rng.chance(0.72)) {
      predator.position = moveOneStep(
        predator.position,
        target.position,
        world.width,
        world.height,
      );
    }
    predator.stamina = clamp(predator.stamina - 1.5);
    if (distance(predator.position, target.position) > 1.5) continue;
    const terrain = getTile(world, target.position);
    const escape =
      target.phenotype.speed * 0.004 +
      target.phenotype.endurance * 0.002 +
      terrain.cover * 0.002 +
      target.phenotype.vision * 0.0015;
    if (rng.chance(clamp((0.32 - escape) * world.predatorPressureMultiplier, 0.005, 0.24))) {
      killed.push(target);
      predator.restTicks = 25;
    } else {
      target.needs.safety = clamp(target.needs.safety - 18);
      predator.restTicks = 2;
    }
  }
  return killed;
}
