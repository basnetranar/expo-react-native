import { adjustRelationship, relationshipWith } from '@/simulation/agents/relationships';
import { cooperativeForage, groom, shareFood } from '@/simulation/behaviour/actions/socialActions';
import { SeededRng } from '@/simulation/engine/seededRng';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import { SocialSystem } from '@/simulation/social/SocialSystem';
import { hominin } from '@/simulation/testing/fixtures';
import { createWorld } from '@/simulation/world/createWorld';

describe('social intelligence mechanics', () => {
  const config = createSimulationConfig({
    world: { width: 10, height: 10, foodPatches: 1, waterSources: 1, predatorCount: 0 },
  });

  it('initializes, updates, and bounds persistent relationships', () => {
    const first = hominin('a');
    const second = hominin('b');
    const relationship = relationshipWith(first, second, 4);
    expect(relationship).toMatchObject({ familiarity: 0, affinity: 0, interactionCount: 0 });
    adjustRelationship(relationship, { trust: 500, affinity: 500, familiarity: 500 });
    expect(relationship).toMatchObject({ trust: 100, affinity: 100, familiarity: 100 });
    adjustRelationship(relationship, { trust: -500, affinity: -500, familiarity: -500 });
    expect(relationship).toMatchObject({ trust: 0, affinity: -100, familiarity: 0 });
  });

  it('forms stable groups from repeated local encounters and dissolves after separation', () => {
    const first = hominin('a', 70);
    const second = hominin('b', 70);
    first.position = second.position = { x: 4, y: 4 };
    const world = createWorld(config, new SeededRng('groups'));
    const social = new SocialSystem(8);
    const events = [1, 5, 9, 13].flatMap((tick) => social.update([first, second], world, tick, 0));
    expect(events.some((event) => event.type === 'socialGroupFormed')).toBe(true);
    expect(social.getGroups()).toHaveLength(1);
    expect(new Set(social.getGroups()[0]!.memberIds).size).toBe(2);
    expect(first.groupId).toBe(second.groupId);

    second.position = { x: 9, y: 9 };
    const later = social.update([first, second], world, 27, 0);
    expect(later.some((event) => event.type === 'socialGroupDissolved')).toBe(true);
    expect(social.getGroups()).toEqual([]);
    expect(first.groupId).toBeNull();
    expect(second.groupId).toBeNull();
  });

  it('removes deceased members without leaving empty active groups', () => {
    const first = hominin('a', 70);
    const second = hominin('b', 70);
    first.position = second.position = { x: 4, y: 4 };
    const world = createWorld(config, new SeededRng('death-cleanup'));
    const social = new SocialSystem(8);
    for (const tick of [1, 5, 9, 13]) social.update([first, second], world, tick, 0);
    second.alive = false;
    social.update([first, second], world, 14, 0);
    expect(social.getGroups()).toHaveLength(0);
    expect(first.groupId).toBeNull();
  });

  it('resolves formation and joining in stable ID order', () => {
    const agents = [hominin('c', 70), hominin('a', 70), hominin('b', 70)];
    for (const agent of agents) agent.position = { x: 4, y: 4 };
    const world = createWorld(config, new SeededRng('stable-order'));
    const first = new SocialSystem(8);
    const second = new SocialSystem(8);
    const clones = agents.map((agent) => structuredClone(agent));
    for (const tick of [1, 5, 9, 13]) {
      first.update(agents, world, tick, 0);
      second.update([...clones].reverse(), world, tick, 0);
    }
    expect(first.getGroups()).toEqual(second.getGroups());
    expect(first.getGroups()[0]?.memberIds).toEqual(['a', 'b', 'c']);
  });

  it('conserves food during cooperative foraging and charges an energy cost', () => {
    const first = hominin('a');
    const second = hominin('b');
    first.needs.energy = second.needs.energy = 30;
    const world = createWorld(config, new SeededRng('cooperate'));
    first.position = second.position = { x: 2, y: 2 };
    const tile = world.tiles[2 * world.width + 2]!;
    tile.food = 10;
    tile.hardFood = 0;
    const before = first.needs.energy + second.needs.energy;
    const result = cooperativeForage(first, second, world);
    expect(result.foodConsumed).toBe(10);
    expect(tile.food).toBe(0);
    expect(first.needs.energy + second.needs.energy - before).toBeCloseTo(9.65);
  });

  it('transfers carried food without duplication and rejects invalid sharing', () => {
    const donor = hominin('donor');
    const recipient = hominin('recipient');
    donor.carriedFood = 5;
    donor.needs.energy = 80;
    recipient.needs.energy = 20;
    const totalBefore = donor.carriedFood + recipient.needs.energy;
    const result = shareFood(donor, recipient);
    expect(result.socialQuantity).toBe(4);
    expect(donor.carriedFood + recipient.needs.energy).toBe(totalBefore);
    recipient.position = { x: 9, y: 9 };
    expect(shareFood(donor, recipient).outcome).toBe(-1);
  });

  it('makes grooming cost energy without fabricating health benefits', () => {
    const first = hominin('a');
    const second = hominin('b');
    const health = first.health;
    const energy = first.needs.energy;
    expect(groom(first, second).outcome).toBe(1);
    expect(first.needs.energy).toBeLessThan(energy);
    expect(first.health).toBe(health);
  });
});
