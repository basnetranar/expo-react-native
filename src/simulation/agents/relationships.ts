import { clamp } from '@/simulation/engine/math';
import type { Hominin, Relationship } from '@/simulation/engine/types';

export function relationshipWith(agent: Hominin, other: Hominin, limit: number): Relationship {
  let relationship = agent.relationships.find((item) => item.agentId === other.id);
  if (!relationship) {
    const kinship =
      agent.parents.includes(other.id) ||
      other.parents.includes(agent.id) ||
      agent.parents.some((id) => other.parents.includes(id))
        ? 0.75
        : 0;
    relationship = {
      agentId: other.id,
      familiarity: 0,
      trust: kinship * 50,
      affinity: kinship * 20,
      kinship,
      observedSuccess: 0,
      followBenefits: 0,
      interactionCount: 0,
      firstInteractionTick: null,
      lastInteractionTick: null,
      cooperationCount: 0,
      sharingCount: 0,
      groomingCount: 0,
    };
    agent.relationships.push(relationship);
    if (agent.relationships.length > limit) {
      agent.relationships.sort(
        (first, second) =>
          second.familiarity + second.kinship * 100 - (first.familiarity + first.kinship * 100),
      );
      agent.relationships.length = limit;
    }
  }
  return relationship;
}

export function recordEncounter(
  agent: Hominin,
  other: Hominin,
  tick: number,
  limit: number,
): Relationship | null {
  const relationship = relationshipWith(agent, other, limit);
  if (relationship.lastInteractionTick !== null && tick - relationship.lastInteractionTick < 4)
    return null;
  relationship.familiarity = clamp(relationship.familiarity + 1.5);
  relationship.interactionCount += 1;
  relationship.firstInteractionTick ??= tick;
  relationship.lastInteractionTick = tick;
  return relationship;
}

export function adjustRelationship(
  relationship: Relationship,
  changes: { trust?: number; affinity?: number; familiarity?: number },
): void {
  relationship.trust = clamp(relationship.trust + (changes.trust ?? 0));
  relationship.affinity = Math.max(
    -100,
    Math.min(100, relationship.affinity + (changes.affinity ?? 0)),
  );
  relationship.familiarity = clamp(relationship.familiarity + (changes.familiarity ?? 0));
}
