import type { BehaviourContext } from '@/simulation/behaviour/behaviourContext';
import { distance } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { BehaviourType, Hominin } from '@/simulation/engine/types';

export function scoreBehaviours(
  agent: Hominin,
  context: BehaviourContext,
  rng: SeededRng,
  config: SimulationConfig,
): Record<BehaviourType, number> {
  const foodDistance = context.perception.food
    ? distance(agent.position, context.perception.food)
    : context.foodMemory
      ? distance(agent.position, context.foodMemory)
      : 12;
  const waterDistance = context.perception.water
    ? distance(agent.position, context.perception.water)
    : context.waterMemory
      ? distance(agent.position, context.waterMemory)
      : 12;
  const visiblePredator = context.perception.predator ? 1 : 0;
  const vulnerability = (100 - agent.health + 100 - agent.phenotype.speed) / 200;
  const trust = context.followRelationship?.trust ?? 0;
  const success = context.followRelationship?.observedSuccess ?? 0;
  const weight = config.decision.weights;
  const juvenile = agent.phenotype.lifeStage === 'juvenile';
  const raw: Record<BehaviourType, number> = {
    eat: context.perception.food && foodDistance < 0.5 ? context.hunger * 0.9 + 30 : -20,
    drink: context.perception.water && waterDistance < 0.5 ? context.thirst + 35 : -20,
    moveToFoodMemory:
      context.hunger * weight.foodHunger +
      (context.perception.food || context.foodMemory ? weight.foodVisible : -25) -
      context.danger * weight.resourceDanger -
      foodDistance * weight.resourceDistance,
    moveToWaterMemory:
      context.thirst * weight.waterThirst +
      (context.perception.water || context.waterMemory ? weight.waterVisible : -25) -
      context.danger * weight.resourceDanger -
      waterDistance * weight.resourceDistance,
    flee:
      visiblePredator * weight.fleeVisible +
      context.danger * weight.fleeDanger +
      vulnerability * weight.fleeVulnerability,
    explore:
      agent.phenotype.curiosity * weight.exploreCuriosity +
      context.hunger * weight.exploreHunger +
      context.thirst * weight.exploreThirst -
      context.danger * weight.exploreDanger -
      context.exhaustion * weight.exploreExhaustion,
    follow:
      agent.phenotype.socialSensitivity * weight.followSocial +
      success * weight.followSuccess +
      trust * weight.followTrust +
      context.uncertainty * weight.followUncertainty +
      (context.followTarget ? 10 + (juvenile ? weight.juvenileFollowBonus : 0) : -40),
    observe:
      agent.phenotype.socialSensitivity * weight.observeSocial +
      agent.phenotype.curiosity * weight.observeCuriosity +
      (context.perception.hominins.length ? 18 : -30),
    cooperativeForage:
      context.socialTarget &&
      context.perception.food &&
      foodDistance < 0.5 &&
      context.socialTarget.position.x === agent.position.x &&
      context.socialTarget.position.y === agent.position.y &&
      agent.needs.energy < 72 &&
      agent.needs.hydration > 20
        ? context.hunger * 0.72 + trust * 0.18 + success * 0.12 + 18
        : -40,
    shareFood:
      context.socialTarget &&
      agent.carriedFood >= 1 &&
      context.socialTarget.needs.energy < agent.needs.energy - 18 &&
      agent.needs.energy > 48 &&
      agent.needs.hydration > 25
        ? 20 +
          agent.phenotype.socialSensitivity * 0.26 +
          trust * 0.22 +
          (100 - context.socialTarget.needs.energy) * 0.28
        : -50,
    groom:
      context.socialTarget &&
      agent.needs.energy > 58 &&
      agent.needs.hydration > 48 &&
      agent.needs.safety > 55 &&
      !context.perception.predator
        ? agent.phenotype.socialSensitivity * 0.3 + trust * 0.1 + 24
        : -50,
    rest: context.exhaustion * weight.restExhaustion + agent.needs.safety * weight.restSafety,
  };
  if (juvenile) raw.explore -= weight.juvenileExplorePenalty;
  for (const behaviour of Object.keys(raw) as BehaviourType[]) {
    raw[behaviour] += agent.actionPreferences[behaviour] ?? 0;
    const noise = Math.abs(raw[behaviour]) * config.decision.noiseFraction;
    raw[behaviour] += rng.range(-noise, noise);
  }
  return raw;
}

export function chooseBehaviour(scores: Record<BehaviourType, number>): BehaviourType {
  return (Object.entries(scores) as [BehaviourType, number][]).sort(
    (first, second) => second[1] - first[1],
  )[0]![0];
}
