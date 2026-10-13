import { clamp } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { Genome } from '@/simulation/engine/types';
import { traitNames } from '@/simulation/engine/types';

export function createRandomGenome(
  rng: SeededRng,
  mean: number,
  standardDeviation: number,
): Genome {
  const values = {} as Record<(typeof traitNames)[number], number>;
  for (const trait of traitNames) values[trait] = clamp(rng.normal(mean, standardDeviation));
  return Object.freeze(values);
}
