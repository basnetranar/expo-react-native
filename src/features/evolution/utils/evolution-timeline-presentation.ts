import type {
  CulturalTrendPoint,
  EvolutionMilestone,
  EvolutionTimelineViewModel,
  GenerationDetail,
  MilestoneCategory,
  TraitTrendPoint,
} from '@/features/evolution/types';
import type {
  EvolutionHistorySnapshot,
  LearnedBehaviourType,
  ScenarioName,
  SimulationEvent,
  TraitName,
} from '@/simulation';
import { traitNames } from '@/simulation/engine/types';
import { classifyCulture } from '@/simulation/learning/cultureStats';

export const culturalBehaviours: readonly LearnedBehaviourType[] = [
  'stoneCracking',
  'socialForaging',
];

export function createEvolutionTimelineViewModel(
  source: EvolutionHistorySnapshot,
  scenario: ScenarioName,
): EvolutionTimelineViewModel {
  const summaries = [...source.summaries].sort((a, b) => a.generation - b.generation);
  const milestones = createMilestones(source.events);
  const latest = summaries.at(-1) ?? null;
  const previous = summaries.at(-2) ?? null;
  const traitSeries = traitNames.reduce(
    (series, trait) => {
      series[trait] = summaries.map<TraitTrendPoint>((summary) => ({
        generation: summary.generation,
        value: summary.averageGenome[trait],
      }));
      return series;
    },
    {} as Record<TraitName, readonly TraitTrendPoint[]>,
  );
  const culturalSeries = culturalBehaviours.reduce(
    (series, behaviour) => {
      series[behaviour] = summaries.map<CulturalTrendPoint>((summary) => {
        const prevalence = summary.behaviourPrevalence[behaviour];
        return {
          generation: summary.generation,
          prevalence,
          stage: classifyCulture(Math.round(prevalence * summary.population), summary.population),
        };
      });
      return series;
    },
    {} as Record<LearnedBehaviourType, readonly CulturalTrendPoint[]>,
  );
  const generations = summaries
    .map<GenerationDetail>((summary) => ({
      generation: summary.generation,
      population: summary.population,
      births: summary.births,
      deaths: summary.deaths,
      deathCauses: { ...summary.deathCauses },
      averageGenome: { ...summary.averageGenome },
      behaviourPrevalence: { ...summary.behaviourPrevalence },
      resources: { ...summary.resources },
      resourcePressure: summary.environment.resourcePressure,
      migrationRate: summary.migration.changedRegionProportion,
      milestones: milestones.filter((item) => item.generation === summary.generation),
    }))
    .reverse();
  return {
    scenario,
    currentGeneration: source.currentGeneration,
    currentTick: source.currentTick,
    latestGeneration: latest?.generation ?? null,
    population: source.currentPopulation,
    populationChange: latest && previous ? latest.population - previous.population : null,
    retainedPeakPopulation: summaries.length
      ? Math.max(...summaries.map((summary) => summary.population))
      : null,
    births: latest?.births ?? null,
    deaths: latest?.deaths ?? null,
    extinct: source.currentPopulation === 0,
    chart: summaries.map((summary) => ({
      generation: summary.generation,
      population: summary.population,
      births: summary.births,
      deaths: summary.deaths,
      extinct:
        summary.population === 0 ||
        milestones.some(
          (milestone) =>
            milestone.category === 'extinction' && milestone.generation === summary.generation,
        ),
    })),
    traitNames,
    traitSeries,
    culturalBehaviours,
    culturalSeries,
    milestones,
    generations,
    retention: { ...source.retention },
  };
}

export function createMilestones(events: readonly SimulationEvent[]): EvolutionMilestone[] {
  const ordered = events
    .map((event, sourceIndex) => ({ event, sourceIndex }))
    .sort(
      (a, b) =>
        a.event.generation - b.event.generation ||
        a.event.tick - b.event.tick ||
        a.sourceIndex - b.sourceIndex,
    )
    .map(({ event }) => event);
  const seen = new Set<string>();
  const discovered = new Set<LearnedBehaviourType>();
  const result: EvolutionMilestone[] = [];
  for (const event of ordered) {
    const signature = milestoneSignature(event);
    if (seen.has(signature)) continue;
    seen.add(signature);
    const rediscovery = event.type === 'firstDiscovery' && discovered.has(event.behaviour);
    if (event.type === 'firstDiscovery') discovered.add(event.behaviour);
    result.push(presentMilestone(event, rediscovery));
  }
  return result;
}

export function traitLabel(trait: TraitName): string {
  const labels: Record<TraitName, string> = {
    strength: 'Strength',
    speed: 'Speed',
    endurance: 'Endurance',
    dexterity: 'Dexterity',
    vision: 'Vision',
    metabolicEfficiency: 'Metabolic efficiency',
    memoryPotential: 'Memory potential',
    learningAbility: 'Learning ability',
    socialSensitivity: 'Social sensitivity',
    curiosity: 'Curiosity',
  };
  return labels[trait];
}

export function behaviourLabel(behaviour: LearnedBehaviourType): string {
  return behaviour === 'stoneCracking' ? 'Stone cracking' : 'Social foraging';
}

export function findGeneration(
  timeline: EvolutionTimelineViewModel,
  generation: number | null,
): GenerationDetail | null {
  if (generation === null) return null;
  return timeline.generations.find((item) => item.generation === generation) ?? null;
}

export function scenarioLabel(scenario: ScenarioName): string {
  return scenario === 'stableSavannah'
    ? 'Stable Savannah'
    : scenario === 'drought'
      ? 'Drought'
      : 'Hard Food';
}

