import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import type { Hominin } from '@/simulation/engine/types';

export function observe(agent: Hominin): ActionResult {
  return {
    behaviour: 'observe',
    position: { ...agent.position },
    outcome: 0,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 0,
  };
}
