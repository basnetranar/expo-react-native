import { createExperimentsViewModel } from '@/features/experiments/utils/experiment-presentation';
import { SimulationEngine } from '@/simulation';

describe('experiments presentation', () => {
  it('uses only recorded generation observations and separates live from terminal records', () => {
    const engine = new SimulationEngine({
      seed: 'experiment-presentation',
      time: { ticksPerGeneration: 2 },
    });
    engine.runTicks(4);
    const [scheduled] = engine
      .scheduleEnvironmentInterventions([
        { type: 'foodAvailability', value: 0.7, durationTicks: 2 },
      ])
      .interventions.filter((item) => item.status === 'scheduled');
    engine.step();
    const activeModel = createExperimentsViewModel({
      environment: engine.getEnvironmentInterventionSnapshot(),
      summaries: engine.getEvolutionHistorySnapshot().summaries,
      scenario: 'stableSavannah',
      status: 'running',
      population: engine.getSnapshot().populationSize,
    });
    expect(activeModel.active).toEqual([expect.objectContaining({ id: scheduled!.id })]);
    expect(activeModel.firstObservedGeneration).toBe(activeModel.generation);
    expect(activeModel.trend).toHaveLength(engine.getGenerationSummaries().length);
    expect(activeModel.trend.every((point) => point.generation <= activeModel.generation)).toBe(
      true,
    );

    engine.runTicks(2);
    const completeModel = createExperimentsViewModel({
      environment: engine.getEnvironmentInterventionSnapshot(),
      summaries: engine.getEvolutionHistorySnapshot().summaries,
      scenario: 'stableSavannah',
      status: 'paused',
      population: engine.getSnapshot().populationSize,
    });
    expect(completeModel.active).toEqual([]);
    expect(completeModel.history).toEqual([
      expect.objectContaining({ id: scheduled!.id, status: 'completed' }),
    ]);
  });

  it('does not fabricate history when no generation has completed', () => {
    const engine = new SimulationEngine({ seed: 'empty-experiment-history' });
    const model = createExperimentsViewModel({
      environment: engine.getEnvironmentInterventionSnapshot(),
      summaries: [],
      scenario: 'stableSavannah',
      status: 'paused',
      population: engine.getSnapshot().populationSize,
    });
    expect(model.trend).toEqual([]);
    expect(model.latestSummary).toBeNull();
    expect(model.firstObservedGeneration).toBeNull();
  });
});
