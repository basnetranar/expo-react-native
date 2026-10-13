import {
  createHomininInspectorViewModel,
  formatTraitValue,
} from '@/features/hominin/utils/hominin-presentation';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import type { Genome, Hominin } from '@/simulation';
import { createHominin } from '@/simulation/agents/Hominin';
import { markDead } from '@/simulation/agents/lifecycle';
import { snapshotAgentInspector } from '@/simulation/engine/snapshots';

const genome: Genome = {
  strength: 61.4,
  speed: 52.6,
  endurance: 73.2,
  dexterity: 66.8,
  vision: 58.9,
  metabolicEfficiency: 71.1,
  memoryPotential: 77.7,
  learningAbility: 82.2,
  socialSensitivity: 69.5,
  curiosity: 88.4,
};

function individual(id = 'g1-inspected'): Hominin {
  return createHominin({
    id,
    generation: 1,
    position: { x: 2, y: 3 },
    genome,
    age: 18,
    parents: ['g0-parent-a', 'g0-parent-b'],
  });
}

describe('hominin inspector presentation', () => {
  it('maps stable identity and all ten inherited traits deterministically', () => {
    const agent = individual();
    const first = createHomininInspectorViewModel(snapshotAgentInspector(agent), () => null);
    const second = createHomininInspectorViewModel(snapshotAgentInspector(agent), () => null);
    expect(first.name).toBe(getFriendlyName(agent.id));
    expect(second.name).toBe(first.name);
    expect(first.traits).toHaveLength(10);
    expect(first.traits.map((trait) => trait.label)).toEqual(
      expect.arrayContaining([
        'Strength',
        'Dexterity',
        'Metabolic efficiency',
        'Memory potential',
        'Social sensitivity',
      ]),
    );
  });

  it('formats trait values without exposing out-of-range presentation values', () => {
    expect(formatTraitValue(61.4)).toBe(61);
    expect(formatTraitValue(-4)).toBe(0);
    expect(formatTraitValue(104)).toBe(100);
  });

  it('resolves family identifiers and only enables records available from the session', () => {
    const agent = individual();
    agent.children.push('g2-child');
    const parent = individual('g0-parent-a');
    parent.generation = 0;
    const records = new Map([[parent.id, snapshotAgentInspector(parent)]]);
    const view = createHomininInspectorViewModel(
      snapshotAgentInspector(agent),
      (id) => records.get(id) ?? null,
    );
    expect(view.parents[0]).toMatchObject({ id: parent.id, available: true });
    expect(view.parents[1]).toMatchObject({ id: 'g0-parent-b', available: false });
    expect(view.children[0]).toMatchObject({ id: 'g2-child', available: false });
  });

  it('builds chronology only from recorded memory, learning, and death timestamps', () => {
    const agent = individual();
    agent.memories.push({
      id: 'food-2-3',
      type: 'food',
      position: { x: 2, y: 3 },
      strength: 70,
      createdAtTick: 4,
      lastReinforcedTick: 8,
    });
    agent.learnedBehaviours.push({
      type: 'socialForaging',
      proficiency: 24,
      reinforcement: 2,
      learnedFrom: 'g0-parent-a',
      firstLearnedAtTick: 12,
      acquisitionSource: 'imitation',
      practiceCount: 2,
      successfulAttempts: 1,
      failedAttempts: 1,
      lastPracticedAtTick: 18,
    });
    markDead(agent, 'age', 40, 'Reached the end of their recorded lifespan.');
    const view = createHomininInspectorViewModel(snapshotAgentInspector(agent), () => null);
    expect(view.history.map((item) => item.tick)).toEqual([4, 12, 40]);
    expect(view.history.map((item) => item.tone)).toEqual(['experience', 'learning', 'death']);
    expect(view.statusLabel).toBe('Deceased · final recorded state');
  });

  it('uses an honest empty history when no timestamped records exist', () => {
    const view = createHomininInspectorViewModel(snapshotAgentInspector(individual()), () => null);
    expect(view.history).toEqual([]);
    expect(view.retainedMemoryCount).toBe(0);
  });
});
