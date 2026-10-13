import { defaultWorldConfiguration } from '@/features/world/types';
import {
  worldConfigurationFromRoute,
  worldConfigurationToSimulationConfig,
} from '@/features/world/world-configuration';

describe('world configuration', () => {
  it('maps every available Create World control into engine configuration', () => {
    const result = worldConfigurationToSimulationConfig({
      scenario: 'hardFood',
      foodAbundance: 100,
      waterAvailability: 0,
      predatorPressure: 50,
      initialPopulation: 36,
    });
    expect(result).toMatchObject({
      scenario: 'hardFood',
      population: { initial: 36 },
      world: { foodPatches: 28, waterSources: 2, predatorCount: 4 },
    });
  });

  it('rejects unsupported route scenarios and clamps external values', () => {
    expect(
      worldConfigurationFromRoute(
        { scenario: 'forest', food: '999', water: '-2', population: '200' },
        defaultWorldConfiguration,
      ),
    ).toEqual({
      ...defaultWorldConfiguration,
      foodAbundance: 100,
      waterAvailability: 0,
      initialPopulation: 60,
    });
  });

  it('uses an explicit world seed without changing supported scenario settings', () => {
    const configuration = { ...defaultWorldConfiguration, seed: 'PLAYER-WORLD-42' };
    expect(worldConfigurationToSimulationConfig(configuration).seed).toBe('PLAYER-WORLD-42');
    expect(
      worldConfigurationFromRoute({ seed: 'PLAYER-WORLD-42' }, defaultWorldConfiguration),
    ).toMatchObject(configuration);
  });
});
