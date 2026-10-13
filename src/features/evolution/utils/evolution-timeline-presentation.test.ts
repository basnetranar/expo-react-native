import {
  createEvolutionTimelineViewModel,
  createMilestones,
  findGeneration,
} from '@/features/evolution/utils/evolution-timeline-presentation';
import { SimulationEngine } from '@/simulation';
import type { EvolutionHistorySnapshot, SimulationEvent } from '@/simulation';

function history(generations = 3): EvolutionHistorySnapshot {
  const engine = new SimulationEngine({ seed: 'timeline-presentation' });
  engine.runUntilGeneration(generations);
  return engine.getEvolutionHistorySnapshot();
}

describe('evolution timeline presentation', () => {
  it('maps ordered population, birth, death, and all ten inherited trait trends', () => {
    const model = createEvolutionTimelineViewModel(history(), 'stableSavannah');
    expect(model.chart.map((point) => point.generation)).toEqual([1, 2, 3]);
    expect(model.traitNames).toHaveLength(10);
    for (const trait of model.traitNames) {
      expect(model.traitSeries[trait]).toHaveLength(3);
      expect(model.traitSeries[trait][0]?.value).toEqual(expect.any(Number));
    }
  });

  it('orders and deduplicates milestones without altering source events', () => {
    const events: SimulationEvent[] = [
      { id: 'late', type: 'extinction', tick: 80, generation: 2 },
      {
        id: 'discover',
        type: 'firstDiscovery',
        behaviour: 'stoneCracking',
        agentId: 'g0-1',
        tick: 20,
        generation: 1,
      },
      {
        id: 'duplicate',
        type: 'firstDiscovery',
        behaviour: 'stoneCracking',
        agentId: 'g0-2',
        tick: 21,
        generation: 1,
      },
    ];
    const milestones = createMilestones(events);
    expect(milestones.map((item) => item.id)).toEqual(['discover', 'late']);
    expect(events[0]?.id).toBe('late');
  });

  it('presents recorded cultural discovery, establishment, loss, and rediscovery', () => {
    const events: SimulationEvent[] = [
      {
        id: 'd1',
        type: 'firstDiscovery',
        behaviour: 'stoneCracking',
        agentId: 'a',
        tick: 1,
        generation: 1,
      },
      {
        id: 'c1',
        type: 'culturalThreshold',
        behaviour: 'stoneCracking',
        stage: 'established',
        prevalence: 0.6,
        tick: 1,
        generation: 1,
      },
      {
        id: 'l1',
        type: 'traditionLost',
        behaviour: 'stoneCracking',
        previousStage: 'established',
        tick: 3,
        generation: 3,
      },
      {
        id: 'd2',
        type: 'firstDiscovery',
        behaviour: 'stoneCracking',
        agentId: 'b',
        tick: 4,
        generation: 4,
      },
    ];
    const milestones = createMilestones(events);
    expect(milestones.map((item) => item.title)).toEqual([
      'Stone cracking discovered',
      'Stone cracking: established',
      'Stone cracking lost',
      'Stone cracking rediscovered',
    ]);
  });

  it('supports generation selection and missing historical measurements', () => {
    const model = createEvolutionTimelineViewModel(history(2), 'stableSavannah');
    expect(findGeneration(model, 1)?.generation).toBe(1);
    expect(findGeneration(model, 99)).toBeNull();
    const empty = createEvolutionTimelineViewModel(
      {
        currentTick: 0,
        currentGeneration: 0,
        currentPopulation: 24,
        summaries: [],
        events: [],
        retention: {
          generationLimit: 200,
          eventLimit: 1000,
          generationsDiscarded: 0,
          eventsDiscarded: 0,
        },
      },
      'stableSavannah',
    );
    expect(empty.population).toBe(24);
    expect(empty.latestGeneration).toBeNull();
    expect(empty.chart).toEqual([]);
    expect(empty.traitSeries.memoryPotential).toEqual([]);
  });

  it('presents intervention lifecycle events as environmental milestones', () => {
    const milestones = createMilestones([
      {
        id: 'environment-1-active',
        type: 'environmentIntervention',
        interventionId: 'environment-000001',
        interventionType: 'drought',
        value: 1,
        status: 'active',
        tick: 10,
        generation: 2,
      },
      {
        id: 'environment-1-completed',
        type: 'environmentIntervention',
        interventionId: 'environment-000001',
        interventionType: 'drought',
        value: 1,
        status: 'completed',
        tick: 20,
        generation: 3,
      },
    ]);
    expect(milestones).toEqual([
      expect.objectContaining({ category: 'environment', title: 'Drought active' }),
      expect.objectContaining({ category: 'environment', title: 'Drought completed' }),
    ]);
  });
});
