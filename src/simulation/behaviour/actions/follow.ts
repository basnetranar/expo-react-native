import { moveToward } from '@/simulation/behaviour/actions/actionHelpers';
import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import type { Hominin, World } from '@/simulation/engine/types';

export function follow(agent: Hominin, target: Hominin, world: World): ActionResult {
  return {
    behaviour: 'follow',
    position: moveToward(agent, target.position, world),
    outcome: 0,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 0,
  };
}
