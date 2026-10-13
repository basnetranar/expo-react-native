import type { ScenarioName } from '@/simulation/scenarios/types';

export interface SimulationConfig {
  seed: string | number;
  scenario: ScenarioName;
  world: {
    width: number;
    height: number;
    foodPatches: number;
    waterSources: number;
    predatorCount: number;
  };
  population: {
    initial: number;
    maximum: number;
    traitMean: number;
    traitStandardDeviation: number;
  };
  time: { ticksPerGeneration: number };
  needs: {
    energyDepletion: number;
    hydrationDepletion: number;
    zeroNeedGraceTicks: number;
    healthLossAtZero: number;
    juvenileMetabolismMultiplier: number;
    youngAdultMetabolismMultiplier: number;
  };
  resources: { foodRegeneration: number; waterRegeneration: number };
  memory: { baseDecay: number; relationshipLimit: number };
  decision: {
    noiseFraction: number;
    weights: {
      foodHunger: number;
      foodVisible: number;
      waterThirst: number;
      waterVisible: number;
      resourceDanger: number;
      resourceDistance: number;
      fleeVisible: number;
      fleeDanger: number;
      fleeVulnerability: number;
      exploreCuriosity: number;
      exploreHunger: number;
      exploreThirst: number;
      exploreDanger: number;
      exploreExhaustion: number;
      followSocial: number;
      followSuccess: number;
      followTrust: number;
      followUncertainty: number;
      observeSocial: number;
      observeCuriosity: number;
      restExhaustion: number;
      restSafety: number;
      juvenileFollowBonus: number;
      juvenileExplorePenalty: number;
    };
  };
  learning: {
    baseRate: number;
    abilityRate: number;
    imitationBaseProficiency: number;
    observationRadius: number;
    observationCandidateLimit: number;
    minimumObservationEnergy: number;
    minimumObservationHydration: number;
    minimumObservationSafety: number;
    teachingTrust: number;
    teachingFamiliarity: number;
    teachingProficiency: number;
  };
  reproduction: {
    minimumAge: number;
    maximumAge: number;
    energy: number;
    hydration: number;
    health: number;
    chancePerGeneration: number;
    recombinationSd: number;
    peakAgeStart: number;
    peakAgeEnd: number;
    birthSpacingGenerations: number;
    localPartnerRadius: number;
    parentEnergyCost: number;
  };
  mutation: { scale: number; tailChance: number };
  discovery: {
    stoneBaseChance: number;
    minimumEnergy: number;
    minimumSafety: number;
    minimumDexterity: number;
    minimumCuriosity: number;
    minimumLearning: number;
  };
  analytics: {
    bottleneckDecline: number;
    bottleneckWindow: number;
    migrationThreshold: number;
    migrationCentroidShift: number;
    migrationMeanDisplacement: number;
    migrationPersistence: number;
    historyGenerationLimit: number;
    historyEventLimit: number;
  };
  hardFood: {
    softFoodFraction: number;
    hardFoodConversion: number;
    predatorRiskMultiplier: number;
    stoneTileFrequency: number;
  };
  debug: { agentId: string | null; maxEntries: number };
  scenarioSettings: {
    droughtStart: number;
    droughtDuration: number;
    droughtWaterSources: number;
    droughtFoodMultiplier: number;
  };
}

