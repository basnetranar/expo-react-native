import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { SimulationEvent, World } from '@/simulation/engine/types';

export type ScenarioName = 'stableSavannah' | 'drought' | 'hardFood';

export interface Scenario {
  name: ScenarioName;
  configureWorld(world: World, config: SimulationConfig): void;
  update(
    world: World,
    generation: number,
    tick: number,
    config: SimulationConfig,
  ): SimulationEvent[];
}
