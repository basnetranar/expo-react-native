import { lifeStageFor } from '@/simulation/agents/phenotype';
import { distance, regionFor } from '@/simulation/engine/math';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type {
  GenerationTelemetry,
  Hominin,
  LifeStageCounts,
  MigrationDiagnostics,
  Position,
  ReproductionDiagnostics,
  ResourceDiagnostics,
  ToolDiagnostics,
  World,
} from '@/simulation/engine/types';
import { canReproduce } from '@/simulation/evolution/reproduction';

export const createGenerationTelemetry = (): GenerationTelemetry => ({
  foodProduced: 0,
  foodConsumed: 0,
  waterProduced: 0,
  waterConsumed: 0,
  reproductionAttempts: 0,
  reproductionFailures: {
    energy: 0,
    hydration: 0,
    health: 0,
    cooldown: 0,
    partner: 0,
    capacity: 0,
  },
  parentAgeTotal: 0,
  reproducingParents: 0,
  eligibleToolOpportunities: 0,
  toolDiscoveries: 0,
  successfulToolUses: 0,
  toolCalories: 0,
  learningObservations: 0,
  learningAttempts: 0,
  learningAcquisitions: 0,
  learningTransmissions: 0,
  learningDemonstrations: 0,
});

export function lifeStageCounts(population: readonly Hominin[]): LifeStageCounts {
  const counts: LifeStageCounts = { juvenile: 0, youngAdult: 0, adult: 0, old: 0 };
  for (const agent of population) if (agent.alive) counts[agent.phenotype.lifeStage] += 1;
  return counts;
}

export function deathDiagnostics(deaths: readonly Hominin[]): {
  juvenileDeaths: number;
  adultDeaths: number;
  averageAgeAtDeath: number;
} {
  const juvenileDeaths = deaths.filter(
    (agent) => lifeStageFor(agent.death?.age ?? agent.age) === 'juvenile',
  ).length;
  return {
    juvenileDeaths,
    adultDeaths: deaths.length - juvenileDeaths,
    averageAgeAtDeath:
      deaths.reduce((sum, agent) => sum + (agent.death?.age ?? agent.age), 0) /
      Math.max(1, deaths.length),
  };
}

export function reproductionDiagnostics(
  population: readonly Hominin[],
  telemetry: GenerationTelemetry,
  config: SimulationConfig,
): ReproductionDiagnostics {
  const alive = population.filter((agent) => agent.alive);
  const reproductive = alive.filter(
    (agent) =>
      agent.age >= config.reproduction.minimumAge && agent.age <= config.reproduction.maximumAge,
  );
  const ready = reproductive.filter((agent) => canReproduce(agent, config));
  let pairs = 0;
  for (let first = 0; first < ready.length; first += 1) {
    for (let second = first + 1; second < ready.length; second += 1) {
      const a = ready[first]!;
      const b = ready[second]!;
      if (
        distance(a.position, b.position) <= config.reproduction.localPartnerRadius ||
        a.homeRegion === b.homeRegion
      )
        pairs += 1;
    }
  }
  return {
    attempts: telemetry.reproductionAttempts,
    births: telemetry.reproducingParents / 2,
    failures: { ...telemetry.reproductionFailures },
    reproductiveAgePopulation: reproductive.length,
    conditionReadyPopulation: ready.length,
    localEligiblePairs: pairs,
    meanParentAge: telemetry.parentAgeTotal / Math.max(1, telemetry.reproducingParents),
    meanOffspringPerReproductiveAdult:
      reproductive.reduce((sum, agent) => sum + agent.children.length, 0) /
      Math.max(1, reproductive.length),
  };
}

