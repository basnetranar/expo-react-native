import {
  CheckpointValidationError,
  defaultSimulationConfig,
  SimulationEngine,
  validateCheckpoint,
} from '@/simulation';

describe('engine checkpoints', () => {
  it('restores complete mutable state and replays exactly', () => {
    const source = new SimulationEngine({
      seed: 'TEST-001',
      time: { ticksPerGeneration: 8 },
    });
    source.runTicks(37);
    source.scheduleEnvironmentInterventions([
      { type: 'drought', value: 1, durationTicks: 19 },
      { type: 'predatorPressure', value: 1.35, durationTicks: 31 },
    ]);
    source.runTicks(7);
    const checkpoint = source.exportCheckpoint();

    source.runTicks(64);
    const restored = SimulationEngine.restoreCheckpoint(checkpoint);
    restored.runTicks(64);

    expect(restored.exportCheckpoint()).toEqual(source.exportCheckpoint());
    expect(restored.getSnapshot()).toEqual(source.getSnapshot());
    expect(restored.getEvolutionHistorySnapshot()).toEqual(source.getEvolutionHistorySnapshot());
    expect(restored.getLineageRegistrySnapshot()).toEqual(source.getLineageRegistrySnapshot());
  });

  it('restores pending intervention commands and RNG normal-cache state', () => {
    const source = new SimulationEngine({ seed: 'pending-checkpoint' });
    source.runTicks(9);
    source.scheduleEnvironmentInterventions([
      { type: 'foodAvailability', value: 0.7, durationTicks: 10 },
    ]);
    const checkpoint = source.exportCheckpoint();
    expect(checkpoint.state.interventions.interventions[0]).toMatchObject({
      status: 'scheduled',
      startTick: 10,
    });
    const restored = SimulationEngine.restoreCheckpoint(checkpoint);
    restored.step();
    expect(restored.getEnvironmentInterventionSnapshot()).toMatchObject({
      currentTick: 10,
      factors: { foodAvailability: 0.7 },
      interventions: [expect.objectContaining({ status: 'active' })],
    });
  });

  it('creates deeply isolated branches from the same checkpoint', () => {
    const source = new SimulationEngine({ seed: 'branch-isolation' });
    source.runTicks(25);
    const checkpoint = source.exportCheckpoint();
    const first = SimulationEngine.restoreCheckpoint(checkpoint);
    const second = SimulationEngine.restoreCheckpoint(checkpoint);
    first.scheduleEnvironmentInterventions([{ type: 'drought', value: 1, durationTicks: 20 }]);
    first.runTicks(20);
    expect(second.exportCheckpoint()).toEqual(checkpoint);
    expect(first.exportCheckpoint()).not.toEqual(second.exportCheckpoint());

    second.scheduleEnvironmentInterventions([{ type: 'drought', value: 1, durationTicks: 20 }]);
    second.runTicks(20);
    expect(second.exportCheckpoint()).toEqual(first.exportCheckpoint());
  });

  it('round-trips extinction, deceased archives, and lineage records', () => {
    const source = new SimulationEngine({
      seed: 'checkpoint-extinction',
      population: { ...defaultSimulationConfig.population, initial: 8, maximum: 8 },
      world: {
        ...defaultSimulationConfig.world,
        foodPatches: 0,
        waterSources: 0,
        predatorCount: 12,
      },
      needs: {
        ...defaultSimulationConfig.needs,
        energyDepletion: 20,
        hydrationDepletion: 20,
        zeroNeedGraceTicks: 0,
        healthLossAtZero: 100,
      },
    });
    source.runTicks(20);
    const checkpoint = source.exportCheckpoint();
    expect(checkpoint.state.deceasedAgentSnapshots.length).toBeGreaterThan(0);
    const restored = SimulationEngine.restoreCheckpoint(checkpoint);
    expect(restored.exportCheckpoint()).toEqual(checkpoint);
    expect(restored.getLineageRegistrySnapshot()).toEqual(source.getLineageRegistrySnapshot());
  });

  it('rejects malformed and incompatible checkpoints', () => {
    expect(() => validateCheckpoint(null)).toThrow(CheckpointValidationError);
    expect(() => validateCheckpoint({ schemaVersion: 99 })).toThrow(
      'Unsupported checkpoint schema version',
    );
    const valid = new SimulationEngine({ seed: 'validation' }).exportCheckpoint();
    expect(() => validateCheckpoint({ ...valid, engineVersion: 'future-engine' })).toThrow(
      'incompatible',
    );
  });

  it('migrates additive Slice 10A social state from older schema-v1 checkpoints', () => {
    const source = new SimulationEngine({ seed: 'pre-social' });
    source.runTicks(4);
    const legacy = source.exportCheckpoint();
    delete legacy.state.social;
    for (const agent of legacy.state.population) {
      delete (agent as Partial<typeof agent>).carriedFood;
      delete (agent as Partial<typeof agent>).groupId;
      for (const relationship of agent.relationships) {
        delete (relationship as Partial<typeof relationship>).affinity;
        delete (relationship as Partial<typeof relationship>).interactionCount;
      }
    }
    const restored = SimulationEngine.restoreCheckpoint(legacy);
    expect(restored.getPopulation().every((agent) => agent.carriedFood === 0)).toBe(true);
    expect(restored.getSocialSnapshot().groups).toEqual([]);
    expect(restored.exportCheckpoint().state.social).toBeDefined();
  });

  it('rejects corrupt social group state', () => {
    const checkpoint = new SimulationEngine({ seed: 'corrupt-social' }).exportCheckpoint();
    checkpoint.state.social!.groups = [
      {
        id: 'group-corrupt',
        memberIds: [checkpoint.state.population[0]!.id],
        formedTick: 0,
        formedGeneration: 0,
        lastActiveTick: 0,
        memberLastSeen: {},
      },
    ];
    expect(() => SimulationEngine.restoreCheckpoint(checkpoint)).toThrow(
      'Checkpoint social group is invalid',
    );
  });
});
