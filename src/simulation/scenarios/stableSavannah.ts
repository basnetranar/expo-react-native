import type { Scenario } from '@/simulation/scenarios/types';

export const stableSavannah: Scenario = {
  name: 'stableSavannah',
  configureWorld(world) {
    world.foodRegenerationMultiplier = 1;
  },
  update() {
    return [];
  },
};
