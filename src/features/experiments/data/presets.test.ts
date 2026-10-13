import { experimentPresets } from '@/features/experiments/data/presets';

describe('experiment presets', () => {
  it('discloses supported draft values without application commands', () => {
    expect(experimentPresets.map((preset) => preset.id)).toEqual([
      'dry-season',
      'abundant-food',
      'predator-surge',
      'resource-scarcity',
    ]);
    expect(experimentPresets[0]).toMatchObject({
      values: { foodAvailability: 65, waterAvailability: 50, predatorPressure: 100 },
    });
    expect(experimentPresets.every((preset) => !('durationTicks' in preset))).toBe(true);
  });
});
