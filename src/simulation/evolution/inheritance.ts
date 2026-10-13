import { clamp } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Genome } from '@/simulation/engine/types';
import { traitNames } from '@/simulation/engine/types';
import { mutationDelta } from '@/simulation/evolution/mutation';

export function inheritGenome(
  first: Genome,
  second: Genome,
  rng: SeededRng,
  config: SimulationConfig,
): Genome {
  const child = {} as Record<(typeof traitNames)[number], number>;
  for (const trait of traitNames) {
    child[trait] = clamp(
      (first[trait] + second[trait]) / 2 +
        rng.normal(0, config.reproduction.recombinationSd) +
        mutationDelta(rng, config),
    );
  }
  return Object.freeze(child);
}
