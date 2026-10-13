import type {
  EnvironmentFactors,
  EnvironmentIntervention,
} from '@/simulation/interventions/intervention-types';

const minimumFactor = 0.25;
const maximumFactor = 2;

export function calculateEnvironmentFactors(
  interventions: readonly EnvironmentIntervention[],
): EnvironmentFactors {
  const contributions = {
    foodAvailability: [] as number[],
    waterAvailability: [] as number[],
    predatorPressure: [] as number[],
  };
  for (const intervention of interventions) {
    if (intervention.status !== 'active') continue;
    if (intervention.type === 'foodAvailability')
      contributions.foodAvailability.push(intervention.value);
    if (intervention.type === 'waterAvailability')
      contributions.waterAvailability.push(intervention.value);
    if (intervention.type === 'predatorPressure')
      contributions.predatorPressure.push(intervention.value);
    if (intervention.type === 'drought') {
      contributions.foodAvailability.push(0.65);
      contributions.waterAvailability.push(0.4);
    }
  }
  return {
    foodAvailability: combine(contributions.foodAvailability),
    waterAvailability: combine(contributions.waterAvailability),
    predatorPressure: combine(contributions.predatorPressure),
  };
}

function combine(values: number[]): number {
  values.sort((first, second) => first - second);
  return clampFactor(values.reduce((total, value) => total * value, 1));
}

export function clampFactor(value: number): number {
  return Math.max(minimumFactor, Math.min(maximumFactor, value));
}
