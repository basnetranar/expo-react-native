import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { clamp } from '@/simulation/engine/math';
import type { Hominin, Position, World } from '@/simulation/engine/types';

export function flee(agent: Hominin, world: World, threat: Position): ActionResult {
  const candidates: Position[] = [];
  for (let yOffset = -1; yOffset <= 1; yOffset += 1) {
    for (let xOffset = -1; xOffset <= 1; xOffset += 1) {
      if (xOffset === 0 && yOffset === 0) continue;
      candidates.push({
        x: clamp(agent.position.x + xOffset, 0, world.width - 1),
        y: clamp(agent.position.y + yOffset, 0, world.height - 1),
      });
    }
  }
  const squaredDistance = (position: Position) =>
    (position.x - threat.x) ** 2 + (position.y - threat.y) ** 2;
  const position = candidates.sort(
    (first, second) => squaredDistance(second) - squaredDistance(first),
  )[0]!;
  return {
    behaviour: 'flee',
    position,
    outcome: 1,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 20,
  };
}
