import { moveToward } from '@/simulation/behaviour/actions/actionHelpers';
import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import type { Hominin, Position, World } from '@/simulation/engine/types';

export function moveToWaterMemory(agent: Hominin, world: World, target: Position): ActionResult {
  return {
    behaviour: 'moveToWaterMemory',
    position: moveToward(agent, target, world),
    outcome: 0,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 0,
  };
}
