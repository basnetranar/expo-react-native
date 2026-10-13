import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';

export function mutationDelta(rng: SeededRng, config: SimulationConfig): number {
  const base = rng.normal(0, config.mutation.scale);
  if (!rng.chance(config.mutation.tailChance)) return base;
  const tailScale = rng.chance(0.1) ? 8 : 3.2;
  return base + rng.normal(0, tailScale);
}
