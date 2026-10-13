import {
  createSocialOverview,
  groupLabel,
  relationshipCategory,
} from '@/features/social/utils/social-presentation';
import { SimulationEngine } from '@/simulation';

describe('social presentation', () => {
  it('uses deterministic labels and relationship thresholds', () => {
    expect(groupLabel('group-12')).toBe('Group 12');
    expect(relationshipCategory(11)).toBe('positive');
    expect(relationshipCategory(10)).toBe('neutral');
    expect(relationshipCategory(-11)).toBe('negative');
  });

  it('projects only real engine groups, people, events, and metrics', () => {
    const engine = new SimulationEngine({
      seed: 'social-view',
      population: { initial: 2, maximum: 2, traitMean: 70, traitStandardDeviation: 0 },
    });
    const view = createSocialOverview(engine.getSocialSnapshot());
    expect(view.population).toBe(2);
    expect(view.groups).toEqual([]);
    expect(view.recentActivity).toEqual([]);
    expect(view.metrics.activeGroups).toBe(0);
  });
});
