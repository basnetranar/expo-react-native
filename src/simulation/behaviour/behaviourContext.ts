import { strongestMemory } from '@/simulation/agents/memory';
import type { Perception } from '@/simulation/agents/perception';
import type { Hominin, Position, Relationship } from '@/simulation/engine/types';

export interface BehaviourContext {
  hunger: number;
  thirst: number;
  exhaustion: number;
  danger: number;
  uncertainty: number;
  perception: Perception;
  foodMemory?: Position;
  waterMemory?: Position;
  followTarget?: Hominin;
  followRelationship?: Relationship;
  socialTarget?: Hominin;
  socialRelationship?: Relationship;
}

export function createBehaviourContext(agent: Hominin, perception: Perception): BehaviourContext {
  const foodMemory = strongestMemory(agent, 'food')?.position;
  const waterMemory = strongestMemory(agent, 'water')?.position;
  const candidate = perception.hominins
    .map((other) => ({
      other,
      relationship: agent.relationships.find((item) => item.agentId === other.id),
    }))
    .sort((first, second) => candidateValue(agent, second) - candidateValue(agent, first))[0];
  return {
    hunger: 100 - agent.needs.energy,
    thirst: 100 - agent.needs.hydration,
    exhaustion: 100 - agent.needs.energy,
    danger: perception.danger,
    uncertainty: Math.max(
      0,
      100 - Math.max(foodMemory?.x !== undefined ? 55 : 0, waterMemory?.x !== undefined ? 55 : 0),
    ),
    perception,
    ...(foodMemory ? { foodMemory } : {}),
    ...(waterMemory ? { waterMemory } : {}),
    ...(candidate ? { followTarget: candidate.other } : {}),
    ...(candidate?.relationship ? { followRelationship: candidate.relationship } : {}),
    ...(candidate ? { socialTarget: candidate.other } : {}),
    ...(candidate?.relationship ? { socialRelationship: candidate.relationship } : {}),
  };
}

function candidateValue(
  agent: Hominin,
  candidate: { other: Hominin; relationship: Relationship | undefined },
): number {
  const juvenileSupport =
    agent.phenotype.lifeStage === 'juvenile' && candidate.other.phenotype.lifeStage !== 'juvenile'
      ? 45
      : 0;
  return (
    juvenileSupport +
    (candidate.relationship?.kinship ?? 0) * 40 +
    (candidate.relationship?.familiarity ?? 0) * 0.2 +
    (candidate.relationship?.observedSuccess ?? 0)
  );
}
