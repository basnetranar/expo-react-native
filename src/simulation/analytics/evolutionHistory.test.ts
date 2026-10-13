import { EvolutionHistoryRecorder } from '@/simulation/analytics/evolutionHistory';
import { SimulationEngine } from '@/simulation/engine/SimulationEngine';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import type { SimulationEvent } from '@/simulation/engine/types';

describe('EvolutionHistoryRecorder', () => {
  it('retains completed generations in order and enforces the configured bound', () => {
    const engine = new SimulationEngine({
      seed: 'history-bound-source',
      time: { ticksPerGeneration: 2 },
    });
    engine.runUntilGeneration(4);
    const source = engine.getGenerationSummaries();
    const recorder = new EvolutionHistoryRecorder(2, 3);
    source.forEach((summary) => recorder.recordSummary(summary));
    const snapshot = recorder.snapshot(8, 4, source.at(-1)!.population);
    expect(snapshot.summaries.map((summary) => summary.generation)).toEqual([3, 4]);
    expect(snapshot.retention).toMatchObject({
      generationLimit: 2,
      generationsDiscarded: 2,
    });
  });

  it('orders event retention deterministically and discards oldest events first', () => {
    const recorder = new EvolutionHistoryRecorder(2, 2);
    const events: SimulationEvent[] = [
      { id: 'one', type: 'scenarioPhase', phase: 'droughtStarted', tick: 1, generation: 0 },
      { id: 'two', type: 'scenarioPhase', phase: 'droughtEnded', tick: 2, generation: 0 },
      { id: 'three', type: 'extinction', tick: 3, generation: 1 },
    ];
    recorder.recordEvents(events);
    expect(recorder.getEvents().map((event) => event.id)).toEqual(['two', 'three']);
    expect(recorder.snapshot(3, 1, 0).retention.eventsDiscarded).toBe(1);
  });

  it('returns defensive history and does not consume engine RNG', () => {
    const config = {
      seed: 'history-rng',
      population: { ...createSimulationConfig().population, initial: 20 },
    };
    const inspected = new SimulationEngine(config);
    const control = new SimulationEngine(config);
    inspected.runTicks(25);
    control.runTicks(25);
    const history = inspected.getEvolutionHistorySnapshot();
    inspected.getEvolutionHistorySnapshot();
    inspected.getEvolutionHistorySnapshot();
    if (history.summaries[0]) history.summaries[0].averageGenome.strength = -1;
    inspected.runTicks(25);
    control.runTicks(25);
    expect(inspected.getSnapshot()).toEqual(control.getSnapshot());
    expect(inspected.getGenerationSummaries()).toEqual(control.getGenerationSummaries());
    expect(inspected.getGenerationSummaries()[0]?.averageGenome.strength).not.toBe(-1);
  });

  it('retains the extinction generation and event within bounded history', () => {
    const base = createSimulationConfig();
    const engine = new SimulationEngine({
      seed: 'history-extinction',
      population: { ...base.population, initial: 8, maximum: 8 },
      world: { ...base.world, foodPatches: 0, waterSources: 0, predatorCount: 8 },
      needs: {
        ...base.needs,
        energyDepletion: 20,
        hydrationDepletion: 20,
        zeroNeedGraceTicks: 0,
        healthLossAtZero: 100,
      },
    });
    engine.runUntilGeneration(10);
    const history = engine.getEvolutionHistorySnapshot();
    expect(history.summaries.at(-1)?.population).toBe(0);
    expect(history.events.at(-1)).toMatchObject({ type: 'extinction' });
  });
});
