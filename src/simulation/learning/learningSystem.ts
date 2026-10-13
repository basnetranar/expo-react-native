import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { clamp } from '@/simulation/engine/math';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Hominin, LearnedBehaviourType } from '@/simulation/engine/types';

export interface PracticeChange {
  behaviour: LearnedBehaviourType;
  before: number;
  after: number;
  successful: boolean;
}

export function learnFromOutcome(
  agent: Hominin,
  result: ActionResult,
  config: SimulationConfig,
  tick: number,
): PracticeChange[] {
  const changes: PracticeChange[] = [];
  const delta =
    result.outcome *
    (config.learning.baseRate +
      (agent.phenotype.learningAbility / 100) * config.learning.abilityRate) *
    10;
  agent.actionPreferences[result.behaviour] = clamp(
    (agent.actionPreferences[result.behaviour] ?? 0) + delta,
    -20,
    20,
  );
  for (const learned of agent.learnedBehaviours) {
    const practiced =
      learned.type === 'stoneCracking'
        ? result.behaviour === 'eat' && (result.hardFoodConsumed ?? 0) > 0
        : result.behaviour === 'follow';
    if (!practiced) continue;
    const before = learned.proficiency;
    learned.practiceCount += 1;
    learned.lastPracticedAtTick = tick;
    if (result.outcome > 0) {
      learned.successfulAttempts += 1;
      // Diminishing returns keep skill bounded without granting progress from elapsed time.
      learned.proficiency = clamp(
        learned.proficiency + delta * 0.4 * Math.max(0.15, 1 - learned.proficiency / 110),
      );
      learned.reinforcement += 1;
    } else {
      learned.failedAttempts += 1;
      learned.proficiency = clamp(learned.proficiency + Math.max(0, -delta) * 0.04);
    }
    changes.push({
      behaviour: learned.type,
      before,
      after: learned.proficiency,
      successful: result.outcome > 0,
    });
  }
  return changes;
}
