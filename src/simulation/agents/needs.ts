import { clamp } from '@/simulation/engine/math';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { BehaviourType, Hominin } from '@/simulation/engine/types';

const activityMultiplier: Record<BehaviourType, number> = {
  rest: 0.65,
  eat: 1,
  drink: 1,
  moveToFoodMemory: 1,
  moveToWaterMemory: 1,
  explore: 1.15,
  flee: 1.8,
  follow: 1.1,
  observe: 0.9,
  cooperativeForage: 1.05,
  shareFood: 0.85,
  groom: 0.8,
};

export function depleteNeeds(
  agent: Hominin,
  behaviour: BehaviourType,
  config: SimulationConfig,
): void {
  const multiplier = activityMultiplier[behaviour];
  const developmentMultiplier =
    agent.phenotype.lifeStage === 'juvenile'
      ? config.needs.juvenileMetabolismMultiplier
      : agent.phenotype.lifeStage === 'youngAdult'
        ? config.needs.youngAdultMetabolismMultiplier
        : 1;
  const metabolicFactor =
    1.15 - agent.phenotype.metabolicEfficiency / 250 + agent.phenotype.cognitiveCost * 0.22;
  agent.needs.energy = clamp(
    agent.needs.energy -
      config.needs.energyDepletion * multiplier * metabolicFactor * developmentMultiplier,
  );
  agent.needs.hydration = clamp(
    agent.needs.hydration - config.needs.hydrationDepletion * multiplier * developmentMultiplier,
  );
}

export function updateNeedMortality(agent: Hominin, config: SimulationConfig): void {
  agent.zeroEnergyTicks = agent.needs.energy <= 0 ? agent.zeroEnergyTicks + 1 : 0;
  agent.zeroHydrationTicks = agent.needs.hydration <= 0 ? agent.zeroHydrationTicks + 1 : 0;
  if (agent.zeroEnergyTicks > config.needs.zeroNeedGraceTicks)
    agent.health = clamp(agent.health - config.needs.healthLossAtZero);
  if (agent.zeroHydrationTicks > config.needs.zeroNeedGraceTicks)
    agent.health = clamp(agent.health - config.needs.healthLossAtZero * 1.45);
}
