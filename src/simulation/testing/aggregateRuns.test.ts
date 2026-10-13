import type { LearningEvent } from '@/simulation/engine/types';
import { hasBehaviourDiscovery } from '@/simulation/testing/aggregateRuns';

const milestone = (
  type: LearningEvent['type'],
  behaviour: LearningEvent['behaviour'],
): LearningEvent => ({
  id: `${type}-${behaviour}`,
  tick: 12,
  generation: 2,
  type,
  behaviour,
});

describe('aggregate learning diagnostics', () => {
  it('uses retained cultural milestones for discoveries', () => {
    const result = {
      culturalMilestones: [
        milestone('behaviourDiscovered', 'stoneCracking'),
        milestone('behaviourRediscovered', 'stoneCracking'),
      ],
    };

    expect(hasBehaviourDiscovery(result)).toBe(true);
    expect(hasBehaviourDiscovery(result, 'stoneCracking')).toBe(true);
    expect(hasBehaviourDiscovery(result, 'socialForaging')).toBe(false);
  });

  it('does not classify observation or rediscovery as a first discovery', () => {
    const result = {
      culturalMilestones: [
        milestone('behaviourObserved', 'stoneCracking'),
        milestone('behaviourRediscovered', 'stoneCracking'),
      ],
    };

    expect(hasBehaviourDiscovery(result)).toBe(false);
  });
});
