import { createStartingPopulation } from '@/simulation/agents/Hominin';
import { SeededRng } from '@/simulation/engine/seededRng';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import { updatePredators } from '@/simulation/predators/predatorSystem';
import { createWorld } from '@/simulation/world/createWorld';
import { regenerateResources } from '@/simulation/world/resourceSystem';

describe('environment intervention mechanics', () => {
  it('scales actual food and water production without rewriting capacities', () => {
    const config = createSimulationConfig({ seed: 'resource-intervention-mechanics' });
    const baseline = createWorld(config, new SeededRng(config.seed));
    const modified = createWorld(config, new SeededRng(config.seed));
    for (const world of [baseline, modified]) {
      for (const tile of world.tiles) {
        tile.food = 0;
        tile.hardFood = 0;
        tile.water = 0;
      }
    }
    const capacities = modified.tiles.map((tile) => [
      tile.foodCapacity,
      tile.hardFoodCapacity,
      tile.waterCapacity,
    ]);
    modified.interventionFoodMultiplier = 0.5;
    modified.interventionWaterMultiplier = 1.5;
    const baselineProduced = regenerateResources(baseline);
    const modifiedProduced = regenerateResources(modified);
    expect(modifiedProduced.food).toBeCloseTo(baselineProduced.food * 0.5);
    expect(modifiedProduced.water).toBeCloseTo(baselineProduced.water * 1.5);
    expect(
      modified.tiles.map((tile) => [tile.foodCapacity, tile.hardFoodCapacity, tile.waterCapacity]),
    ).toEqual(capacities);
  });

  it('scales the real predator attack probability without changing predator count', () => {
    const config = createSimulationConfig({ seed: 'predator-intervention-mechanics' });
    const rng = new SeededRng(config.seed);
    const world = createWorld(config, rng);
    const [target] = createStartingPopulation(config, rng, world);
    const predator = {
      id: 'test-predator',
      position: { ...target!.position },
      state: 'chase' as const,
      targetId: target!.id,
      stamina: 100,
      restTicks: 0,
    };
    const probabilities: number[] = [];
    jest.spyOn(rng, 'chance').mockImplementation((probability) => {
      probabilities.push(probability);
      return false;
    });
    world.predatorPressureMultiplier = 1.5;
    updatePredators([predator], [target!], world, rng);
    const attackProbability = probabilities.at(-1)!;
    const baseAttack =
      0.32 -
      (target!.phenotype.speed * 0.004 +
        target!.phenotype.endurance * 0.002 +
        world.tiles[target!.position.y * world.width + target!.position.x]!.cover * 0.002 +
        target!.phenotype.vision * 0.0015);
    expect(attackProbability).toBeCloseTo(Math.max(0.005, Math.min(0.24, baseAttack * 1.5)));
    expect(config.world.predatorCount).toBeGreaterThan(0);
  });
});
