import { createLearningOverview } from '@/features/learning/utils/learning-presentation';
import { CulturalHistory } from '@/simulation/learning/CulturalHistory';
import { hominin } from '@/simulation/testing/fixtures';

describe('learning presentation', () => {
  it('hides unsupported and undiscovered behaviours while presenting deterministic identity', () => {
    const person = hominin('g2-7');
    person.generation = 2;
    person.learnedBehaviours.push({
      type: 'socialForaging',
      proficiency: 41.2,
      reinforcement: 3,
      firstLearnedAtTick: 12,
      acquisitionSource: 'imitation',
      learnedFrom: 'g1-2',
      practiceCount: 3,
      successfulAttempts: 2,
      failedAttempts: 1,
      lastPracticedAtTick: 19,
    });
    const history = new CulturalHistory();
    history.recordDiscovery('socialForaging', person.id, 12, 2);
    const view = createLearningOverview(history.snapshot([person], [], 20, 2));
    expect(view.behaviours).toHaveLength(2);
    expect(view.behaviours.filter((item) => item.historicallyDiscovered)).toHaveLength(1);
    expect(view.behaviours[1]!.practitioners[0]).toMatchObject({
      id: 'g2-7',
      proficiency: 41,
      acquisitionSource: 'imitation',
    });
  });

  it('handles extinct populations and historical loss without fabricated adoption', () => {
    const history = new CulturalHistory();
    history.recordDiscovery('stoneCracking', 'g0-0', 2, 0);
    history.reconcile([], 4, 0);
    const view = createLearningOverview(history.snapshot([], [], 4, 0));
    const stone = view.behaviours.find((item) => item.id === 'stoneCracking')!;
    expect(stone.status).toBe('lost');
    expect(stone.adoptionPercent).toBe(0);
    expect(view.population).toBe(0);
  });
});
