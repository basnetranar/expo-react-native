import { remember } from '@/simulation/agents/memory';
import {
  adjustRelationship,
  recordEncounter,
  relationshipWith,
} from '@/simulation/agents/relationships';
import { AgentSpatialIndex } from '@/simulation/engine/spatialIndex';
import type {
  Hominin,
  SocialEvent,
  SocialGroup,
  SocialMetrics,
  World,
} from '@/simulation/engine/types';
import { getTile } from '@/simulation/world/World';

export interface SocialSystemState {
  groups: SocialGroup[];
  nextGroupId: number;
  nextEventId: number;
}

const minimumGroupSize = 2;
const maximumGroupSize = 8;
const separationGraceTicks = 12;

export class SocialSystem {
  private groups: SocialGroup[] = [];
  private nextGroupId = 0;
  private nextEventId = 0;

  constructor(private readonly relationshipLimit: number) {}

  restoreState(state?: SocialSystemState): void {
    if (!state) return;
    this.groups = state.groups.map(cloneGroup);
    this.nextGroupId = state.nextGroupId;
    this.nextEventId = state.nextEventId;
  }

  exportState(): SocialSystemState {
    return {
      groups: this.groups.map(cloneGroup),
      nextGroupId: this.nextGroupId,
      nextEventId: this.nextEventId,
    };
  }

  getGroups(): SocialGroup[] {
    return this.groups.map(cloneGroup);
  }

  update(population: Hominin[], world: World, tick: number, generation: number): SocialEvent[] {
    const living = population.filter((agent) => agent.alive).sort(byId);
    const byAgentId = new Map(living.map((agent) => [agent.id, agent]));
    const spatial = new AgentSpatialIndex(living);
    const events: SocialEvent[] = [];
    const processed = new Set<string>();

    for (const agent of living) {
      const nearby = spatial
        .query(agent.position, 2)
        .filter((other) => other.id !== agent.id)
        .sort(byId)
        .slice(0, 6);
      for (const other of nearby) {
        const pairKey = [agent.id, other.id].sort().join('|');
        if (processed.has(pairKey)) continue;
        processed.add(pairKey);
        const hasFirst = agent.relationships.some((item) => item.agentId === other.id);
        const hasSecond = other.relationships.some((item) => item.agentId === agent.id);
        if (
          (!hasFirst && agent.relationships.length >= this.relationshipLimit) ||
          (!hasSecond && other.relationships.length >= this.relationshipLimit)
        )
          continue;
        const first = recordEncounter(agent, other, tick, this.relationshipLimit);
        const second = recordEncounter(other, agent, tick, this.relationshipLimit);
        if (!first || !second) continue;
        remember(
          agent,
          { id: `social-${other.id}`, type: 'social', subjectId: other.id },
          tick,
          35,
        );
        remember(
          other,
          { id: `social-${agent.id}`, type: 'social', subjectId: agent.id },
          tick,
          35,
        );
        if (first.interactionCount === 1)
          events.push(this.event('socialEncounter', tick, generation, [agent.id, other.id]));

        const tile = getTile(world, agent.position);
        if (
          agent.position.x === other.position.x &&
          agent.position.y === other.position.y &&
          tile.food + tile.hardFood < 4 &&
          agent.needs.energy < 45 &&
          other.needs.energy < 45
        ) {
          adjustRelationship(first, { affinity: -1, trust: -0.35 });
          adjustRelationship(second, { affinity: -1, trust: -0.35 });
          events.push(
            this.event('socialConflict', tick, generation, [agent.id, other.id], {
              outcome: 'neutral',
            }),
          );
        }
      }
      if (tick % 10 === 0) {
        for (const relationship of agent.relationships) {
          if (
            relationship.lastInteractionTick !== null &&
            tick - relationship.lastInteractionTick > 40
          ) {
            adjustRelationship(relationship, {
              familiarity: -0.25,
              affinity: relationship.affinity > 0 ? -0.1 : relationship.affinity < 0 ? 0.1 : 0,
            });
          }
        }
      }
    }

    events.push(...this.updateGroups(living, byAgentId, spatial, tick, generation));
    return events;
  }

