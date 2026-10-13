import { clamp, moveOneStep } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { Hominin, Position, World } from '@/simulation/engine/types';

export const moveToward = (agent: Hominin, target: Position, world: World): Position =>
  moveOneStep(agent.position, target, world.width, world.height);

export function randomStep(agent: Hominin, world: World, rng: SeededRng): Position {
  return {
    x: clamp(agent.position.x + rng.integer(-1, 1), 0, world.width - 1),
    y: clamp(agent.position.y + rng.integer(-1, 1), 0, world.height - 1),
  };
}
