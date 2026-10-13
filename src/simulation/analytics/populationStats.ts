import type {
  EnvironmentSummary,
  GenomeSummary,
  Hominin,
  PhenotypeSummary,
  World,
} from '@/simulation/engine/types';
import { traitNames } from '@/simulation/engine/types';
import { totalResources } from '@/simulation/world/World';

export function averageGenome(population: readonly Hominin[]): GenomeSummary {
  const alive = population.filter((agent) => agent.alive);
  const result = {} as GenomeSummary;
  for (const trait of traitNames)
    result[trait] =
      alive.reduce((sum, agent) => sum + agent.genome[trait], 0) / Math.max(1, alive.length);
  return result;
}

export function averagePhenotype(population: readonly Hominin[]): PhenotypeSummary {
  const alive = population.filter((agent) => agent.alive);
  const result = {} as PhenotypeSummary;
  for (const trait of traitNames)
    result[trait] =
      alive.reduce((sum, agent) => sum + agent.phenotype[trait], 0) / Math.max(1, alive.length);
  result.visionRange =
    alive.reduce((sum, agent) => sum + agent.phenotype.visionRange, 0) / Math.max(1, alive.length);
  result.cognitiveCost =
    alive.reduce((sum, agent) => sum + agent.phenotype.cognitiveCost, 0) /
    Math.max(1, alive.length);
  return result;
}

export function summarizeEnvironment(world: World, predatorCount: number): EnvironmentSummary {
  const resources = totalResources(world);
  return { ...resources, predatorCount, resourcePressure: world.resourcePressure };
}
