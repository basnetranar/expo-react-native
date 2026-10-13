import type { ActionResult } from '@/simulation/behaviour/behaviourTypes';
import { clamp } from '@/simulation/engine/math';
import type { Hominin, World } from '@/simulation/engine/types';
import { consumeFood } from '@/simulation/world/resourceSystem';

export function cooperativeForage(agent: Hominin, partner: Hominin, world: World): ActionResult {
  if (
    partner.id === agent.id ||
    partner.position.x !== agent.position.x ||
    partner.position.y !== agent.position.y
  )
    return failed('cooperativeForage', agent);
  const consumed = consumeFood(world, agent.position, 20, false);
  const quantity = consumed.soft + consumed.hard;
  if (quantity <= 0) return failed('cooperativeForage', agent, partner.id);
  const actorShare = quantity * 0.55;
  const partnerShare = quantity - actorShare;
  agent.needs.energy = clamp(agent.needs.energy + actorShare - 0.35);
  partner.needs.energy = clamp(partner.needs.energy + partnerShare);
  return {
    behaviour: 'cooperativeForage',
    position: { ...agent.position },
    outcome: 1,
    energyGain: actorShare - 0.35,
    hydrationGain: 0,
    demonstrableSuccess: clamp(quantity * 7),
    foodConsumed: quantity,
    hardFoodConsumed: consumed.hard,
    socialTargetId: partner.id,
    socialQuantity: quantity,
  };
}

export function shareFood(agent: Hominin, recipient: Hominin): ActionResult {
  const adjacent =
    Math.abs(agent.position.x - recipient.position.x) <= 1 &&
    Math.abs(agent.position.y - recipient.position.y) <= 1;
  if (!adjacent || recipient.id === agent.id || agent.carriedFood < 1)
    return failed('shareFood', agent, recipient.id);
  const quantity = Math.min(4, agent.carriedFood, Math.max(0, 100 - recipient.needs.energy));
  if (quantity <= 0) return failed('shareFood', agent, recipient.id);
  agent.carriedFood -= quantity;
  recipient.needs.energy = clamp(recipient.needs.energy + quantity);
  agent.needs.energy = clamp(agent.needs.energy - 0.15);
  return {
    behaviour: 'shareFood',
    position: { ...agent.position },
    outcome: 1,
    energyGain: -0.15,
    hydrationGain: 0,
    demonstrableSuccess: quantity * 8,
    socialTargetId: recipient.id,
    socialQuantity: quantity,
  };
}

export function groom(agent: Hominin, partner: Hominin): ActionResult {
  const adjacent =
    Math.abs(agent.position.x - partner.position.x) <= 1 &&
    Math.abs(agent.position.y - partner.position.y) <= 1;
  if (!adjacent || partner.id === agent.id || agent.needs.energy <= 0.3)
    return failed('groom', agent, partner.id);
  agent.needs.energy = clamp(agent.needs.energy - 0.3);
  return {
    behaviour: 'groom',
    position: { ...agent.position },
    outcome: 1,
    energyGain: -0.3,
    hydrationGain: 0,
    demonstrableSuccess: 10,
    socialTargetId: partner.id,
  };
}

function failed(
  behaviour: 'cooperativeForage' | 'shareFood' | 'groom',
  agent: Hominin,
  socialTargetId?: string,
): ActionResult {
  return {
    behaviour,
    position: { ...agent.position },
    outcome: -1,
    energyGain: 0,
    hydrationGain: 0,
    demonstrableSuccess: 0,
    ...(socialTargetId ? { socialTargetId } : {}),
  };
}