export const defaultSimulationConfig: SimulationConfig = {
  seed: 'FIRST-MINDS-001',
  scenario: 'stableSavannah',
  world: { width: 32, height: 32, foodPatches: 18, waterSources: 6, predatorCount: 3 },
  population: { initial: 50, maximum: 150, traitMean: 50, traitStandardDeviation: 8 },
  time: { ticksPerGeneration: 40 },
  needs: {
    energyDepletion: 0.14,
    hydrationDepletion: 0.19,
    zeroNeedGraceTicks: 4,
    healthLossAtZero: 0.5,
    juvenileMetabolismMultiplier: 0.68,
    youngAdultMetabolismMultiplier: 0.9,
  },
  resources: { foodRegeneration: 0.22, waterRegeneration: 0.75 },
  memory: { baseDecay: 0.07, relationshipLimit: 24 },
  decision: {
    noiseFraction: 0.1,
    weights: {
      foodHunger: 0.75,
      foodVisible: 24,
      waterThirst: 0.9,
      waterVisible: 28,
      resourceDanger: 0.35,
      resourceDistance: 2,
      fleeVisible: 65,
      fleeDanger: 0.25,
      fleeVulnerability: 15,
      exploreCuriosity: 0.55,
      exploreHunger: 0.15,
      exploreThirst: 0.15,
      exploreDanger: 0.3,
      exploreExhaustion: 0.25,
      followSocial: 0.35,
      followSuccess: 0.3,
      followTrust: 0.2,
      followUncertainty: 0.2,
      observeSocial: 0.3,
      observeCuriosity: 0.2,
      restExhaustion: 0.75,
      restSafety: 0.15,
      juvenileFollowBonus: 24,
      juvenileExplorePenalty: 18,
    },
  },
  learning: {
    baseRate: 0.05,
    abilityRate: 0.2,
    imitationBaseProficiency: 24,
    observationRadius: 2,
    observationCandidateLimit: 6,
    minimumObservationEnergy: 24,
    minimumObservationHydration: 24,
    minimumObservationSafety: 38,
    teachingTrust: 5,
    teachingFamiliarity: 1,
    teachingProficiency: 15,
  },
  reproduction: {
    minimumAge: 14,
    maximumAge: 48,
    energy: 46,
    hydration: 46,
    health: 60,
    chancePerGeneration: 0.4,
    recombinationSd: 2,
    peakAgeStart: 18,
    peakAgeEnd: 32,
    birthSpacingGenerations: 2,
    localPartnerRadius: 8,
    parentEnergyCost: 6,
  },
  mutation: { scale: 0.7, tailChance: 0.04 },
  discovery: {
    stoneBaseChance: 0.0012,
    minimumEnergy: 30,
    minimumSafety: 40,
    minimumDexterity: 40,
    minimumCuriosity: 35,
    minimumLearning: 35,
  },
  analytics: {
    bottleneckDecline: 0.3,
    bottleneckWindow: 3,
    migrationThreshold: 0.25,
    migrationCentroidShift: 2,
    migrationMeanDisplacement: 4,
    migrationPersistence: 3,
    historyGenerationLimit: 200,
    historyEventLimit: 1000,
  },
  hardFood: {
    softFoodFraction: 0.42,
    hardFoodConversion: 0.68,
    predatorRiskMultiplier: 1.05,
    stoneTileFrequency: 0.55,
  },
  debug: { agentId: null, maxEntries: 500 },
  scenarioSettings: {
    droughtStart: 20,
    droughtDuration: 20,
    droughtWaterSources: 2,
    droughtFoodMultiplier: 0.62,
  },
};

export function createSimulationConfig(
  overrides: Partial<SimulationConfig> = {},
): SimulationConfig {
  return {
    ...defaultSimulationConfig,
    ...overrides,
    world: { ...defaultSimulationConfig.world, ...overrides.world },
    population: { ...defaultSimulationConfig.population, ...overrides.population },
    time: { ...defaultSimulationConfig.time, ...overrides.time },
    needs: { ...defaultSimulationConfig.needs, ...overrides.needs },
    resources: { ...defaultSimulationConfig.resources, ...overrides.resources },
    memory: { ...defaultSimulationConfig.memory, ...overrides.memory },
    decision: {
      ...defaultSimulationConfig.decision,
      ...overrides.decision,
      weights: {
        ...defaultSimulationConfig.decision.weights,
        ...overrides.decision?.weights,
      },
    },
    learning: { ...defaultSimulationConfig.learning, ...overrides.learning },
    reproduction: { ...defaultSimulationConfig.reproduction, ...overrides.reproduction },
    mutation: { ...defaultSimulationConfig.mutation, ...overrides.mutation },
    discovery: { ...defaultSimulationConfig.discovery, ...overrides.discovery },
    analytics: { ...defaultSimulationConfig.analytics, ...overrides.analytics },
    hardFood: { ...defaultSimulationConfig.hardFood, ...overrides.hardFood },
    debug: { ...defaultSimulationConfig.debug, ...overrides.debug },
    scenarioSettings: {
      ...defaultSimulationConfig.scenarioSettings,
      ...overrides.scenarioSettings,
    },
  };
}
