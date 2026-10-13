import type { GenerationSummary } from '@/simulation/engine/types';

export function formatCollapseReport(summaries: readonly GenerationSummary[]): string {
  const collapse = summaries
    .map((summary, index) => ({
      summary,
      decline: (summaries[index - 1]?.population ?? summary.population) - summary.population,
    }))
    .sort((first, second) => second.decline - first.decline)[0]?.summary;
  if (!collapse) return 'No generation summaries available.';
  const { lifeStages, deathCauses, reproduction, resources } = collapse;
  return [
    `Generation ${collapse.generation}:`,
    `Population: ${collapse.population}`,
    `Life stages: juvenile ${lifeStages.juvenile}, young adult ${lifeStages.youngAdult}, adult ${lifeStages.adult}, old ${lifeStages.old}`,
    `Births: ${collapse.births}`,
    `Deaths: ${collapse.deaths} (starvation ${deathCauses.starvation}, dehydration ${deathCauses.dehydration}, predation ${deathCauses.predation}, age ${deathCauses.age})`,
    `Juvenile deaths: ${collapse.juvenileDeaths}; average age at death: ${collapse.averageAgeAtDeath.toFixed(1)}`,
    `Reproduction: ${reproduction.conditionReadyPopulation} condition-ready, ${reproduction.localEligiblePairs} local pairs, ${reproduction.attempts} attempts, ${reproduction.births} births`,
    `Resources: food/agent ${resources.foodPerAgent.toFixed(1)}, water/agent ${resources.waterPerAgent.toFixed(1)}, nearest food ${resources.averageDistanceToFood.toFixed(1)} tiles, nearest water ${resources.averageDistanceToWater.toFixed(1)} tiles`,
    `Resource flow: ${resources.balance}; food ${resources.foodProduced.toFixed(1)} produced / ${resources.foodConsumed.toFixed(1)} consumed; water ${resources.waterProduced.toFixed(1)} produced / ${resources.waterConsumed.toFixed(1)} consumed`,
  ].join('\n');
}