  recordAction(
    actor: Hominin,
    target: Hominin,
    type: 'cooperativeForaging' | 'foodShared' | 'socialGrooming',
    tick: number,
    generation: number,
    quantity = 0,
    success = true,
  ): SocialEvent {
    const actorRelationship = relationshipWith(actor, target, this.relationshipLimit);
    const targetRelationship = relationshipWith(target, actor, this.relationshipLimit);
    const changes =
      type === 'foodShared'
        ? { trust: 3, affinity: 4, familiarity: 1 }
        : type === 'socialGrooming'
          ? { trust: 1.5, affinity: 2, familiarity: 1.5 }
          : { trust: 2, affinity: 1, familiarity: 1 };
    if (success) {
      adjustRelationship(actorRelationship, changes);
      adjustRelationship(targetRelationship, changes);
    } else {
      adjustRelationship(actorRelationship, { trust: -1, affinity: -0.5 });
      adjustRelationship(targetRelationship, { trust: -0.5, affinity: -0.25 });
    }
    actorRelationship.lastInteractionTick = tick;
    targetRelationship.lastInteractionTick = tick;
    if (success && type === 'foodShared') {
      actorRelationship.sharingCount += 1;
      targetRelationship.sharingCount += 1;
    } else if (success && type === 'socialGrooming') {
      actorRelationship.groomingCount += 1;
      targetRelationship.groomingCount += 1;
    } else if (success) {
      actorRelationship.cooperationCount += 1;
      targetRelationship.cooperationCount += 1;
    }
    return this.event(type, tick, generation, [actor.id, target.id], {
      outcome: success ? 'success' : 'failed',
      ...(quantity > 0 ? { quantity } : {}),
      ...(actor.groupId && actor.groupId === target.groupId ? { groupId: actor.groupId } : {}),
    });
  }

  private updateGroups(
    living: Hominin[],
    byAgentId: Map<string, Hominin>,
    spatial: AgentSpatialIndex,
    tick: number,
    generation: number,
  ): SocialEvent[] {
    const events: SocialEvent[] = [];
    for (const group of this.groups.sort((a, b) => a.id.localeCompare(b.id))) {
      for (const id of [...group.memberIds].sort()) {
        const member = byAgentId.get(id);
        if (!member) {
          this.removeMember(group, id);
          continue;
        }
        const closeMember = spatial
          .query(member.position, 3)
          .some((other) => other.id !== id && group.memberIds.includes(other.id));
        if (closeMember) group.memberLastSeen[id] = tick;
        if (tick - (group.memberLastSeen[id] ?? group.formedTick) > separationGraceTicks) {
          this.removeMember(group, id);
          member.groupId = null;
          events.push(this.event('socialGroupLeft', tick, generation, [id], { groupId: group.id }));
        }
      }
      if (group.memberIds.length >= minimumGroupSize) group.lastActiveTick = tick;
    }

    for (const agent of living) {
      if (agent.groupId) continue;
      const candidates = spatial
        .query(agent.position, 2)
        .filter((other) => other.id !== agent.id)
        .sort(byId)
        .slice(0, 8);
      const join = candidates.find((other) => this.compatible(agent, other));
      if (!join) continue;
      const existing = join.groupId
        ? this.groups.find(
            (group) => group.id === join.groupId && group.memberIds.length < maximumGroupSize,
          )
        : undefined;
      if (existing) {
        existing.memberIds.push(agent.id);
        existing.memberIds.sort();
        existing.memberLastSeen[agent.id] = tick;
        agent.groupId = existing.id;
        events.push(
          this.event('socialGroupJoined', tick, generation, [agent.id, join.id], {
            groupId: existing.id,
          }),
        );
      } else if (!join.groupId) {
        const group: SocialGroup = {
          id: `group-${this.nextGroupId++}`,
          memberIds: [agent.id, join.id].sort(),
          formedTick: tick,
          formedGeneration: generation,
          lastActiveTick: tick,
          memberLastSeen: { [agent.id]: tick, [join.id]: tick },
        };
        agent.groupId = group.id;
        join.groupId = group.id;
        this.groups.push(group);
        events.push(
          this.event('socialGroupFormed', tick, generation, group.memberIds, {
            groupId: group.id,
          }),
        );
      }
    }

    for (const group of [...this.groups]) {
      if (group.memberIds.length >= minimumGroupSize) continue;
      for (const id of group.memberIds) {
        const member = byAgentId.get(id);
        if (member) member.groupId = null;
      }
      events.push(
        this.event('socialGroupDissolved', tick, generation, [...group.memberIds], {
          groupId: group.id,
        }),
      );
      this.groups = this.groups.filter((candidate) => candidate.id !== group.id);
    }
    return events;
  }

