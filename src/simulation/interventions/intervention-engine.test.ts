import { SimulationEngine } from '@/simulation';

describe('environment interventions in SimulationEngine', () => {
  it('applies food, water, and predator changes to real world mechanics', () => {
    const engine = new SimulationEngine({ seed: 'real-environment-changes' });
    engine.scheduleEnvironmentInterventions([
      { type: 'foodAvailability', value: 0.5, durationTicks: null },
      { type: 'waterAvailability', value: 1.5, durationTicks: null },
      { type: 'predatorPressure', value: 1.25, durationTicks: null },
    ]);
    engine.step();
    expect(engine.getEnvironmentInterventionSnapshot().effective).toMatchObject({
      foodRegeneration: 0.11,
      waterRegeneration: 1.125,
      predatorPressure: 1.25,
    });
    expect(
      engine
        .getEvolutionHistorySnapshot()
        .events.filter(
          (event) => event.type === 'environmentIntervention' && event.status === 'active',
        ),
    ).toHaveLength(3);
  });

  it('replays deterministically and snapshot reads do not consume RNG', () => {
    const first = new SimulationEngine({ seed: 'intervention-replay' });
    const second = new SimulationEngine({ seed: 'intervention-replay' });
    const commands = [
      { type: 'drought' as const, value: 1, durationTicks: 18 },
      { type: 'predatorPressure' as const, value: 1.4, durationTicks: 30 },
    ];
    first.scheduleEnvironmentInterventions(commands);
    second.scheduleEnvironmentInterventions(commands);
    first.getEnvironmentInterventionSnapshot();
    first.getEnvironmentInterventionSnapshot();
    first.runTicks(80);
    for (let index = 0; index < 8; index += 1) second.runTicks(10);
    expect(first.getSnapshot()).toEqual(second.getSnapshot());
    expect(first.getEvolutionHistorySnapshot()).toEqual(second.getEvolutionHistorySnapshot());
    expect(first.getEnvironmentInterventionSnapshot()).toEqual(
      second.getEnvironmentInterventionSnapshot(),
    );
  });
});
