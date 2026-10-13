import { LineageRegistry } from '@/simulation/lineage/LineageRegistry';
import { hominin } from '@/simulation/testing/fixtures';

describe('LineageRegistry', () => {
  it('retains compact founder, birth, and death records without mutable agent state', () => {
    const registry = new LineageRegistry();
    const founder = hominin('founder');
    const child = hominin('child');
    child.generation = 1;
    child.parents = ['founder', 'missing-parent'];
    registry.recordFounder(founder);
    registry.recordBirth(child, 40);
    child.death = {
      tick: 55,
      age: child.age,
      cause: 'starvation',
      generation: child.generation,
      position: { ...child.position },
      keyTraits: {
        speed: child.genome.speed,
        endurance: child.genome.endurance,
        metabolicEfficiency: child.genome.metabolicEfficiency,
        learningAbility: child.genome.learningAbility,
      },
    };
    child.alive = false;
    registry.recordDeath(child);

    const snapshot = registry.snapshot(55, 1);
    expect(snapshot.records).toEqual([
      expect.objectContaining({
        id: 'child',
        parentIds: ['founder', 'missing-parent'],
        birthTick: 40,
        deathTick: 55,
      }),
      expect.objectContaining({ id: 'founder', parentIds: [], birthTick: null }),
    ]);
    expect(snapshot.retention).toEqual({ policy: 'active-session-unbounded', recordsDiscarded: 0 });
    expect(snapshot.records[0]).not.toHaveProperty('memories');
    expect(snapshot.records[0]).not.toHaveProperty('relationships');
  });

  it('returns presentation-safe copies', () => {
    const registry = new LineageRegistry();
    registry.recordFounder(hominin('founder'));
    const first = registry.snapshot(0, 0);
    (first.records[0]!.parentIds as string[]).push('mutation');
    expect(registry.snapshot(0, 0).records[0]!.parentIds).toEqual([]);
  });
});
