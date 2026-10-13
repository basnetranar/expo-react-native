import type { EnvironmentDraft } from '@/features/experiments/types';
import type {
  EnvironmentFactors,
  EnvironmentInterventionCommand,
  EnvironmentInterventionType,
} from '@/simulation';

export function draftToInterventionCommands(
  draft: EnvironmentDraft,
  current: EnvironmentFactors,
  ticksPerGeneration: number,
): EnvironmentInterventionCommand[] {
  const durationTicks =
    draft.durationGenerations === 0 ? null : draft.durationGenerations * ticksPerGeneration;
  const commands: EnvironmentInterventionCommand[] = [];
  appendIfChanged(
    commands,
    'foodAvailability',
    draft.foodAvailability,
    current.foodAvailability,
    durationTicks,
  );
  appendIfChanged(
    commands,
    'waterAvailability',
    draft.waterAvailability,
    current.waterAvailability,
    durationTicks,
  );
  appendIfChanged(
    commands,
    'predatorPressure',
    draft.predatorPressure,
    current.predatorPressure,
    durationTicks,
  );
  return commands;
}

export function environmentalEventCommand(
  type: 'drought' | 'foodScarcity' | 'foodAbundance' | 'predatorIncrease' | 'predatorReduction',
  durationGenerations: number,
  ticksPerGeneration: number,
): EnvironmentInterventionCommand {
  const mapping: Record<typeof type, { type: EnvironmentInterventionType; value: number }> = {
    drought: { type: 'drought', value: 1 },
    foodScarcity: { type: 'foodAvailability', value: 0.6 },
    foodAbundance: { type: 'foodAvailability', value: 1.4 },
    predatorIncrease: { type: 'predatorPressure', value: 1.5 },
    predatorReduction: { type: 'predatorPressure', value: 0.6 },
  };
  return {
    ...mapping[type],
    durationTicks: durationGenerations * ticksPerGeneration,
  };
}

function appendIfChanged(
  target: EnvironmentInterventionCommand[],
  type: Exclude<EnvironmentInterventionType, 'drought'>,
  draftPercentage: number,
  currentFactor: number,
  durationTicks: number | null,
) {
  const value = Math.round(draftPercentage) / 100;
  if (Math.abs(value - currentFactor) < 0.005) return;
  target.push({ type, value, durationTicks });
}
