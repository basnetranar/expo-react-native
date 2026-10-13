import { remember } from '@/simulation/agents/memory';
import type { Perception } from '@/simulation/agents/perception';
import { drink } from '@/simulation/behaviour/actions/drink';
import { eat } from '@/simulation/behaviour/actions/eat';
import { explore } from '@/simulation/behaviour/actions/explore';
import { flee } from '@/simulation/behaviour/actions/flee';
import { follow } from '@/simulation/behaviour/actions/follow';
import { moveToFoodMemory } from '@/simulation/behaviour/actions/moveToFoodMemory';
import { moveToWaterMemory } from '@/simulation/behaviour/actions/moveToWaterMemory';
import { observe } from '@/simulation/behaviour/actions/observe';
import { rest } from '@/simulation/behaviour/actions/rest';
import { cooperativeForage, groom, shareFood } from '@/simulation/behaviour/actions/socialActions';
import { createBehaviourContext } from '@/simulation/behaviour/behaviourContext';
import type { ActionResult, BehaviourDecision } from '@/simulation/behaviour/behaviourTypes';
import { chooseBehaviour, scoreBehaviours } from '@/simulation/behaviour/scoreBehaviours';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Hominin, World } from '@/simulation/engine/types';

export class BehaviourEngine {
  constructor(
    private readonly config: SimulationConfig,
    private readonly rng: SeededRng,
  ) {}

  act(agent: Hominin, perception: Perception, world: World, tick: number): BehaviourDecision {
    this.recordPerception(agent, perception, tick);
    const context = createBehaviourContext(agent, perception);
    const scores = scoreBehaviours(agent, context, this.rng, this.config);
    const behaviour = chooseBehaviour(scores);
    agent.currentBehaviour = behaviour;
    let result: ActionResult;
    switch (behaviour) {
      case 'eat':
        result = eat(agent, world);
        break;
      case 'drink':
        result = drink(agent, world);
        break;
      case 'moveToFoodMemory':
        result = moveToFoodMemory(
          agent,
          world,
          perception.food ?? context.foodMemory ?? agent.position,
        );
        break;
      case 'moveToWaterMemory':
        result = moveToWaterMemory(
          agent,
          world,
          perception.water ?? context.waterMemory ?? agent.position,
        );
        break;
      case 'flee':
        result = perception.predator
          ? flee(agent, world, perception.predator.position)
          : explore(agent, world, this.rng);
        break;
      case 'follow':
        result = context.followTarget
          ? follow(agent, context.followTarget, world)
          : explore(agent, world, this.rng);
        break;
      case 'observe':
        result = observe(agent);
        break;
      case 'cooperativeForage':
        result = context.socialTarget
          ? cooperativeForage(agent, context.socialTarget, world)
          : explore(agent, world, this.rng);
        break;
      case 'shareFood':
        result = context.socialTarget
          ? shareFood(agent, context.socialTarget)
          : explore(agent, world, this.rng);
        break;
      case 'groom':
        result = context.socialTarget ? groom(agent, context.socialTarget) : rest(agent);
        break;
      case 'rest':
        result = rest(agent);
        break;
      case 'explore':
        result = explore(agent, world, this.rng);
        break;
    }
    agent.position = result.position;
    return { ...result, scores };
  }

  private recordPerception(agent: Hominin, perception: Perception, tick: number): void {
    if (perception.food)
      remember(
        agent,
        {
          id: `food-${perception.food.x}-${perception.food.y}`,
          type: 'food',
          position: perception.food,
        },
        tick,
      );
    if (perception.water)
      remember(
        agent,
        {
          id: `water-${perception.water.x}-${perception.water.y}`,
          type: 'water',
          position: perception.water,
        },
        tick,
      );
    if (perception.stone)
      remember(
        agent,
        {
          id: `stone-${perception.stone.x}-${perception.stone.y}`,
          type: 'stone',
          position: perception.stone,
        },
        tick,
        55,
      );
    if (perception.predator)
      remember(
        agent,
        {
          id: `predator-${perception.predator.id}`,
          type: 'predator',
          position: perception.predator.position,
        },
        tick,
        90,
      );
  }
}
