import { cloneSummary } from '@/simulation/engine/snapshots';
import type {
  EvolutionHistorySnapshot,
  GenerationSummary,
  SimulationEvent,
} from '@/simulation/engine/types';

/**
 * Retains completed-generation aggregates and structured events only. The oldest
 * records are discarded first at the configured limits; agents and world tiles
 * are never retained here.
 */
export class EvolutionHistoryRecorder {
  private summaries: GenerationSummary[] = [];
  private events: SimulationEvent[] = [];
  private generationsDiscarded = 0;
  private eventsDiscarded = 0;

  constructor(
    private readonly generationLimit: number,
    private readonly eventLimit: number,
  ) {}

  recordSummary(summary: GenerationSummary): void {
    this.summaries.push(cloneSummary(summary));
    const overflow = Math.max(0, this.summaries.length - this.generationLimit);
    if (overflow > 0) {
      this.summaries.splice(0, overflow);
      this.generationsDiscarded += overflow;
    }
  }

  recordEvents(events: readonly SimulationEvent[]): void {
    this.events.push(...events.map(cloneEvent));
    const overflow = Math.max(0, this.events.length - this.eventLimit);
    if (overflow > 0) {
      this.events.splice(0, overflow);
      this.eventsDiscarded += overflow;
    }
  }

  getSummaries(): GenerationSummary[] {
    return this.summaries.map(cloneSummary);
  }

  getEvents(): SimulationEvent[] {
    return this.events.map(cloneEvent);
  }

  snapshot(
    currentTick: number,
    currentGeneration: number,
    currentPopulation: number,
  ): EvolutionHistorySnapshot {
    return {
      currentTick,
      currentGeneration,
      currentPopulation,
      summaries: this.getSummaries(),
      events: this.getEvents(),
      retention: {
        generationLimit: this.generationLimit,
        eventLimit: this.eventLimit,
        generationsDiscarded: this.generationsDiscarded,
        eventsDiscarded: this.eventsDiscarded,
      },
    };
  }

  exportState(): EvolutionHistoryState {
    return {
      summaries: this.getSummaries(),
      events: this.getEvents(),
      generationLimit: this.generationLimit,
      eventLimit: this.eventLimit,
      generationsDiscarded: this.generationsDiscarded,
      eventsDiscarded: this.eventsDiscarded,
    };
  }

  restoreState(state: EvolutionHistoryState): void {
    if (state.generationLimit !== this.generationLimit || state.eventLimit !== this.eventLimit)
      throw new Error('Checkpoint history limits do not match its simulation configuration.');
    this.summaries = state.summaries.map(cloneSummary);
    this.events = state.events.map(cloneEvent);
    this.generationsDiscarded = state.generationsDiscarded;
    this.eventsDiscarded = state.eventsDiscarded;
  }
}

export interface EvolutionHistoryState {
  summaries: GenerationSummary[];
  events: SimulationEvent[];
  generationLimit: number;
  eventLimit: number;
  generationsDiscarded: number;
  eventsDiscarded: number;
}

function cloneEvent(event: SimulationEvent): SimulationEvent {
  return { ...event };
}
