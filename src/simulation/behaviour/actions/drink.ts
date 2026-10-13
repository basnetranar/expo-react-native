import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { clamp } from '@/simulation/engine/math';
import type { Hominin, World } from '@/simulation/engine/types';
import { consumeWater } from '@/simulation/world/resourceSystem';

export function drink(agent: Hominin, world: World): ActionResult {
  const consumed = consumeWater(world, agent.position, 20);
  agent.needs.hydration = clamp(agent.needs.hydration + consumed);
  return {
    behaviour: 'drink',
    position: { ...agent.position },
    outcome: consumed > 2 ? 1 : consumed > 0 ? 0 : -1,
    energyGain: 0,
    hydrationGain: consumed,
    demonstrableSuccess: clamp(consumed * 8),
  };
}
