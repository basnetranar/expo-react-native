import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { clamp } from '@/simulation/engine/math';
import type { Hominin, World } from '@/simulation/engine/types';
import { consumeFood } from '@/simulation/world/resourceSystem';

export function eat(agent: Hominin, world: World): ActionResult {
  const tool = agent.learnedBehaviours.find((item) => item.type === 'stoneCracking');
  const consumed = consumeFood(world, agent.position, 18, Boolean(tool));
  const totalConsumed = consumed.soft + consumed.hard;
  const efficiency = tool ? 1 + tool.proficiency / 200 : 1;
  const calories = totalConsumed * efficiency;
  const stored = agent.needs.energy > 55 ? Math.min(12 - agent.carriedFood, calories * 0.2) : 0;
  const gain = calories - stored;
  agent.carriedFood += stored;
  agent.needs.energy = clamp(agent.needs.energy + gain);
  if (tool && consumed.hard > 0) tool.reinforcement += 1;
  return {
    behaviour: 'eat',
    position: { ...agent.position },
    outcome: gain > 2 ? 1 : gain > 0 ? 0 : -1,
    energyGain: gain,
    hydrationGain: 0,
    demonstrableSuccess: clamp(gain * 8),
    foodConsumed: totalConsumed,
    hardFoodConsumed: consumed.hard,
    toolCalories: consumed.hard * efficiency,
  };
}
