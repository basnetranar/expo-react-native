export type EnvironmentInterventionType =
  'foodAvailability' | 'waterAvailability' | 'predatorPressure' | 'drought';

export type EnvironmentInterventionStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

export interface EnvironmentFactors {
  foodAvailability: number;
  waterAvailability: number;
  predatorPressure: number;
}

export interface EnvironmentInterventionCommand {
  type: EnvironmentInterventionType;
  value: number;
  durationTicks: number | null;
}

export interface EnvironmentIntervention {
  id: string;
  type: EnvironmentInterventionType;
  value: number;
  durationTicks: number | null;
  scheduledAtTick: number;
  scheduledAtGeneration: number;
  startTick: number;
  startGeneration: number | null;
  endTick: number | null;
  endGeneration: number | null;
  status: EnvironmentInterventionStatus;
}

export interface EnvironmentInterventionSnapshot {
  currentTick: number;
  currentGeneration: number;
  ticksPerGeneration: number;
  baseline: {
    foodRegeneration: number;
    waterRegeneration: number;
    predatorCount: number;
  };
  scenario: {
    foodRegenerationMultiplier: number;
    activeWaterSources: number;
  };
  factors: EnvironmentFactors;
  effective: {
    foodRegeneration: number;
    waterRegeneration: number;
    predatorPressure: number;
  };
  interventions: readonly EnvironmentIntervention[];
  retention: { terminalRecordLimit: number; terminalRecordsDiscarded: number };
}
