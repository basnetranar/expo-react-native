import { helpTopics } from '@/features/help/data/help-topics';

describe('contextual guidance', () => {
  it('covers every required concept with deterministic offline text', () => {
    expect(Object.keys(helpTopics)).toEqual(
      expect.arrayContaining([
        'generation',
        'population',
        'inheritedTraits',
        'learnedBehaviours',
        'culturalTransmission',
        'environmentalPressure',
        'mutation',
        'naturalSelection',
        'checkpoints',
        'branches',
      ]),
    );
    expect(helpTopics.inheritedTraits.body).toContain('do not rewrite inherited traits');
    expect(helpTopics.branches.body).toContain('not predetermined');
  });
});
