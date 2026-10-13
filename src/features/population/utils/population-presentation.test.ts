import type { PopulationFilterState } from '@/features/population/types';
import {
  createPopulationOverviewSnapshot,
  filterAndSortIndividuals,
} from '@/features/population/utils/population-presentation';
import type {
  Genome,
  PopulationAgentSnapshot,
  PopulationDataSnapshot,
  TraitName,
} from '@/simulation';
import { traitNames } from '@/simulation/engine/types';

const filters: PopulationFilterState = {
  search: '',
  lifeStage: 'all',
  generation: 'all',
  learnedBehaviour: 'all',
  selectedTrait: 'memoryPotential',
  sort: 'age-desc',
};

function genome(value: number): Genome {
  return Object.fromEntries(traitNames.map((trait) => [trait, value])) as unknown as Genome;
}

function agent(
  id: string,
  value: number,
  overrides: Partial<PopulationAgentSnapshot> = {},
): PopulationAgentSnapshot {
  return {
    id,
    generation: 2,
    position: { x: 0, y: 0 },
    age: 24,
    health: 80,
    needs: { energy: 70, hydration: 60, safety: 50 },
    genome: genome(value),
    phenotype: {
      ...genome(value),
      lifeStage: 'adult',
      visionRange: 4,
      cognitiveCost: 0.5,
    },
    currentBehaviour: 'explore',
    learnedBehaviours: [],
    ...overrides,
  };
}

function source(living: readonly PopulationAgentSnapshot[]): PopulationDataSnapshot {
  return {
    currentTick: 20,
    currentGeneration: 3,
    currentPopulation: living.length,
    birthsThisGeneration: 2,
    deathsThisGeneration: 1,
    living,
    summaries: [],
    events: [],
    retention: {
      generationLimit: 200,
      eventLimit: 1000,
      generationsDiscarded: 0,
      eventsDiscarded: 0,
    },
  };
}

function present(living: readonly PopulationAgentSnapshot[]) {
  return createPopulationOverviewSnapshot(source(living), {
    scenario: 'stableSavannah',
    status: living.length ? 'running' : 'extinct',
    peakPopulation: living.length,
  });
}

describe('population presentation', () => {
  it('aggregates living summary, current-generation births/deaths, age, and condition', () => {
    const model = present([
      agent('a', 40, { age: 10, health: 60 }),
      agent('b', 60, { age: 30, health: 100 }),
    ]);
    expect(model).toMatchObject({
      living: 2,
      birthsThisGeneration: 2,
      deathsThisGeneration: 1,
      averageAge: 20,
      averageHealth: 80,
    });
  });

  it('uses engine life stages and zero-safe percentages', () => {
    const model = present([
      agent('juvenile', 50, { phenotype: { ...agent('x', 50).phenotype, lifeStage: 'juvenile' } }),
      agent('adult', 50),
    ]);
    expect(model.lifeStages.find((item) => item.stage === 'juvenile')).toMatchObject({
      count: 1,
      proportion: 0.5,
    });
    const empty = present([]);
    expect(empty.lifeStages.every((item) => item.count === 0 && item.proportion === 0)).toBe(true);
    expect(empty.averageHealth).toBeNull();
    expect(empty.diversity.index).toBeNull();
  });

  it('calculates trait means, bounds, standard deviation, and bounded variation index', () => {
    const model = present([agent('low', 0), agent('high', 100)]);
    expect(model.traits).toHaveLength(10);
    expect(model.traits.find((item) => item.trait === 'strength')).toMatchObject({
      average: 50,
      minimum: 0,
      maximum: 100,
      standardDeviation: 50,
    });
    expect(model.diversity.index).toBe(100);
    expect(present([agent('one', 50)]).diversity.index).toBeNull();
  });

  it('counts durable learned records independently from inherited traits', () => {
    const learner = agent('learner', 1, {
      learnedBehaviours: [
        {
          type: 'stoneCracking',
          proficiency: 30,
          reinforcement: 1,
          firstLearnedAtTick: 4,
          acquisitionSource: 'experience',
          practiceCount: 1,
          successfulAttempts: 1,
          failedAttempts: 0,
          lastPracticedAtTick: 4,
        },
      ],
    });
    const gifted = agent('gifted', 100);
    const model = present([learner, gifted]);
    expect(model.culturalAdoption.find((item) => item.behaviour === 'stoneCracking')).toMatchObject(
      {
        count: 1,
        proportion: 0.5,
      },
    );
    expect(model.individuals.find((item) => item.id === 'gifted')?.learnedBehaviours).toEqual([]);
  });

  it('searches names and stable IDs, filters, and uses ID as a stable tie-breaker', () => {
    const model = present([
      agent('stable-z', 50, { age: 20, generation: 1 }),
      agent('stable-a', 50, { age: 20, generation: 2 }),
    ]);
    expect(
      filterAndSortIndividuals(model.individuals, { ...filters, search: 'STABLE-A' }).map(
        (item) => item.id,
      ),
    ).toEqual(['stable-a']);
    expect(filterAndSortIndividuals(model.individuals, filters).map((item) => item.id)).toEqual([
      'stable-a',
      'stable-z',
    ]);
    expect(
      filterAndSortIndividuals(model.individuals, { ...filters, generation: 1 }).map(
        (item) => item.id,
      ),
    ).toEqual(['stable-z']);
  });

  it.each([0, 1, 50, 150, 500])('handles %i presentation rows deterministically', (count) => {
    const living = Array.from({ length: count }, (_, index) =>
      agent(`fixture-${index.toString().padStart(3, '0')}`, index % 101, {
        age: index % 60,
        generation: index % 12,
      }),
    );
    const first = present(living);
    const second = present(living);
    expect(first.individuals).toHaveLength(count);
    expect(first).toEqual(second);
    expect(
      filterAndSortIndividuals(first.individuals, {
        ...filters,
        sort: 'trait-desc',
        selectedTrait: 'curiosity' as TraitName,
      }),
    ).toHaveLength(count);
  });
});