  private compatible(first: Hominin, second: Hominin): boolean {
    const a = first.relationships.find((item) => item.agentId === second.id);
    const b = second.relationships.find((item) => item.agentId === first.id);
    if (!a || !b) return false;
    return (
      (a.familiarity + b.familiarity) / 2 >= 6 &&
      (a.affinity + b.affinity) / 2 >= 0 &&
      (first.phenotype.socialSensitivity + second.phenotype.socialSensitivity) / 2 >= 35
    );
  }

  private removeMember(group: SocialGroup, id: string): void {
    group.memberIds = group.memberIds.filter((memberId) => memberId !== id);
    delete group.memberLastSeen[id];
  }

  private event(
    type: SocialEvent['type'],
    tick: number,
    generation: number,
    participantIds: string[],
    details: Pick<SocialEvent, 'groupId' | 'outcome' | 'quantity'> = {},
  ): SocialEvent {
    return {
      id: `social-${tick}-${this.nextEventId++}`,
      tick,
      generation,
      type,
      participantIds: [...participantIds].sort(),
      ...details,
    };
  }
}

export function socialMetrics(
  agents: readonly Hominin[],
  groups: readonly SocialGroup[],
  events: readonly SocialEvent[],
): SocialMetrics {
  const livingIds = new Set(agents.map((agent) => agent.id));
  const relationships = agents
    .flatMap((agent) => agent.relationships.map((relationship) => ({ agent, relationship })))
    .filter(
      ({ agent, relationship }) =>
        livingIds.has(relationship.agentId) && agent.id < relationship.agentId,
    );
  const count = (type: SocialEvent['type']) => events.filter((event) => event.type === type).length;
  return {
    activeGroups: groups.length,
    groupSizes: groups.map((group) => group.memberIds.length).sort((a, b) => a - b),
    groupedIndividuals: agents.filter((agent) => agent.groupId).length,
    solitaryIndividuals: agents.filter((agent) => !agent.groupId).length,
    activeRelationships: relationships.length,
    positiveRelationships: relationships.filter(({ relationship }) => relationship.affinity > 10)
      .length,
    neutralRelationships: relationships.filter(
      ({ relationship }) => Math.abs(relationship.affinity) <= 10,
    ).length,
    negativeRelationships: relationships.filter(({ relationship }) => relationship.affinity < -10)
      .length,
    isolatedIndividuals: agents.filter(
      (agent) => !agent.relationships.some((relationship) => livingIds.has(relationship.agentId)),
    ).length,
    averageFamiliarity: average(relationships.map(({ relationship }) => relationship.familiarity)),
    averageTrust: average(relationships.map(({ relationship }) => relationship.trust)),
    cooperativeForagingEvents: count('cooperativeForaging'),
    foodSharingEvents: count('foodShared'),
    groomingEvents: count('socialGrooming'),
    groupFormationEvents: count('socialGroupFormed'),
    groupDissolutionEvents: count('socialGroupDissolved'),
  };
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function byId(first: Hominin, second: Hominin): number {
  return first.id.localeCompare(second.id);
}

function cloneGroup(group: SocialGroup): SocialGroup {
  return {
    ...group,
    memberIds: [...group.memberIds],
    memberLastSeen: { ...group.memberLastSeen },
  };
}
