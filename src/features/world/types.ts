import type { ScenarioName } from '@/simulation';

export interface WorldConfiguration {
  scenario: ScenarioName;
  foodAbundance: number;
  waterAvailability: number;
  predatorPressure: number;
  initialPopulation: number;
  seed?: string | undefined;
}

export const defaultWorldConfiguration: WorldConfiguration = {
  scenario: 'stableSavannah',
  foodAbundance: 50,
  waterAvailability: 50,
  predatorPressure: 38,
  initialPopulation: 24,
};
