import { SeededRng } from '@/simulation/engine/seededRng';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import { CulturalHistory } from '@/simulation/learning/CulturalHistory';
import { attemptStoneDiscovery } from '@/simulation/learning/discoverySystem';
import { imitateNearby } from '@/simulation/learning/imitationSystem';
import { hominin } from '@/simulation/testing/fixtures';
import { createWorld } from '@/simulation/world/createWorld';

describe('learning and cultural transmission', () => {
  it('requires real stone and hard-food opportunities for discovery', () => {
    const config = createSimulationConfig({
      seed: 'DISCOVERY-REQUIREMENTS',
      discovery: {
        stoneBaseChance: 1,
        minimumEnergy: 0,
        minimumSafety: 0,
        minimumDexterity: 0,
        minimumCuriosity: 0,
        minimumLearning: 0,
      },
    });
    const rng = new SeededRng(config.seed);
    const world = createWorld(config, rng);
    const agent = hominin('discoverer', 100);
    const tile = world.tiles[agent.position.y * world.width + agent.position.x]!;
    tile.objects = [];
    tile.hardFood = 4;
    expect(attemptStoneDiscovery(agent, world, 1, rng, config)).toEqual({
      eligible: false,
      discovered: false,
    });
    tile.objects = ['stone'];
    expect(attemptStoneDiscovery(agent, world, 2, rng, config).discovered).toBe(true);
    expect(agent.learnedBehaviours[0]).toMatchObject({
      acquisitionSource: 'experimentation',
      practiceCount: 1,
    });
  });

  it('records observation without automatic mastery when resources are absent', () => {
    const config = createSimulationConfig({ seed: 'OBSERVE-NO-RESOURCE' });
    const world = createWorld(config, new SeededRng(config.seed));
    const observer = hominin('observer', 100);
    const demonstrator = hominin('demonstrator', 100);
    observer.currentBehaviour = 'observe';
    demonstrator.demonstratedBehaviour = 'stoneCracking';
    demonstrator.demonstrableSuccess = 100;
    demonstrator.learnedBehaviours.push(learned('stoneCracking'));
    const tile = world.tiles[observer.position.y * world.width + observer.position.x]!;
    tile.objects = [];
    tile.hardFood = 0;
    const interactions = imitateNearby(
      [observer, demonstrator],
      (agent) => (agent.id === observer.id ? [demonstrator] : [observer]),
      world,
      new SeededRng('OBSERVE-NO-RESOURCE'),
      10,
      config,
    );
    expect(interactions[0]).toMatchObject({ observed: true, attempted: false, acquired: false });
    expect(observer.learningOpportunities).toHaveLength(1);
    expect(observer.learnedBehaviours).toHaveLength(0);
  });

  it('recognizes a real trusted demonstration without guaranteeing acquisition', () => {
    const config = createSimulationConfig({ seed: 'TEACHING-EVIDENCE' });
    const world = createWorld(config, new SeededRng(config.seed));
    const learner = hominin('learner', 100);
    const teacher = hominin('teacher', 100);
    learner.currentBehaviour = 'observe';
    learner.groupId = teacher.groupId = 'group-test';
    learner.relationships.push({
      agentId: teacher.id,
      familiarity: 30,
      trust: 30,
      affinity: 20,
      kinship: 0,
      observedSuccess: 40,
      followBenefits: 0,
      interactionCount: 10,
      firstInteractionTick: 1,
      lastInteractionTick: 8,
      cooperationCount: 1,
      sharingCount: 0,
      groomingCount: 0,
    });
    teacher.demonstratedBehaviour = 'socialForaging';
    teacher.demonstrableSuccess = 80;
    teacher.learnedBehaviours.push(learned('socialForaging'));
    const tile = world.tiles[learner.position.y * world.width + learner.position.x]!;
    tile.food = 5;
    const interaction = imitateNearby(
      [learner, teacher],
      () => [teacher],
      world,
      new SeededRng('TEACHING-EVIDENCE'),
      12,
      config,
    )[0]!;
    expect(interaction).toMatchObject({
      observed: true,
      demonstrated: true,
      source: 'teaching',
    });
  });

  it('preserves discovery, loss, and rediscovery as durable milestones', () => {
    const history = new CulturalHistory();
    const first = hominin('first');
    first.learnedBehaviours.push(learned('stoneCracking'));
    history.recordDiscovery('stoneCracking', first.id, 2, 0);
    first.alive = false;
    expect(history.reconcile([first], 5, 0)[0]?.type).toBe('behaviourLost');
    const second = hominin('second');
    second.learnedBehaviours.push(learned('stoneCracking'));
    expect(history.recordDiscovery('stoneCracking', second.id, 8, 1)[0]?.type).toBe(
      'behaviourRediscovered',
    );
    const snapshot = history.snapshot([second], [], 8, 1);
    expect(snapshot.milestones.map((event) => event.type)).toEqual([
      'behaviourDiscovered',
      'behaviourLost',
      'behaviourRediscovered',
    ]);
  });

  it('round-trips cultural history without shared mutable branch state', () => {
    const original = new CulturalHistory();
    original.recordDiscovery('socialForaging', 'g0-1', 4, 0);
    const state = original.exportState();
    const branch = new CulturalHistory();
    branch.restoreState(state);
    branch.reconcile([], 9, 1);
    expect(original.exportState().milestones).toHaveLength(1);
    expect(branch.exportState().milestones).toHaveLength(2);
  });
});

function learned(type: 'stoneCracking' | 'socialForaging') {
  return {
    type,
    proficiency: 60,
    reinforcement: 4,
    firstLearnedAtTick: 1,
    acquisitionSource: 'experience' as const,
    practiceCount: 4,
    successfulAttempts: 4,
    failedAttempts: 0,
    lastPracticedAtTick: 4,
  };
}
