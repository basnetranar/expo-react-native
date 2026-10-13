import { createHominin } from '@/simulation/agents/Hominin';
import { memoryCapacity, decayMemories, remember } from '@/simulation/agents/memory';
import { depleteNeeds } from '@/simulation/agents/needs';
import { perceive } from '@/simulation/agents/perception';
import { derivePhenotype } from '@/simulation/agents/phenotype';
import { eat } from '@/simulation/behaviour/actions/eat';
import { flee } from '@/simulation/behaviour/actions/flee';
import { createBehaviourContext } from '@/simulation/behaviour/behaviourContext';
import { chooseBehaviour, scoreBehaviours } from '@/simulation/behaviour/scoreBehaviours';
import { SeededRng } from '@/simulation/engine/seededRng';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import { traitNames } from '@/simulation/engine/types';
import { inheritGenome } from '@/simulation/evolution/inheritance';
import { canReproduce, reproducePopulation } from '@/simulation/evolution/reproduction';
import { classifyCulture } from '@/simulation/learning/cultureStats';
import { genome, hominin } from '@/simulation/testing/fixtures';
import { createWorld } from '@/simulation/world/createWorld';

describe('simulation systems', () => {
  const config = createSimulationConfig();

  it('clamps inherited traits and does not inherit learning', () => {
    const rng = new SeededRng('inheritance');
    const childGenome = inheritGenome(genome(100), genome(100), rng, {
      ...config,
      mutation: { scale: 20, tailChance: 1 },
    });
    expect(traitNames.every((trait) => childGenome[trait] >= 0 && childGenome[trait] <= 100)).toBe(
      true,
    );
    const first = hominin('first');
    const second = hominin('second');
    first.learnedBehaviours.push({
      type: 'stoneCracking',
      proficiency: 90,
      reinforcement: 10,
      firstLearnedAtTick: 1,
      acquisitionSource: 'experience',
      practiceCount: 10,
      successfulAttempts: 10,
      failedAttempts: 0,
      lastPracticedAtTick: 1,
    });
    first.position = second.position = { x: 2, y: 2 };
    const reproduction = reproducePopulation({
      population: [first, second],
      generation: 1,
      tick: 1,
      rng: new SeededRng('birth'),
      config: { ...config, reproduction: { ...config.reproduction, chancePerGeneration: 1 } },
      nextId: () => 'child',
      chance: 1,
    });
    expect(reproduction.births).toHaveLength(1);
    expect(reproduction.births[0]!.learnedBehaviours).toEqual([]);
    const repeated = reproducePopulation({
      population: [first, second],
      generation: 1,
      tick: 2,
      rng: new SeededRng('repeat-birth'),
      config,
      nextId: () => 'second-child',
      chance: 1,
    });
    expect(repeated.births).toHaveLength(0);
    expect(repeated.failures.cooldown).toBeGreaterThan(0);
  });

  it('bounds memory capacity and decays high-potential memory more slowly', () => {
    expect(memoryCapacity(10)).toBe(4);
    expect(memoryCapacity(50)).toBe(8);
    expect(memoryCapacity(90)).toBe(12);
    const low = hominin('low', 10);
    const high = hominin('high', 90);
    for (let index = 0; index < 20; index += 1)
      remember(
        low,
        { id: `m-${index}`, type: 'food', position: { x: index, y: 0 } },
        index,
        index + 10,
      );
    expect(low.memories).toHaveLength(4);
    remember(low, { id: 'decay', type: 'danger' }, 0, 50);
    remember(high, { id: 'decay', type: 'danger' }, 0, 50);
    decayMemories(low, 1);
    decayMemories(high, 1);
    expect(high.memories[0]!.strength).toBeGreaterThan(
      low.memories.find((item) => item.id === 'decay')?.strength ?? 0,
    );
  });

  it('applies activity and cognitive metabolic costs without changing genomes', () => {
    const agent = hominin();
    const originalGenome = agent.genome;
    const initialEnergy = agent.needs.energy;
    depleteNeeds(agent, 'flee', config);
    expect(agent.needs.energy).toBeLessThan(initialEnergy);
    expect(agent.genome).toBe(originalGenome);
  });

  it('derives perception range from vision and restricts perception locally', () => {
    expect(derivePhenotype(genome(0), 24, 100).visionRange).toBe(2);
    expect(derivePhenotype(genome(100), 24, 100).visionRange).toBe(7);
    const rng = new SeededRng('perception');
    const world = createWorld(
      { ...config, world: { ...config.world, foodPatches: 0, waterSources: 0 } },
      rng,
    );
    world.tiles.forEach((tile) => {
      tile.food = 0;
      tile.water = 0;
    });
    world.tiles[2 * world.width + 4]!.food = 50;
    const agent = hominin();
    agent.position = { x: 2, y: 2 };
    const perception = perceive(agent, world, [agent], []);
    expect(perception.food).toEqual({ x: 4, y: 2 });
    world.tiles[2 * world.width + 4]!.food = 0;
    world.tiles[2 * world.width + 12]!.food = 50;
    expect(perceive(agent, world, [agent], []).food).toBeUndefined();
  });

  it('scores urgent thirst above exploration when water is visible', () => {
    const agent = hominin();
    agent.needs.hydration = 2;
    const perception = { water: { ...agent.position }, hominins: [], danger: 0 };
    const scores = scoreBehaviours(
      agent,
      createBehaviourContext(agent, perception),
      new SeededRng('scores'),
      { ...config, decision: { ...config.decision, noiseFraction: 0 } },
    );
    expect(chooseBehaviour(scores)).toBe('drink');
  });

  it('lets juveniles prefer nearby adults without global following', () => {
    const juvenile = createHominin({
      id: 'juvenile',
      generation: 1,
      position: { x: 2, y: 2 },
      genome: genome(),
      age: 8,
    });
    const adult = hominin('adult');
    adult.position = { x: 3, y: 2 };
    const world = createWorld(config, new SeededRng('juvenile-follow'));
    expect(
      createBehaviourContext(juvenile, perceive(juvenile, world, [juvenile, adult], []))
        .followTarget?.id,
    ).toBe('adult');
    adult.position = { x: 20, y: 20 };
    expect(
      createBehaviourContext(juvenile, perceive(juvenile, world, [juvenile, adult], []))
        .followTarget,
    ).toBeUndefined();
  });

  it('makes stone cracking provide calories from otherwise inaccessible hard food', () => {
    const agent = hominin('tool-user');
    agent.needs.energy = 20;
    agent.learnedBehaviours.push({
      type: 'stoneCracking',
      proficiency: 50,
      reinforcement: 1,
      firstLearnedAtTick: 1,
      acquisitionSource: 'experience',
      practiceCount: 1,
      successfulAttempts: 1,
      failedAttempts: 0,
      lastPracticedAtTick: 1,
    });
    const world = createWorld(config, new SeededRng('tool-food'));
    const tile = world.tiles[agent.position.y * world.width + agent.position.x]!;
    tile.food = 0;
    tile.hardFood = 10;
    const result = eat(agent, world);
    expect(result.hardFoodConsumed).toBe(10);
    expect(result.toolCalories).toBeGreaterThan(10);
    expect(agent.needs.energy).toBeGreaterThan(20);
  });

  it('escapes when a predator occupies the same tile', () => {
    const agent = hominin();
    agent.position = { x: 0, y: 0 };
    const world = createWorld(config, new SeededRng('flee'));
    const result = flee(agent, world, { x: 0, y: 0 });
    expect(result.position).not.toEqual(agent.position);
    expect(result.position.x).toBeGreaterThanOrEqual(0);
    expect(result.position.y).toBeGreaterThanOrEqual(0);
  });

  it('enforces reproduction condition thresholds', () => {
    const agent = hominin();
    expect(canReproduce(agent, config)).toBe(true);
    agent.needs.energy = config.reproduction.energy - 1;
    expect(canReproduce(agent, config)).toBe(false);
  });

  it('classifies culture from population prevalence', () => {
    expect(classifyCulture(0, 50)).toBe('absent');
    expect(classifyCulture(1, 50)).toBe('innovation');
    expect(classifyCulture(3, 50)).toBe('observed');
    expect(classifyCulture(8, 50)).toBe('spreading');
    expect(classifyCulture(15, 50)).toBe('cultural');
    expect(classifyCulture(25, 50)).toBe('established');
  });
});
