import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import { defaultSimulationConfig } from '@/simulation';

describe('SimulationSessionController', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('initializes paused with a presentation-safe selected agent', () => {
    const controller = new SimulationSessionController();
    const update = controller.initialize();
    expect(update.status).toBe('paused');
    expect(update.snapshot.world.terrainCells).toHaveLength(64);
    expect(update.selectedAgent).not.toBeNull();

    const selected = update.selectedAgent!;
    const originalEnergy = selected.needs.energy;
    selected.needs.energy = 0;
    expect(controller.getUpdate().selectedAgent?.needs.energy).toBe(originalEnergy);
    expect(controller.getUpdate()).not.toHaveProperty('engine');
    controller.dispose();
  });

  it('reuses the active engine for lightweight population snapshots', () => {
    const controller = new SimulationSessionController({ seed: 'population-snapshot' });
    const initialized = controller.initialize();
    const before = controller.getPopulationDataSnapshot();
    expect(before.living).toHaveLength(initialized.snapshot.populationSize);
    expect(before.living[0]).toHaveProperty('genome');
    expect(before.living[0]).not.toHaveProperty('memories');
    expect(before.living[0]).not.toHaveProperty('relationships');
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    expect(controller.getPopulationDataSnapshot().currentTick).toBeGreaterThan(before.currentTick);
    controller.dispose();
  });

  it('plays, pauses, resumes, and changes speed without resetting', () => {
    const controller = new SimulationSessionController();
    controller.initialize();
    controller.setSpeed(10);
    controller.start();
    jest.advanceTimersByTime(200);
    const advancedTick = controller.getUpdate().snapshot.tick;
    expect(advancedTick).toBe(10);
    expect(controller.getUpdate().speed).toBe(10);

    controller.pause();
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().snapshot.tick).toBe(advancedTick);
    controller.resume();
    jest.advanceTimersByTime(200);
    expect(controller.getUpdate().snapshot.tick).toBeGreaterThan(advancedTick);
    controller.dispose();
  });

  it('does not create duplicate playback loops and disposes the active loop', () => {
    const intervalSpy = jest.spyOn(global, 'setInterval');
    const clearSpy = jest.spyOn(global, 'clearInterval');
    const controller = new SimulationSessionController();
    controller.initialize();
    controller.resume();
    controller.resume();
    expect(intervalSpy).toHaveBeenCalledTimes(1);
    controller.dispose();
    expect(clearSpy).toHaveBeenCalledTimes(1);
    intervalSpy.mockRestore();
    clearSpy.mockRestore();
  });

  it('pauses on background and never resumes implicitly on foreground', () => {
    const controller = new SimulationSessionController({ seed: 'app-state-lifecycle' });
    controller.initialize();
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    const activeTick = controller.getUpdate().snapshot.tick;

    controller.handleAppState('background');
    expect(controller.getUpdate().status).toBe('paused');
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().snapshot.tick).toBe(activeTick);
    controller.handleAppState('active');
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate()).toMatchObject({
      status: 'paused',
      snapshot: { tick: activeTick },
    });
    controller.dispose();
  });

  it('keeps a manual pause respected across background and foreground transitions', () => {
    const controller = new SimulationSessionController({ seed: 'manual-pause-app-state' });
    controller.initialize();
    controller.pause();
    controller.handleAppState('background');
    controller.handleAppState('active');
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate()).toMatchObject({ status: 'paused', snapshot: { tick: 0 } });
    controller.dispose();
  });

  it('keeps equal seeded sessions deterministic', () => {
    const first = new SimulationSessionController({ seed: 'controller-determinism' });
    const second = new SimulationSessionController({ seed: 'controller-determinism' });
    first.initialize();
    second.initialize();
    first.setSpeed(50);
    second.setSpeed(50);
    first.resume();
    second.resume();
    jest.advanceTimersByTime(600);
    expect(first.getUpdate().snapshot).toEqual(second.getUpdate().snapshot);
    first.dispose();
    second.dispose();
  });

  it('keeps scheduled environment changes dormant while paused and applies them after resume', () => {
    const controller = new SimulationSessionController({ seed: 'paused-environment-change' });
    controller.initialize();
    const before = controller.getEnvironmentInterventionSnapshot();
    controller.scheduleEnvironmentInterventions([
      { type: 'foodAvailability', value: 0.5, durationTicks: 4 },
    ]);
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().status).toBe('paused');
    expect(controller.getEnvironmentInterventionSnapshot()).toMatchObject({
      currentTick: before.currentTick,
      factors: { foodAvailability: 1 },
      interventions: [expect.objectContaining({ status: 'scheduled' })],
    });
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(20);
    expect(controller.getEnvironmentInterventionSnapshot()).toMatchObject({
      factors: { foodAvailability: 0.5 },
      interventions: [expect.objectContaining({ status: 'active' })],
    });
    controller.dispose();
  });

  it('cancels an intervention without resetting the active simulation', () => {
    const controller = new SimulationSessionController({ seed: 'cancel-environment-change' });
    controller.initialize();
    const [scheduled] = controller.scheduleEnvironmentInterventions([
      { type: 'predatorPressure', value: 1.5, durationTicks: null },
    ]).interventions;
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    const tick = controller.getUpdate().snapshot.tick;
    expect(controller.getEnvironmentInterventionSnapshot().factors.predatorPressure).toBe(1.5);
    controller.cancelEnvironmentIntervention(scheduled!.id);
    expect(controller.getUpdate().snapshot.tick).toBe(tick);
    expect(controller.getEnvironmentInterventionSnapshot()).toMatchObject({
      factors: { predatorPressure: 1 },
      interventions: [expect.objectContaining({ status: 'cancelled' })],
    });
    controller.dispose();
  });

  it('produces the same intervention outcome at every playback speed', () => {
    const run = (speed: 1 | 5 | 10 | 50) => {
      const controller = new SimulationSessionController({ seed: 'intervention-speed-replay' });
      controller.initialize();
      controller.scheduleEnvironmentInterventions([
        { type: 'drought', value: 1, durationTicks: 12 },
      ]);
      controller.setSpeed(speed);
      controller.resume();
      while (controller.getUpdate().snapshot.tick < 20) jest.advanceTimersByTime(20);
      const result = {
        simulation: controller.getUpdate().snapshot,
        environment: controller.getEnvironmentInterventionSnapshot(),
        history: controller.getEvolutionHistorySnapshot(),
      };
      controller.dispose();
      return result;
    };
    const expected = run(1);
    for (const speed of [5, 10, 50] as const) expect(run(speed)).toEqual(expected);
  });

  it('rejects duplicate environment submissions at the same tick', () => {
    const controller = new SimulationSessionController({ seed: 'duplicate-intervention' });
    controller.initialize();
    const command = { type: 'waterAvailability' as const, value: 0.8, durationTicks: 10 };
    controller.scheduleEnvironmentInterventions([command]);
    controller.scheduleEnvironmentInterventions([command]);
    expect(controller.getEnvironmentInterventionSnapshot().interventions).toHaveLength(1);
    controller.dispose();
  });

  it('preserves engine-ID selection across snapshot updates', () => {
    const controller = new SimulationSessionController({ seed: 'selection-persistence' });
    const initialized = controller.initialize();
    const selected = initialized.snapshot.aliveAgents[1]!;
    controller.selectAgent(selected.id);
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().selectedAgentId).toBe(selected.id);
    expect(controller.getUpdate().selectedAgent?.id).toBe(selected.id);
    controller.dispose();
  });

  it('pauses for inspection and resumes only when the session was previously running', () => {
    const controller = new SimulationSessionController({ seed: 'inspection-lifecycle' });
    const initialized = controller.initialize();
    const id = initialized.selectedAgentId!;
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    const tickBeforeInspection = controller.getUpdate().snapshot.tick;

    expect(controller.beginInspection(id)?.id).toBe(id);
    expect(controller.getUpdate().status).toBe('paused');
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().snapshot.tick).toBe(tickBeforeInspection);

    controller.endInspection();
    expect(controller.getUpdate().status).toBe('running');
    jest.advanceTimersByTime(200);
    expect(controller.getUpdate().snapshot.tick).toBeGreaterThan(tickBeforeInspection);
    controller.dispose();
  });

  it('leaves a session paused after inspection when it started paused', () => {
    const controller = new SimulationSessionController({ seed: 'paused-inspection' });
    const initialized = controller.initialize();
    controller.beginInspection(initialized.selectedAgentId!);
    controller.endInspection();
    expect(controller.getUpdate().status).toBe('paused');
    controller.dispose();
  });

  it('pauses for social screens and resumes the same engine on exit', () => {
    const controller = new SimulationSessionController({ seed: 'social-lifecycle' });
    controller.initialize();
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    const tick = controller.getUpdate().snapshot.tick;
    const social = controller.beginSocial();
    expect(social.currentTick).toBe(tick);
    expect(controller.getUpdate().status).toBe('paused');
    jest.advanceTimersByTime(200);
    expect(controller.getUpdate().snapshot.tick).toBe(tick);
    controller.endSocial();
    expect(controller.getUpdate().status).toBe('running');
    controller.dispose();
  });

  it('pauses for timeline navigation and resumes after nested generation details close', () => {
    const controller = new SimulationSessionController({ seed: 'timeline-lifecycle' });
    controller.initialize();
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    const tickBeforeTimeline = controller.getUpdate().snapshot.tick;

    expect(controller.beginTimeline().currentTick).toBe(tickBeforeTimeline);
    controller.beginTimeline();
    expect(controller.getUpdate().status).toBe('paused');
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().snapshot.tick).toBe(tickBeforeTimeline);

    controller.endTimeline();
    expect(controller.getUpdate().status).toBe('paused');
    controller.endTimeline();
    expect(controller.getUpdate().status).toBe('running');
    jest.advanceTimersByTime(200);
    expect(controller.getUpdate().snapshot.tick).toBeGreaterThan(tickBeforeTimeline);
    controller.dispose();
  });

  it('preserves timeline history while an inspector is opened above it', () => {
    const controller = new SimulationSessionController({
      seed: 'timeline-inspector-history',
      time: { ticksPerGeneration: 5 },
    });
    const initialized = controller.initialize();
    controller.setSpeed(50);
    controller.resume();
    jest.advanceTimersByTime(200);
    const before = controller.beginTimeline();
    controller.beginInspection(initialized.selectedAgentId!);
    expect(controller.getEvolutionHistorySnapshot()).toEqual(before);
    controller.endInspection();
    controller.endTimeline();
    controller.dispose();
  });

  it('keeps the simulation paused across family tree and nested inspector navigation', () => {
    const controller = new SimulationSessionController({ seed: 'lineage-navigation' });
    const initialized = controller.initialize();
    controller.setSpeed(10);
    controller.resume();
    jest.advanceTimersByTime(200);
    const tick = controller.getUpdate().snapshot.tick;

    expect(controller.beginLineage().records.length).toBeGreaterThanOrEqual(
      initialized.snapshot.populationSize,
    );
    expect(controller.getUpdate().status).toBe('paused');
    controller.beginInspection(initialized.selectedAgentId!);
    controller.endInspection();
    expect(controller.getUpdate().status).toBe('paused');
    expect(controller.getUpdate().snapshot.tick).toBe(tick);
    controller.endLineage();
    expect(controller.getUpdate().status).toBe('running');
    controller.dispose();
  });

  it('does not advance RNG state when lineage snapshots are requested', () => {
    const first = new SimulationSessionController({ seed: 'lineage-read-only' });
    const second = new SimulationSessionController({ seed: 'lineage-read-only' });
    first.initialize();
    second.initialize();
    first.getLineageRegistrySnapshot();
    first.getLineageRegistrySnapshot();
    first.setSpeed(50);
    second.setSpeed(50);
    first.resume();
    second.resume();
    jest.advanceTimersByTime(400);
    expect(first.getUpdate().snapshot).toEqual(second.getUpdate().snapshot);
    expect(first.getLineageRegistrySnapshot()).toEqual(second.getLineageRegistrySnapshot());
    first.dispose();
    second.dispose();
  });

  it('retains a deceased state instead of silently changing selection', () => {
    const controller = new SimulationSessionController({
      seed: 'selected-death',
      population: { ...defaultSimulationConfig.population, initial: 8, maximum: 8 },
      world: {
        ...defaultSimulationConfig.world,
        foodPatches: 0,
        waterSources: 0,
        predatorCount: 16,
      },
      needs: {
        ...defaultSimulationConfig.needs,
        energyDepletion: 20,
        hydrationDepletion: 20,
        zeroNeedGraceTicks: 0,
        healthLossAtZero: 100,
      },
    });
    const initialized = controller.initialize();
    const selectedId = initialized.selectedAgentId;
    controller.setSpeed(50);
    controller.resume();
    jest.advanceTimersByTime(200);
    expect(controller.getUpdate().selectedAgentId).toBe(selectedId);
    expect(controller.getUpdate().selectedAgent).toMatchObject({
      id: selectedId,
      selectionState: 'deceased',
    });
    const archived = controller.getInspectorSnapshot(selectedId!);
    expect(archived).toMatchObject({ id: selectedId, alive: false });
    expect(archived?.death?.tick).toBeGreaterThan(0);
    expect(
      controller.getLineageRegistrySnapshot().records.find((record) => record.id === selectedId),
    ).toMatchObject({ id: selectedId, deathTick: archived?.death?.tick });
    const originalEnergy = archived!.needs.energy;
    archived!.needs.energy = 99;
    expect(controller.getInspectorSnapshot(selectedId!)?.needs.energy).toBe(originalEnergy);
    controller.dispose();
  });

  it('returns no inspector state for an unknown stable ID', () => {
    const controller = new SimulationSessionController({ seed: 'missing-inspector-id' });
    controller.initialize();
    expect(controller.getInspectorSnapshot('not-a-real-agent')).toBeNull();
    controller.dispose();
  });

  it('stops automatically when the population becomes extinct', () => {
    const controller = new SimulationSessionController({
      seed: 'forced-extinction',
      population: { ...defaultSimulationConfig.population, initial: 8, maximum: 8 },
      world: {
        ...defaultSimulationConfig.world,
        foodPatches: 0,
        waterSources: 0,
        predatorCount: 16,
      },
      needs: {
        ...defaultSimulationConfig.needs,
        energyDepletion: 20,
        hydrationDepletion: 20,
        zeroNeedGraceTicks: 0,
        healthLossAtZero: 100,
      },
    });
    controller.initialize();
    controller.setSpeed(50);
    controller.resume();
    jest.advanceTimersByTime(400);
    expect(controller.getUpdate().status).toBe('extinct');
    expect(controller.getUpdate().snapshot.populationSize).toBe(0);
    expect(controller.getEvolutionHistorySnapshot()).toMatchObject({ currentPopulation: 0 });
    expect(controller.getEvolutionHistorySnapshot().events).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'extinction' })]),
    );
    controller.scheduleEnvironmentInterventions([
      { type: 'foodAvailability', value: 1.5, durationTicks: null },
    ]);
    expect(controller.getEnvironmentInterventionSnapshot().interventions).toEqual([]);
    controller.dispose();
  });
});
