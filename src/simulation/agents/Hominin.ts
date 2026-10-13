import { createRandomGenome } from '@/simulation/agents/genome';
import { derivePhenotype } from '@/simulation/agents/phenotype';
import { regionFor } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Genome, Hominin, Position, World } from '@/simulation/engine/types';

export function createHominin(options: {
  id: string;
  generation: number;
  position: Position;
  genome: Genome;
  age: number;
  parents?: readonly string[];
}): Hominin {
  const phenotype = derivePhenotype(options.genome, options.age, 100);
  const region = regionFor(options.position);
  return {
    id: options.id,
    generation: options.generation,
    position: { ...options.position },
    genome: options.genome,
    phenotype,
    needs: { energy: 78, hydration: 82, safety: 72 },
    memories: [],
    relationships: [],
    learnedBehaviours: [],
    actionPreferences: {},
    age: options.age,
    health: 100,
    parents: options.parents ?? [],
    children: [],
    currentBehaviour: 'explore',
    alive: true,
    zeroEnergyTicks: 0,
    zeroHydrationTicks: 0,
    homeRegion: region,
    previousHomeRegion: region,
    relocationTicks: 0,
    lastBirthTick: null,
    demonstratedBehaviour: null,
    demonstrableSuccess: 0,
    carriedFood: 0,
    groupId: null,
    learningOpportunities: [],
  };
}

export function createStartingPopulation(
  config: SimulationConfig,
  rng: SeededRng,
  world?: World,
): Hominin[] {
  const habitable = world?.tiles
    .map((tile, index) => ({ tile, index }))
    .filter(({ tile }) => tile.waterCapacity > 0);
  return Array.from({ length: config.population.initial }, (_, index) => {
    const genome = createRandomGenome(
      rng,
      config.population.traitMean,
      config.population.traitStandardDeviation,
    );
    const spawn = habitable?.length ? rng.pick(habitable).index : null;
    return createHominin({
      id: `g0-${index}`,
      generation: 0,
      genome,
      age: rng.integer(6, 38),
      position:
        spawn === null
          ? {
              x: rng.integer(0, config.world.width - 1),
              y: rng.integer(0, config.world.height - 1),
            }
          : { x: spawn % config.world.width, y: Math.floor(spawn / config.world.width) },
    });
  });
}
