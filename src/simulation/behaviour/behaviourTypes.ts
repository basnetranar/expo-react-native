import type { ActionOutcome, BehaviourType, Position } from '@/simulation/engine/types';

export interface ActionResult {
  behaviour: BehaviourType;
  position: Position;
  outcome: ActionOutcome;
  energyGain: number;
  hydrationGain: number;
  demonstrableSuccess: number;
  foodConsumed?: number;
  hardFoodConsumed?: number;
  toolCalories?: number;
  socialTargetId?: string;
  socialQuantity?: number;
}

export interface BehaviourDecision extends ActionResult {
  scores: Record<BehaviourType, number>;
}