function presentMilestone(event: SimulationEvent, rediscovery: boolean): EvolutionMilestone {
  const base = { id: event.id, tick: event.tick, generation: event.generation };
  switch (event.type) {
    case 'firstDiscovery':
      return {
        ...base,
        category: 'discovery',
        title: rediscovery
          ? `${behaviourLabel(event.behaviour)} rediscovered`
          : `${behaviourLabel(event.behaviour)} discovered`,
        description: `${rediscovery ? 'Recorded again' : 'First recorded'} in ${event.agentId}.`,
      };
    case 'culturalThreshold':
      return {
        ...base,
        category: 'culture',
        title: `${behaviourLabel(event.behaviour)}: ${event.stage}`,
        description: `${Math.round(event.prevalence * 100)}% prevalence recorded.`,
      };
    case 'traditionLost':
      return {
        ...base,
        category: 'culture',
        title: `${behaviourLabel(event.behaviour)} lost`,
        description: `No living individual retained the ${event.previousStage} tradition.`,
      };
    case 'populationBottleneck':
      return {
        ...base,
        category: 'population',
        title: 'Population bottleneck',
        description: `Population fell from ${event.fromPopulation} to ${event.toPopulation}.`,
      };
    case 'migrationDetected':
      return {
        ...base,
        category: 'migration',
        title: 'Migration detected',
        description: `${Math.round(event.migrationRate * 100)}% changed region; centroid shifted ${event.centroidShift.toFixed(1)}.`,
      };
    case 'scenarioPhase':
      return {
        ...base,
        category: 'environment',
        title: event.phase === 'droughtStarted' ? 'Drought began' : 'Drought ended',
        description:
          event.phase === 'droughtStarted'
            ? 'The configured drought phase started.'
            : 'The configured drought phase ended.',
      };
    case 'environmentIntervention':
      return {
        ...base,
        category: 'environment',
        title: `${interventionLabel(event.interventionType)} ${event.status}`,
        description: `Intervention ${event.interventionId} was ${event.status} at tick ${event.tick}.`,
      };
    case 'extinction':
      return {
        ...base,
        category: 'extinction',
        title: 'Population extinct',
        description: 'No living hominins remained.',
      };
    case 'behaviourDiscovered':
    case 'behaviourRediscovered':
    case 'behaviourAcquired':
    case 'behaviourTransmitted':
    case 'behaviourObserved':
    case 'imitationAttempted':
    case 'behaviourPracticed':
    case 'behaviourDemonstrated':
    case 'behaviourLost':
      return {
        ...base,
        category: event.type === 'behaviourDiscovered' ? 'discovery' : 'culture',
        title: `${behaviourLabel(event.behaviour)} ${event.type
          .replace('behaviour', '')
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()}`,
        description: event.agentId
          ? `Recorded for ${event.agentId}${event.sourceAgentId ? ` with ${event.sourceAgentId}` : ''}.`
          : 'Recorded from the living population.',
      };
    case 'socialEncounter':
    case 'socialGroupFormed':
    case 'socialGroupJoined':
    case 'socialGroupLeft':
    case 'socialGroupDissolved':
    case 'cooperativeForaging':
    case 'foodShared':
    case 'socialGrooming':
    case 'socialConflict':
      return {
        ...base,
        category: 'culture',
        title: event.type
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (letter) => letter.toUpperCase()),
        description: `Recorded interaction involving ${event.participantIds.length} individual${event.participantIds.length === 1 ? '' : 's'}.`,
      };
  }
}

function milestoneSignature(event: SimulationEvent): string {
  switch (event.type) {
    case 'firstDiscovery':
      return `${event.type}-${event.generation}-${event.behaviour}`;
    case 'culturalThreshold':
      return `${event.type}-${event.generation}-${event.behaviour}-${event.stage}`;
    case 'traditionLost':
      return `${event.type}-${event.generation}-${event.behaviour}`;
    case 'populationBottleneck':
      return `${event.type}-${event.generation}-${event.fromPopulation}-${event.toPopulation}`;
    case 'migrationDetected':
      return `${event.type}-${event.generation}`;
    case 'scenarioPhase':
      return `${event.type}-${event.phase}`;
    case 'environmentIntervention':
      return `${event.type}-${event.interventionId}-${event.status}`;
    case 'extinction':
      return event.type;
    case 'behaviourDiscovered':
    case 'behaviourRediscovered':
    case 'behaviourLost':
      return `${event.type}-${event.generation}-${event.behaviour}`;
    case 'behaviourObserved':
    case 'imitationAttempted':
    case 'behaviourAcquired':
    case 'behaviourPracticed':
    case 'behaviourDemonstrated':
    case 'behaviourTransmitted':
      return event.id;
    case 'socialEncounter':
    case 'socialGroupFormed':
    case 'socialGroupJoined':
    case 'socialGroupLeft':
    case 'socialGroupDissolved':
    case 'cooperativeForaging':
    case 'foodShared':
    case 'socialGrooming':
    case 'socialConflict':
      return event.id;
  }
}

function interventionLabel(value: string): string {
  if (value === 'foodAvailability') return 'Food availability';
  if (value === 'waterAvailability') return 'Water availability';
  if (value === 'predatorPressure') return 'Predator pressure';
  return 'Drought';
}

export const milestoneCategories: readonly MilestoneCategory[] = [
  'discovery',
  'culture',
  'population',
  'migration',
  'environment',
  'extinction',
];
