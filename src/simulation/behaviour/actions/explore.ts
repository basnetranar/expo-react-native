import { randomStep } from '@/simulation/behaviour/actions/actionHelpers';
import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { Hominin, World } from '@/simulation/engine/types';

export function explore(agent: Hominin, world: World, rng: SeededRng): ActionResult {
  return {
    behaviour: 'explore',
    position: randomStep(agent, world, rng),
    outcome: 0,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 0,
  };
}
