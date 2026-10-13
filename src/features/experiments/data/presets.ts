import type { ExperimentPreset } from '@/features/experiments/types';

export const experimentPresets: readonly ExperimentPreset[] = [
  {
    id: 'dry-season',
    name: 'Dry Season',
    explanation: 'Drafts 65% food and 50% water availability.',
    values: { foodAvailability: 65, waterAvailability: 50, predatorPressure: 100 },
  },
  {
    id: 'abundant-food',
    name: 'Abundant Food',
    explanation: 'Drafts 140% food availability; water and predator pressure stay at baseline.',
    values: { foodAvailability: 140, waterAvailability: 100, predatorPressure: 100 },
  },
  {
    id: 'predator-surge',
    name: 'Predator Surge',
    explanation: 'Drafts 150% predator pressure without changing predator count.',
    values: { foodAvailability: 100, waterAvailability: 100, predatorPressure: 150 },
  },
  {
    id: 'resource-scarcity',
    name: 'Resource Scarcity',
    explanation: 'Drafts 60% food and water availability.',
    values: { foodAvailability: 60, waterAvailability: 60, predatorPressure: 100 },
  },
];
