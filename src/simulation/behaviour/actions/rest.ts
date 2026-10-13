import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { clamp } from '@/simulation/engine/math';
import type { Hominin } from '@/simulation/engine/types';

export function rest(agent: Hominin): ActionResult {
  agent.health = clamp(agent.health + 0.08);
  return {
    behaviour: 'rest',
    position: { ...agent.position },
    outcome: 0,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 0,
  };
}
