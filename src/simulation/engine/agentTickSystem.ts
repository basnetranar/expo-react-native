import { decayMemories } from '@/simulation/agents/memory';
import { depleteNeeds, updateNeedMortality } from '@/simulation/agents/needs';
import { perceive } from '@/simulation/agents/perception';
import { relationshipWith } from '@/simulation/agents/relationships';
import { BehaviourEngine } from '@/simulation/behaviour/BehaviourEngine';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type {
  AgentDebugTrace,
  DeathCause,
  Hominin,
  Predator,
  World,
  LearnedBehaviourType,
} from '@/simulation/engine/types';
import {
  attemptStoneDiscovery,
  reinforceSocialForaging,
} from '@/simulation/learning/discoverySystem';
import { learnFromOutcome } from '@/simulation/learning/learningSystem';
import type { PracticeChange } from '@/simulation/learning/learningSystem';
import { getTile } from '@/simulation/world/World';

export interface AgentTickResult {
  deathCause?: DeathCause;
  debug?: AgentDebugTrace;
  foodConsumed: number;
  waterConsumed: number;
  eligibleToolOpportunity: boolean;
  toolDiscovered: boolean;
  successfulToolUse: boolean;
  toolCalories: number;
  practice: PracticeChange[];
  newlyAcquired: LearnedBehaviourType[];
  socialAction?: {
    type: 'cooperativeForaging' | 'foodShared' | 'socialGrooming';
    targetId: string;
    quantity: number;
    success: boolean;
  };
}

export function stepAgent(options: {
  agent: Hominin;
  nearby: Hominin[];
  predators: readonly Predator[];
  world: World;
  behaviourEngine: BehaviourEngine;
  config: SimulationConfig;
  rng: SeededRng;
  tick: number;
  debug: boolean;
}): AgentTickResult {
  const { agent, nearby, predators, world, behaviourEngine, config, rng, tick } = options;
  const perception = perceive(agent, world, nearby, predators);
  const needsBefore = { ...agent.needs };
  for (const other of perception.hominins)
    relationshipWith(agent, other, config.memory.relationshipLimit);
  const result = behaviourEngine.act(agent, perception, world, tick);
  depleteNeeds(agent, result.behaviour, config);
  const practice = learnFromOutcome(agent, result, config, tick);
  const discovery = attemptStoneDiscovery(agent, world, tick, rng, config);
  const followBenefit = recordFollowBenefit(agent, perception.hominins, world, config);
  const socialForagingLearned = reinforceSocialForaging(agent, followBenefit, tick);
  agent.demonstratedBehaviour =
    (result.hardFoodConsumed ?? 0) > 0 ? 'stoneCracking' : followBenefit ? 'socialForaging' : null;
  agent.demonstrableSuccess = result.demonstrableSuccess;
  recordDemonstration(agent, perception.hominins, result.demonstrableSuccess, config);
  if (agent.needs.energy > 70 && agent.needs.hydration > 70)
    agent.health = Math.min(100, agent.health + 0.12);
  if (!perception.predator) agent.needs.safety = Math.min(100, agent.needs.safety + 0.08);
  decayMemories(agent, config.memory.baseDecay);
  updateNeedMortality(agent, config);
  const debug = options.debug
    ? {
        tick,
        agentId: agent.id,
        needsBefore,
        visible: {
          food: Boolean(perception.food),
          water: Boolean(perception.water),
          predator: Boolean(perception.predator),
          hominins: perception.hominins.length,
          stone: Boolean(perception.stone),
        },
        recalledMemoryIds: agent.memories.map((memory) => memory.id),
        scores: { ...result.scores },
        chosenBehaviour: result.behaviour,
        outcome: result.outcome,
        needsAfter: { ...agent.needs },
      }
    : undefined;
  const telemetry = {
    foodConsumed: result.foodConsumed ?? 0,
    waterConsumed: result.hydrationGain,
    eligibleToolOpportunity: discovery.eligible,
    toolDiscovered: discovery.discovered,
    successfulToolUse: (result.hardFoodConsumed ?? 0) > 0,
    toolCalories: result.toolCalories ?? 0,
    practice,
    newlyAcquired: [
      ...(discovery.discovered ? (['stoneCracking'] as const) : []),
      ...(socialForagingLearned ? (['socialForaging'] as const) : []),
    ],
    ...(result.socialTargetId &&
    ['cooperativeForage', 'shareFood', 'groom'].includes(result.behaviour)
      ? {
          socialAction: {
            type:
              result.behaviour === 'cooperativeForage'
                ? ('cooperativeForaging' as const)
                : result.behaviour === 'shareFood'
                  ? ('foodShared' as const)
                  : ('socialGrooming' as const),
            targetId: result.socialTargetId,
            quantity: result.socialQuantity ?? 0,
            success: result.outcome === 1,
          },
        }
      : {}),
  };
  if (agent.health > 0) return debug ? { ...telemetry, debug } : telemetry;
  const deathCause =
    agent.zeroHydrationTicks > agent.zeroEnergyTicks ? 'dehydration' : 'starvation';
  return debug ? { ...telemetry, deathCause, debug } : { ...telemetry, deathCause };
}

function recordFollowBenefit(
  agent: Hominin,
  nearby: Hominin[],
  world: World,
  config: SimulationConfig,
): boolean {
  if (agent.currentBehaviour !== 'follow') return false;
  const target = nearby.find(
    (other) => other.position.x === agent.position.x && other.position.y === agent.position.y,
  );
  if (!target || getTile(world, agent.position).food <= 0) return false;
  const relationship = relationshipWith(agent, target, config.memory.relationshipLimit);
  relationship.followBenefits += 1;
  relationship.observedSuccess = Math.min(100, relationship.observedSuccess + 8);
  return true;
}

function recordDemonstration(
  agent: Hominin,
  observers: Hominin[],
  success: number,
  config: SimulationConfig,
): void {
  if (success <= 0) return;
  for (const observer of observers) {
    const relationship = relationshipWith(observer, agent, config.memory.relationshipLimit);
    relationship.observedSuccess = Math.min(100, relationship.observedSuccess + success * 0.08);
  }
}
