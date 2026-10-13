import { SeededRng } from '@/simulation/engine/seededRng';
import type { Predator, World } from '@/simulation/engine/types';

export function createPredators(count: number, world: World, rng: SeededRng): Predator[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `predator-${index}`,
    position: { x: rng.integer(0, world.width - 1), y: rng.integer(0, world.height - 1) },
    state: 'patrol',
    stamina: 100,
    restTicks: 0,
  }));
}
