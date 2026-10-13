import { snapshotAgentInspector } from '@/simulation/engine/snapshots';
import type {
  CulturalGenerationSummary,
  CulturalSnapshot,
  Hominin,
  LearnedBehaviourType,
  LearningEvent,
  LearningEventType,
} from '@/simulation/engine/types';
import { learnableBehaviourTypes } from '@/simulation/learning/behaviourRegistry';
import type { LearningInteraction } from '@/simulation/learning/imitationSystem';

const summaryLimit = 200;
const milestoneLimit = 256;

type Counters = Omit<
  CulturalGenerationSummary['behaviours'][LearnedBehaviourType],
  'practitioners' | 'adoption' | 'averageProficiency' | 'highestProficiency' | 'groups'
>;

export interface CulturalHistoryState {
  nextEventId: number;
  discovered: Record<LearnedBehaviourType, boolean>;
  currentlyKnown: Record<LearnedBehaviourType, boolean>;
  milestones: LearningEvent[];
  recentEvents?: LearningEvent[];
  summaries: CulturalGenerationSummary[];
  counters: Record<LearnedBehaviourType, Counters>;
  summariesDiscarded: number;
  totalEventsRecorded?: number;
}

export class CulturalHistory {
  private nextEventId = 0;
  private discovered = flags(false);
  private currentlyKnown = flags(false);
  private milestones: LearningEvent[] = [];
  private recentEvents: LearningEvent[] = [];
  private summaries: CulturalGenerationSummary[] = [];
  private counters = counterRecord();
  private summariesDiscarded = 0;
  private totalEventsRecorded = 0;

  recordDiscovery(
    behaviour: LearnedBehaviourType,
    agentId: string,
    tick: number,
    generation: number,
    groupId?: string | null,
  ): LearningEvent[] {
    const firstDiscovery = !this.discovered[behaviour];
    const rediscovery = this.discovered[behaviour] && !this.currentlyKnown[behaviour];
    const type: LearningEventType = firstDiscovery
      ? 'behaviourDiscovered'
      : rediscovery
        ? 'behaviourRediscovered'
        : 'behaviourAcquired';
    this.discovered[behaviour] = true;
    this.currentlyKnown[behaviour] = true;
    this.counters[behaviour].newAcquisitions += 1;
    const event = this.event(type, behaviour, tick, generation, {
      agentId,
      ...(groupId ? { groupId } : {}),
      outcome: 'success',
    });
    if (rediscovery) this.counters[behaviour].rediscoveries += 1;
    else this.counters[behaviour].independentDiscoveries += 1;
    if (firstDiscovery || rediscovery) this.retainMilestone(event);
    this.retainRecent([event]);
    return [event];
  }

  recordInteractions(
    interactions: readonly LearningInteraction[],
    tick: number,
    generation: number,
  ): LearningEvent[] {
    const events: LearningEvent[] = [];
    for (const item of interactions) {
      this.counters[item.behaviour].observations += 1;
      // The first and every fifth observation are retained; the underlying opportunity keeps totals.
      if (item.observed && (item.observationCount === 1 || item.observationCount % 5 === 0))
        events.push(
          this.event('behaviourObserved', item.behaviour, tick, generation, {
            agentId: item.observerId,
            sourceAgentId: item.sourceAgentId,
            ...(item.groupId ? { groupId: item.groupId } : {}),
            outcome: 'observed',
          }),
        );
      if (item.demonstrated) this.counters[item.behaviour].demonstrations += 1;
      if (item.demonstrated && (item.firstDemonstration || item.observationCount % 5 === 0)) {
        events.push(
          this.event('behaviourDemonstrated', item.behaviour, tick, generation, {
            agentId: item.sourceAgentId,
            sourceAgentId: item.observerId,
            ...(item.groupId ? { groupId: item.groupId } : {}),
            outcome: 'observed',
          }),
        );
      }
      if (item.attempted) {
        this.counters[item.behaviour].attempts += 1;
        events.push(
          this.event('imitationAttempted', item.behaviour, tick, generation, {
            agentId: item.observerId,
            sourceAgentId: item.sourceAgentId,
            ...(item.groupId ? { groupId: item.groupId } : {}),
            outcome: item.acquired ? 'success' : 'failed',
          }),
        );
      }
      if (item.acquired) {
        this.currentlyKnown[item.behaviour] = true;
        this.discovered[item.behaviour] = true;
        this.counters[item.behaviour].newAcquisitions += 1;
        this.counters[item.behaviour].transmissions += 1;
        events.push(
          this.event('behaviourAcquired', item.behaviour, tick, generation, {
            agentId: item.observerId,
            sourceAgentId: item.sourceAgentId,
            ...(item.groupId ? { groupId: item.groupId } : {}),
            outcome: 'success',
          }),
          this.event('behaviourTransmitted', item.behaviour, tick, generation, {
            agentId: item.observerId,
            sourceAgentId: item.sourceAgentId,
            ...(item.groupId ? { groupId: item.groupId } : {}),
            outcome: 'success',
          }),
        );
      }
    }
    this.retainRecent(events);
    return events;
  }

