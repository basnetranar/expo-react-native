import type { PresentedEvent } from '@/features/simulation/types';
import { SIMULATION_ART } from '@/features/simulation/utils/simulation-assets';
import type { SimulationEvent } from '@/simulation';

const behaviourName = (behaviour: string) =>
  behaviour === 'stoneCracking' ? 'Stone cracking' : 'Social foraging';

export function presentEvent(event: SimulationEvent): PresentedEvent {
  switch (event.type) {
    case 'firstDiscovery':
      return {
        event,
        title: 'New Behaviour',
        description: `${behaviourName(event.behaviour)} has appeared in the population.`,
        category: 'discovery',
        artwork: event.behaviour === 'stoneCracking' ? SIMULATION_ART.stoneCracking : null,
      };
    case 'culturalThreshold':
      return {
        event,
        title: 'Tradition Spreading',
        description: `${behaviourName(event.behaviour)} is now ${event.stage} across the group.`,
        category: 'discovery',
        artwork: event.behaviour === 'stoneCracking' ? SIMULATION_ART.stoneCracking : null,
      };
    case 'populationBottleneck':
      return {
        event,
        title: 'Population Bottleneck',
        description: `Population fell from ${event.fromPopulation} to ${event.toPopulation}.`,
        category: 'warning',
        artwork: null,
      };
    case 'migrationDetected':
      return {
        event,
        title: 'Migration Detected',
        description: 'The population is moving into a new region.',
        category: 'migration',
        artwork: null,
      };
    case 'traditionLost':
      return {
        event,
        title: 'Tradition Lost',
        description: `${behaviourName(event.behaviour)} is no longer present.`,
        category: 'warning',
        artwork: null,
      };
    case 'scenarioPhase':
      return {
        event,
        title: event.phase === 'droughtStarted' ? 'Drought Begins' : 'Drought Ends',
        description:
          event.phase === 'droughtStarted'
            ? 'Water sources are receding across the world.'
            : 'Water sources are beginning to recover.',
        category: 'environment',
        artwork: null,
      };
    case 'environmentIntervention':
      return {
        event,
        title: `${interventionName(event.interventionType)} ${event.status}`,
        description: `Environmental intervention ${event.interventionId} was ${event.status} at tick ${event.tick}.`,
        category: 'environment',
        artwork: null,
      };
    case 'extinction':
      return {
        event,
        title: 'Population Extinct',
        description: 'No living hominins remain in this world.',
        category: 'warning',
        artwork: null,
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
        event,
        title: learningEventTitle(event.type),
        description: `${behaviourName(event.behaviour)} · generation ${event.generation}.`,
        category: event.type === 'behaviourLost' ? 'warning' : 'discovery',
        artwork: event.behaviour === 'stoneCracking' ? SIMULATION_ART.stoneCracking : null,
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
        event,
        title: socialEventTitle(event.type),
        description: `${event.participantIds.length} participant${event.participantIds.length === 1 ? '' : 's'} recorded at tick ${event.tick}.`,
        category: event.type === 'socialConflict' ? 'warning' : 'discovery',
        artwork: null,
      };
  }
}

export function deduplicateEvents(events: readonly SimulationEvent[]): SimulationEvent[] {
  const seen = new Set<string>();
  const selected: SimulationEvent[] = [];
  for (const event of [...events].reverse()) {
    const signature = eventSignature(event);
    if (seen.has(signature)) continue;
    seen.add(signature);
    selected.push(event);
  }
  return selected.reverse();
}

function eventSignature(event: SimulationEvent): string {
  switch (event.type) {
    case 'migrationDetected':
      return `${event.type}-${event.generation}`;
    case 'firstDiscovery':
    case 'culturalThreshold':
    case 'traditionLost':
      return `${event.type}-${event.generation}-${event.behaviour}`;
    case 'scenarioPhase':
      return `${event.type}-${event.phase}`;
    case 'environmentIntervention':
      return `${event.type}-${event.interventionId}-${event.status}`;
    case 'populationBottleneck':
      return `${event.type}-${event.generation}-${event.fromPopulation}-${event.toPopulation}`;
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

function learningEventTitle(type: string): string {
  const labels: Record<string, string> = {
    behaviourDiscovered: 'Behaviour Discovered',
    behaviourRediscovered: 'Behaviour Rediscovered',
    behaviourAcquired: 'Knowledge Acquired',
    behaviourTransmitted: 'Knowledge Transmitted',
    behaviourObserved: 'Behaviour Observed',
    imitationAttempted: 'Imitation Attempt',
    behaviourPracticed: 'Skill Practiced',
    behaviourDemonstrated: 'Behaviour Demonstrated',
    behaviourLost: 'Cultural Knowledge Lost',
  };
  return labels[type] ?? 'Learning Event';
}

function socialEventTitle(type: string): string {
  return type.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

function interventionName(value: string): string {
  if (value === 'foodAvailability') return 'Food availability';
  if (value === 'waterAvailability') return 'Water availability';
  if (value === 'predatorPressure') return 'Predator pressure';
  return 'Drought';
}
