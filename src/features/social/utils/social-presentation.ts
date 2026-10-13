import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import type {
  SocialActivityViewModel,
  SocialOverviewViewModel,
  SocialPersonViewModel,
} from '@/features/social/types';
import type { SocialEvent, SocialSnapshot } from '@/simulation';

export function createSocialOverview(source: SocialSnapshot): SocialOverviewViewModel {
  const people = source.agents.map<SocialPersonViewModel>((agent) => ({
    id: agent.id,
    name: getFriendlyName(agent.id),
    generation: agent.generation,
    age: agent.age,
    alive: agent.alive,
    groupId: agent.groupId,
  }));
  const byId = new Map(people.map((person) => [person.id, person]));
  const events = [...source.events]
    .sort((a, b) => b.tick - a.tick || b.id.localeCompare(a.id))
    .map((event) => presentActivity(event));
  return {
    tick: source.currentTick,
    generation: source.currentGeneration,
    population: people.length,
    people,
    groups: source.groups
      .map((group) => ({
        id: group.id,
        label: groupLabel(group.id),
        formedGeneration: group.formedGeneration,
        formedTick: group.formedTick,
        ageTicks: Math.max(0, source.currentTick - group.formedTick),
        members: group.memberIds.map((id) => byId.get(id)).filter(isPresent),
        events: events.filter((event) => event.groupId === group.id),
      }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    recentActivity: events.slice(0, 40),
    metrics: { ...source.metrics, groupSizes: [...source.metrics.groupSizes] },
    agents: source.agents,
  };
}

export function relationshipCategory(affinity: number): 'positive' | 'neutral' | 'negative' {
  if (affinity > 10) return 'positive';
  if (affinity < -10) return 'negative';
  return 'neutral';
}

export function groupLabel(id: string): string {
  const suffix = id.split('-').at(-1) ?? id;
  return `Group ${suffix}`;
}

function presentActivity(event: SocialEvent): SocialActivityViewModel {
  const names = event.participantIds.map(getFriendlyName);
  return {
    id: event.id,
    type: event.type,
    title: titleFor(event.type),
    detail:
      event.type === 'foodShared' && event.quantity
        ? `${names.join(' and ')} transferred ${event.quantity.toFixed(1)} food.`
        : `${names.join(', ')} · ${event.outcome ?? 'recorded'}`,
    tick: event.tick,
    generation: event.generation,
    participantIds: [...event.participantIds],
    participantNames: names,
    ...(event.groupId ? { groupId: event.groupId } : {}),
  };
}

function titleFor(type: SocialEvent['type']): string {
  const labels: Record<SocialEvent['type'], string> = {
    socialEncounter: 'First encounter',
    socialGroupFormed: 'Group formed',
    socialGroupJoined: 'Member joined',
    socialGroupLeft: 'Member left',
    socialGroupDissolved: 'Group dissolved',
    cooperativeForaging: 'Cooperative foraging',
    foodShared: 'Food shared',
    socialGrooming: 'Social grooming',
    socialConflict: 'Resource competition',
  };
  return labels[type];
}

function isPresent<T>(value: T | undefined): value is T {
  return value !== undefined;
}
