import {
  draftToInterventionCommands,
  environmentalEventCommand,
} from '@/features/experiments/services/experiment-command-adapter';

describe('experiment command adapter', () => {
  it('creates only changed controls and converts generations using engine timing', () => {
    expect(
      draftToInterventionCommands(
        {
          foodAvailability: 65,
          waterAvailability: 100,
          predatorPressure: 140,
          durationGenerations: 5,
        },
        { foodAvailability: 1, waterAvailability: 1, predatorPressure: 1 },
        120,
      ),
    ).toEqual([
      { type: 'foodAvailability', value: 0.65, durationTicks: 600 },
      { type: 'predatorPressure', value: 1.4, durationTicks: 600 },
    ]);
  });

  it('supports indefinite draft changes and explicit event severities', () => {
    expect(
      draftToInterventionCommands(
        {
          foodAvailability: 100,
          waterAvailability: 75,
          predatorPressure: 100,
          durationGenerations: 0,
        },
        { foodAvailability: 1, waterAvailability: 1, predatorPressure: 1 },
        50,
      ),
    ).toEqual([{ type: 'waterAvailability', value: 0.75, durationTicks: null }]);
    expect(environmentalEventCommand('drought', 5, 50)).toEqual({
      type: 'drought',
      value: 1,
      durationTicks: 250,
    });
  });
});
