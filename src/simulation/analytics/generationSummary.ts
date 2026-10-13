import {
  deathDiagnostics,
  lifeStageCounts,
  migrationDiagnostics,
  reproductionDiagnostics,
  resourceDiagnostics,
  toolDiagnostics,
} from '@/simulation/analytics/generationDiagnostics';
import {
  averageGenome,
  averagePhenotype,
  summarizeEnvironment,
} from '@/simulation/analytics/populationStats';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type {
  BehaviourPrevalence,
  DeathCause,
  GenerationSummary,
  Hominin,
  GenerationTelemetry,
  Position,
  World,
} from '@/simulation/engine/types';
import { behaviourPrevalence } from '@/simulation/learning/cultureStats';

export function createGenerationSummary(options: {
  generation: number;
  population: readonly Hominin[];
  births: number;
  deaths: readonly Hominin[];
  world: World;
  predatorCount: number;
  telemetry: GenerationTelemetry;
  config: SimulationConfig;
  generationStartPositions: ReadonlyMap<string, Position>;
  previousCentroid?: Position;
}): GenerationSummary {
  const alive = options.population.filter((agent) => agent.alive);
  const deathCauses: Record<DeathCause, number> = {
    starvation: 0,
    dehydration: 0,
    predation: 0,
    age: 0,
  };
  for (const agent of options.deaths) if (agent.death) deathCauses[agent.death.cause] += 1;
  const behaviour: BehaviourPrevalence = {
    stoneCracking: behaviourPrevalence(alive, 'stoneCracking'),
    socialForaging: behaviourPrevalence(alive, 'socialForaging'),
  };
  const relocated = alive.filter(
    (agent) => agent.homeRegion !== agent.previousHomeRegion && agent.relocationTicks >= 4,
  ).length;
  const migration = migrationDiagnostics(
    alive,
    options.generationStartPositions,
    options.previousCentroid,
  );
  return {
    generation: options.generation,
    population: alive.length,
    births: options.births,
    deaths: options.deaths.length,
    deathCauses,
    averageGenome: averageGenome(alive),
    averagePhenotype: averagePhenotype(alive),
    behaviourPrevalence: behaviour,
    environment: summarizeEnvironment(options.world, options.predatorCount),
    averageAge: alive.reduce((sum, agent) => sum + agent.age, 0) / Math.max(1, alive.length),
    migrationRate: relocated / Math.max(1, alive.length),
    lifeStages: lifeStageCounts(alive),
    ...deathDiagnostics(options.deaths),
    reproduction: reproductionDiagnostics(alive, options.telemetry, options.config),
    resources: resourceDiagnostics(options.world, alive, options.telemetry),
    tools: toolDiagnostics(alive, options.telemetry),
    migration,
  };
}