  recordPractice(
    behaviour: LearnedBehaviourType,
    agentId: string,
    before: number,
    after: number,
    successful: boolean,
    tick: number,
    generation: number,
  ): LearningEvent[] {
    if (Math.floor(before / 10) === Math.floor(after / 10) && successful) return [];
    const event = this.event('behaviourPracticed', behaviour, tick, generation, {
      agentId,
      outcome: successful ? 'success' : 'failed',
      proficiencyBefore: before,
      proficiencyAfter: after,
    });
    this.retainRecent([event]);
    return [event];
  }

  reconcile(population: readonly Hominin[], tick: number, generation: number): LearningEvent[] {
    const events: LearningEvent[] = [];
    for (const behaviour of learnableBehaviourTypes) {
      const known = population.some(
        (agent) => agent.alive && agent.learnedBehaviours.some((item) => item.type === behaviour),
      );
      if (!known && this.currentlyKnown[behaviour]) {
        this.currentlyKnown[behaviour] = false;
        this.counters[behaviour].losses += 1;
        const event = this.event('behaviourLost', behaviour, tick, generation, {});
        this.retainMilestone(event);
        this.retainRecent([event]);
        events.push(event);
      }
    }
    return events;
  }

  completeGeneration(population: readonly Hominin[], generation: number): void {
    const living = population.filter((agent) => agent.alive);
    const behaviours = {} as CulturalGenerationSummary['behaviours'];
    for (const type of learnableBehaviourTypes) {
      const practitioners = living.filter((agent) =>
        agent.learnedBehaviours.some((item) => item.type === type),
      );
      const proficiencies = practitioners.map(
        (agent) => agent.learnedBehaviours.find((item) => item.type === type)!.proficiency,
      );
      const groups: Record<string, number> = {};
      for (const agent of practitioners)
        if (agent.groupId) groups[agent.groupId] = (groups[agent.groupId] ?? 0) + 1;
      behaviours[type] = {
        practitioners: practitioners.length,
        adoption: living.length ? practitioners.length / living.length : 0,
        averageProficiency: average(proficiencies),
        highestProficiency: proficiencies.length ? Math.max(...proficiencies) : 0,
        groups,
        ...this.counters[type],
      };
    }
    this.summaries.push({ generation, population: living.length, behaviours });
    const overflow = Math.max(0, this.summaries.length - summaryLimit);
    if (overflow) {
      this.summaries.splice(0, overflow);
      this.summariesDiscarded += overflow;
    }
    this.counters = counterRecord();
  }

