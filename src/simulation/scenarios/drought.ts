import type { SimulationEvent } from '@/simulation/engine/types';
import type { Scenario } from '@/simulation/scenarios/types';
import { retainWaterSources } from '@/simulation/world/environment';

export const drought: Scenario = {
  name: 'drought',
  configureWorld() {},
  update(world, generation, tick, config) {
    const events: SimulationEvent[] = [];
    const { droughtStart, droughtDuration, droughtWaterSources, droughtFoodMultiplier } =
      config.scenarioSettings;
    if (generation === droughtStart && world.foodRegenerationMultiplier !== droughtFoodMultiplier) {
      retainWaterSources(world, droughtWaterSources);
      world.foodRegenerationMultiplier = droughtFoodMultiplier;
      events.push({
        id: `scenario-drought-start-${tick}`,
        type: 'scenarioPhase',
        phase: 'droughtStarted',
        tick,
        generation,
      });
    }
    if (generation === droughtStart + droughtDuration && world.foodRegenerationMultiplier !== 1) {
      retainWaterSources(world, config.world.waterSources);
      world.foodRegenerationMultiplier = 1;
      events.push({
        id: `scenario-drought-end-${tick}`,
        type: 'scenarioPhase',
        phase: 'droughtEnded',
        tick,
        generation,
      });
    }
    return events;
  },
};
