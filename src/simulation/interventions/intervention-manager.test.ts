import { SeededRng } from '@/simulation/engine/seededRng';
import { createSimulationConfig } from '@/simulation/engine/simulationConfig';
import { EnvironmentInterventionManager } from '@/simulation/interventions/intervention-manager';
import { createWorld } from '@/simulation/world/createWorld';

function setup(limit = 20) {
  const config = createSimulationConfig({ seed: 'intervention-manager' });
  const world = createWorld(config, new SeededRng(config.seed));
  const manager = new EnvironmentInterventionManager(
    {
      foodRegeneration: world.baselineFoodRegeneration,
      waterRegeneration: world.baselineWaterRegeneration,
      predatorCount: config.world.predatorCount,
    },
    limit,
    config.time.ticksPerGeneration,
  );
  return { config, world, manager };
}

describe('EnvironmentInterventionManager', () => {
  it('schedules for the next tick without changing the current environment', () => {
    const { world, manager } = setup();
    manager.schedule([{ type: 'foodAvailability', value: 0.5, durationTicks: null }], 10, 2);
    expect(manager.snapshot(10, 2, world).factors.foodAvailability).toBe(1);
    expect(manager.processTick(11, 2, world)).toEqual([
      expect.objectContaining({ type: 'environmentIntervention', status: 'active', tick: 11 }),
    ]);
    expect(world.interventionFoodMultiplier).toBe(0.5);
  });

  it('restores baseline factors after a temporary drought expires', () => {
    const { world, manager } = setup();
    manager.schedule([{ type: 'drought', value: 1, durationTicks: 2 }], 0, 0);
    manager.processTick(1, 0, world);
    expect(manager.snapshot(1, 0, world).factors).toMatchObject({
      foodAvailability: 0.65,
      waterAvailability: 0.4,
    });
    manager.processTick(2, 0, world);
    manager.processTick(3, 0, world);
    expect(manager.snapshot(3, 0, world).factors).toEqual({
      foodAvailability: 1,
      waterAvailability: 1,
      predatorPressure: 1,
    });
  });

  it('combines overlapping modifiers by clamped multiplication independent of order', () => {
    const first = setup();
    const second = setup();
    const commands = [
      { type: 'waterAvailability' as const, value: 0.5, durationTicks: null },
      { type: 'waterAvailability' as const, value: 1.5, durationTicks: null },
      { type: 'drought' as const, value: 1, durationTicks: null },
    ];
    first.manager.schedule(commands, 0, 0);
    second.manager.schedule([...commands].reverse(), 0, 0);
    first.manager.processTick(1, 0, first.world);
    second.manager.processTick(1, 0, second.world);
    expect(first.manager.snapshot(1, 0, first.world).factors).toEqual(
      second.manager.snapshot(1, 0, second.world).factors,
    );
    expect(first.world.interventionWaterMultiplier).toBeCloseTo(0.3);
  });

  it('cancels active modifiers and keeps an explicit historical record', () => {
    const { world, manager } = setup();
    const [scheduled] = manager.schedule(
      [{ type: 'predatorPressure', value: 1.5, durationTicks: null }],
      0,
      0,
    );
    manager.processTick(1, 0, world);
    expect(world.predatorPressureMultiplier).toBe(1.5);
    expect(manager.cancel(scheduled!.id, 1, 0, world)).toBe(true);
    expect(world.predatorPressureMultiplier).toBe(1);
    expect(manager.snapshot(1, 0, world).interventions[0]).toMatchObject({
      status: 'cancelled',
      endTick: 1,
    });
  });

  it('validates a batch atomically and reports bounded terminal retention', () => {
    const { world, manager } = setup(2);
    expect(() =>
      manager.schedule(
        [
          { type: 'foodAvailability', value: 0.8, durationTicks: 1 },
          { type: 'waterAvailability', value: 8, durationTicks: 1 },
        ],
        0,
        0,
      ),
    ).toThrow();
    expect(manager.snapshot(0, 0, world).interventions).toHaveLength(0);
    for (let index = 0; index < 5; index += 1) {
      manager.schedule([{ type: 'foodAvailability', value: 0.8, durationTicks: 1 }], index * 3, 0);
      manager.processTick(index * 3 + 1, 0, world);
      manager.processTick(index * 3 + 2, 0, world);
    }
    const snapshot = manager.snapshot(20, 0, world);
    expect(snapshot.interventions).toHaveLength(2);
    expect(snapshot.retention.terminalRecordsDiscarded).toBe(3);
  });

  it('keeps large histories bounded without dropping scheduled or active records', () => {
    const { world, manager } = setup(25);
    for (let index = 0; index < 500; index += 1) {
      const tick = index * 3;
      manager.schedule([{ type: 'foodAvailability', value: 0.9, durationTicks: 1 }], tick, 0);
      manager.processTick(tick + 1, 0, world);
      manager.processTick(tick + 2, 0, world);
    }
    manager.schedule([{ type: 'waterAvailability', value: 0.8, durationTicks: null }], 2000, 0);
    const snapshot = manager.snapshot(2000, 0, world);
    expect(snapshot.interventions).toHaveLength(26);
    expect(snapshot.interventions.at(-1)).toMatchObject({ status: 'scheduled' });
    expect(snapshot.retention.terminalRecordsDiscarded).toBe(475);
  });
});