export function resourceDiagnostics(
  world: World,
  population: readonly Hominin[],
  telemetry: GenerationTelemetry,
): ResourceDiagnostics {
  const alive = population.filter((agent) => agent.alive);
  const foodTiles = resourcePositions(world, (index) => {
    const tile = world.tiles[index]!;
    return tile.food + tile.hardFood > 0.5;
  });
  const waterTiles = resourcePositions(world, (index) => world.tiles[index]!.water > 0.5);
  const totalFood = world.tiles.reduce((sum, tile) => sum + tile.food + tile.hardFood, 0);
  const totalWater = world.tiles.reduce((sum, tile) => sum + tile.water, 0);
  const balanceRatio = telemetry.foodProduced / Math.max(1, telemetry.foodConsumed);
  return {
    foodPerAgent: totalFood / Math.max(1, alive.length),
    waterPerAgent: totalWater / Math.max(1, alive.length),
    depletedFoodPatches: world.tiles.filter(
      (tile) => tile.foodCapacity + tile.hardFoodCapacity > 0 && tile.food + tile.hardFood < 1,
    ).length,
    depletedWaterSources: Math.ceil(
      world.tiles.filter((tile) => tile.baselineWaterCapacity > 0 && tile.water < 1).length / 9,
    ),
    averageDistanceToFood: averageNearestDistance(alive, foodTiles),
    averageDistanceToWater: averageNearestDistance(alive, waterTiles),
    foodProduced: telemetry.foodProduced,
    foodConsumed: telemetry.foodConsumed,
    waterProduced: telemetry.waterProduced,
    waterConsumed: telemetry.waterConsumed,
    balance: balanceRatio < 0.9 ? 'deficit' : balanceRatio > 1.1 ? 'surplus' : 'balanced',
  };
}

export function migrationDiagnostics(
  population: readonly Hominin[],
  startPositions: ReadonlyMap<string, Position>,
  previousCentroid?: Position,
): MigrationDiagnostics {
  const alive = population.filter((agent) => agent.alive);
  const centroid = {
    x: alive.reduce((sum, agent) => sum + agent.position.x, 0) / Math.max(1, alive.length),
    y: alive.reduce((sum, agent) => sum + agent.position.y, 0) / Math.max(1, alive.length),
  };
  const withStart = alive.filter((agent) => startPositions.has(agent.id));
  const changed = withStart.filter(
    (agent) => regionFor(startPositions.get(agent.id)!) !== regionFor(agent.position),
  ).length;
  const regionalOccupancy: Record<string, number> = {};
  for (const agent of alive)
    regionalOccupancy[regionFor(agent.position)] =
      (regionalOccupancy[regionFor(agent.position)] ?? 0) + 1;
  return {
    centroid,
    centroidShift: previousCentroid ? distance(previousCentroid, centroid) : 0,
    meanDisplacement:
      withStart.reduce(
        (sum, agent) => sum + distance(startPositions.get(agent.id)!, agent.position),
        0,
      ) / Math.max(1, withStart.length),
    changedRegionProportion: changed / Math.max(1, withStart.length),
    regionalOccupancy,
  };
}

export function toolDiagnostics(
  population: readonly Hominin[],
  telemetry: GenerationTelemetry,
): ToolDiagnostics {
  return {
    eligibleDiscoveryOpportunities: telemetry.eligibleToolOpportunities,
    discoveries: telemetry.toolDiscoveries,
    successfulUses: telemetry.successfulToolUses,
    caloriesFromToolUse: telemetry.toolCalories,
    users: population.filter(
      (agent) =>
        agent.alive && agent.learnedBehaviours.some((item) => item.type === 'stoneCracking'),
    ).length,
  };
}

function resourcePositions(world: World, predicate: (index: number) => boolean): Position[] {
  const result: Position[] = [];
  for (let index = 0; index < world.tiles.length; index += 1)
    if (predicate(index))
      result.push({ x: index % world.width, y: Math.floor(index / world.width) });
  return result;
}

function averageNearestDistance(
  population: readonly Hominin[],
  resources: readonly Position[],
): number {
  if (resources.length === 0) return Math.hypot(32, 32);
  return (
    population.reduce(
      (sum, agent) =>
        sum + Math.min(...resources.map((position) => distance(agent.position, position))),
      0,
    ) / Math.max(1, population.length)
  );
}
