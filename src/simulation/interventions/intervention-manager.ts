import type { SimulationEvent, World } from '@/simulation/engine/types';
import { calculateEnvironmentFactors } from '@/simulation/interventions/intervention-effects';
import type {
  EnvironmentIntervention,
  EnvironmentInterventionCommand,
  EnvironmentInterventionSnapshot,
} from '@/simulation/interventions/intervention-types';

export class EnvironmentInterventionManager {
  private readonly interventions: EnvironmentIntervention[] = [];
  private nextSequence = 1;
  private terminalRecordsDiscarded = 0;

  constructor(
    private readonly baseline: EnvironmentInterventionSnapshot['baseline'],
    private readonly terminalRecordLimit: number,
    private readonly ticksPerGeneration: number,
  ) {}

  schedule(
    commands: readonly EnvironmentInterventionCommand[],
    currentTick: number,
    currentGeneration: number,
  ): readonly EnvironmentIntervention[] {
    const validated = commands.map(validateCommand);
    const scheduled = validated.map<EnvironmentIntervention>((command) => ({
      id: `environment-${String(this.nextSequence++).padStart(6, '0')}`,
      ...command,
      scheduledAtTick: currentTick,
      scheduledAtGeneration: currentGeneration,
      startTick: currentTick + 1,
      startGeneration: null,
      endTick: null,
      endGeneration: null,
      status: 'scheduled',
    }));
    this.interventions.push(...scheduled);
    return scheduled.map(cloneIntervention);
  }

  processTick(tick: number, generation: number, world: World): SimulationEvent[] {
    const events: SimulationEvent[] = [];
    for (const item of this.interventions) {
      if (item.status === 'scheduled' && item.startTick <= tick) {
        item.status = 'active';
        item.startGeneration = generation;
        events.push(toEvent(item, 'active', tick, generation));
      }
      if (
        item.status === 'active' &&
        item.durationTicks !== null &&
        tick >= item.startTick + item.durationTicks
      ) {
        item.status = 'completed';
        item.endTick = tick;
        item.endGeneration = generation;
        events.push(toEvent(item, 'completed', tick, generation));
      }
    }
    this.apply(world);
    this.enforceRetention();
    return events;
  }

  cancel(id: string, tick: number, generation: number, world: World): boolean {
    const item = this.interventions.find((candidate) => candidate.id === id);
    if (!item || (item.status !== 'active' && item.status !== 'scheduled')) return false;
    item.status = 'cancelled';
    item.endTick = tick;
    item.endGeneration = generation;
    this.apply(world);
    this.enforceRetention();
    return true;
  }

  cancellationEvent(id: string, tick: number, generation: number): SimulationEvent | null {
    const item = this.interventions.find((candidate) => candidate.id === id);
    return item?.status === 'cancelled' ? toEvent(item, 'cancelled', tick, generation) : null;
  }

  apply(world: World): void {
    const factors = calculateEnvironmentFactors(this.interventions);
    world.interventionFoodMultiplier = factors.foodAvailability;
    world.interventionWaterMultiplier = factors.waterAvailability;
    world.predatorPressureMultiplier = factors.predatorPressure;
  }

  snapshot(tick: number, generation: number, world: World): EnvironmentInterventionSnapshot {
    const factors = calculateEnvironmentFactors(this.interventions);
    return {
      currentTick: tick,
      currentGeneration: generation,
      ticksPerGeneration: this.ticksPerGeneration,
      baseline: { ...this.baseline },
      scenario: {
        foodRegenerationMultiplier: world.foodRegenerationMultiplier,
        activeWaterSources: world.activeWaterSources,
      },
      factors,
      effective: {
        foodRegeneration:
          this.baseline.foodRegeneration *
          world.foodRegenerationMultiplier *
          factors.foodAvailability,
        waterRegeneration: this.baseline.waterRegeneration * factors.waterAvailability,
        predatorPressure: factors.predatorPressure,
      },
      interventions: this.interventions.map(cloneIntervention),
      retention: {
        terminalRecordLimit: this.terminalRecordLimit,
        terminalRecordsDiscarded: this.terminalRecordsDiscarded,
      },
    };
  }

  exportState(): EnvironmentInterventionManagerState {
    return {
      interventions: this.interventions.map(cloneIntervention),
      nextSequence: this.nextSequence,
      terminalRecordsDiscarded: this.terminalRecordsDiscarded,
    };
  }

  restoreState(state: EnvironmentInterventionManagerState, world: World): void {
    this.interventions.splice(
      0,
      this.interventions.length,
      ...state.interventions.map(cloneIntervention),
    );
    this.nextSequence = state.nextSequence;
    this.terminalRecordsDiscarded = state.terminalRecordsDiscarded;
    this.apply(world);
  }

  private enforceRetention(): void {
    const terminal = this.interventions.filter(
      (item) => item.status === 'completed' || item.status === 'cancelled',
    );
    const overflow = Math.max(0, terminal.length - this.terminalRecordLimit);
    if (!overflow) return;
    const remove = new Set(terminal.slice(0, overflow).map((item) => item.id));
    for (let index = this.interventions.length - 1; index >= 0; index -= 1)
      if (remove.has(this.interventions[index]!.id)) this.interventions.splice(index, 1);
    this.terminalRecordsDiscarded += overflow;
  }
}

export interface EnvironmentInterventionManagerState {
  interventions: EnvironmentIntervention[];
  nextSequence: number;
  terminalRecordsDiscarded: number;
}

function validateCommand(command: EnvironmentInterventionCommand): EnvironmentInterventionCommand {
  if (!Number.isFinite(command.value)) throw new Error('Intervention value must be finite.');
  if (command.type === 'drought' && command.value !== 1)
    throw new Error('Drought uses the documented fixed severity.');
  if (command.type !== 'drought' && (command.value < 0.5 || command.value > 1.5))
    throw new Error('Environmental values must be between 50% and 150% of baseline.');
  if (
    command.durationTicks !== null &&
    (!Number.isInteger(command.durationTicks) || command.durationTicks < 1)
  )
    throw new Error('Intervention duration must be a positive whole number of ticks.');
  return { ...command };
}

function toEvent(
  item: EnvironmentIntervention,
  status: 'active' | 'completed' | 'cancelled',
  tick: number,
  generation: number,
): SimulationEvent {
  return {
    id: `${item.id}-${status}-${tick}`,
    type: 'environmentIntervention',
    interventionId: item.id,
    interventionType: item.type,
    value: item.value,
    status,
    tick,
    generation,
  };
}

function cloneIntervention(item: EnvironmentIntervention): EnvironmentIntervention {
  return { ...item };
}