  snapshot(
    population: readonly Hominin[],
    _events: readonly LearningEvent[],
    tick: number,
    generation: number,
  ): CulturalSnapshot {
    const living = population.filter((agent) => agent.alive);
    return {
      currentTick: tick,
      currentGeneration: generation,
      population: living.length,
      behaviours: learnableBehaviourTypes.map((behaviour) => {
        const practitioners = living.filter((agent) =>
          agent.learnedBehaviours.some((item) => item.type === behaviour),
        );
        const proficiencies = practitioners.map(
          (agent) => agent.learnedBehaviours.find((item) => item.type === behaviour)!.proficiency,
        );
        const groups: Record<string, number> = {};
        for (const agent of practitioners)
          if (agent.groupId) groups[agent.groupId] = (groups[agent.groupId] ?? 0) + 1;
        const firstDiscovery = this.milestones.find(
          (event) => event.behaviour === behaviour && event.type === 'behaviourDiscovered',
        );
        return {
          behaviour,
          historicallyDiscovered: this.discovered[behaviour],
          currentlyKnown: practitioners.length > 0,
          practitioners: practitioners.map(snapshotAgentInspector),
          adoption: living.length ? practitioners.length / living.length : 0,
          averageProficiency: average(proficiencies),
          highestProficiency: proficiencies.length ? Math.max(...proficiencies) : 0,
          groups,
          ...(firstDiscovery ? { firstDiscovery } : {}),
          events: this.recentEvents
            .filter((event) => event.behaviour === behaviour)
            .map(cloneEvent),
        };
      }),
      events: this.recentEvents.map(cloneEvent),
      milestones: this.milestones.map(cloneEvent),
      summaries: structuredClone(this.summaries),
      retention: {
        summaryLimit,
        milestoneLimit,
        summariesDiscarded: this.summariesDiscarded,
        eventsRecorded: this.totalEventsRecorded,
      },
    };
  }

  exportState(): CulturalHistoryState {
    return {
      nextEventId: this.nextEventId,
      discovered: { ...this.discovered },
      currentlyKnown: { ...this.currentlyKnown },
      milestones: this.milestones.map(cloneEvent),
      summaries: structuredClone(this.summaries),
      counters: structuredClone(this.counters),
      summariesDiscarded: this.summariesDiscarded,
      totalEventsRecorded: this.totalEventsRecorded,
    };
  }

  restoreState(state?: CulturalHistoryState): void {
    if (!state) return;
    this.nextEventId = state.nextEventId;
    this.discovered = { ...state.discovered };
    this.currentlyKnown = { ...state.currentlyKnown };
    this.milestones = state.milestones.map(cloneEvent);
    this.recentEvents = (state.recentEvents ?? []).map(cloneEvent);
    this.summaries = structuredClone(state.summaries);
    this.counters = structuredClone(state.counters);
    this.summariesDiscarded = state.summariesDiscarded;
    this.totalEventsRecorded = state.totalEventsRecorded ?? this.recentEvents.length;
  }

  bootstrap(population: readonly Hominin[]): void {
    for (const behaviour of learnableBehaviourTypes) {
      const known = population.some((agent) =>
        agent.learnedBehaviours.some((item) => item.type === behaviour),
      );
      this.discovered[behaviour] ||= known;
      this.currentlyKnown[behaviour] = known;
    }
  }

  private event(
    type: LearningEventType,
    behaviour: LearnedBehaviourType,
    tick: number,
    generation: number,
    details: Omit<Partial<LearningEvent>, 'id' | 'type' | 'behaviour' | 'tick' | 'generation'>,
  ): LearningEvent {
    return {
      id: `learning-${tick}-${this.nextEventId++}`,
      type,
      behaviour,
      tick,
      generation,
      ...details,
    };
  }

  private retainMilestone(event: LearningEvent): void {
    this.milestones.push(cloneEvent(event));
    if (this.milestones.length > milestoneLimit) this.milestones.shift();
  }

  private retainRecent(events: readonly LearningEvent[]): void {
    this.totalEventsRecorded += events.length;
    this.recentEvents.push(...events.map(cloneEvent));
    const overflow = Math.max(0, this.recentEvents.length - 2_000);
    if (overflow) this.recentEvents.splice(0, overflow);
  }
}

function flags(value: boolean): Record<LearnedBehaviourType, boolean> {
  return { stoneCracking: value, socialForaging: value };
}

function counterRecord(): Record<LearnedBehaviourType, Counters> {
  const empty = (): Counters => ({
    newAcquisitions: 0,
    observations: 0,
    attempts: 0,
    transmissions: 0,
    independentDiscoveries: 0,
    losses: 0,
    rediscoveries: 0,
    demonstrations: 0,
  });
  return { stoneCracking: empty(), socialForaging: empty() };
}

function average(values: readonly number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function cloneEvent(event: LearningEvent): LearningEvent {
  return { ...event };
}
