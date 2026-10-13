import type {
  BehaviourCultureViewModel,
  LearningEventViewModel,
  LearningOverviewViewModel,
  LearningPersonViewModel,
} from '@/features/learning/types';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import type { CulturalSnapshot, LearningEvent } from '@/simulation';
import { behaviourDefinition } from '@/simulation/learning/behaviourRegistry';

export function createLearningOverview(source: CulturalSnapshot): LearningOverviewViewModel {
  const behaviours = source.behaviours.map<BehaviourCultureViewModel>((item) => {
    const definition = behaviourDefinition(item.behaviour);
    const practitioners = item.practitioners.map<LearningPersonViewModel>((agent) => {
      const learned = agent.learnedBehaviours.find((entry) => entry.type === item.behaviour)!;
      return {
        id: agent.id,
        name: getFriendlyName(agent.id),
        generation: agent.generation,
        age: agent.age,
        groupId: agent.groupId,
        proficiency: Math.round(learned.proficiency),
        acquisitionSource: learned.acquisitionSource,
        ...(learned.learnedFrom
          ? { learnedFrom: { id: learned.learnedFrom, name: getFriendlyName(learned.learnedFrom) } }
          : {}),
        firstLearnedAtTick: learned.firstLearnedAtTick,
        practiceCount: learned.practiceCount,
        successfulAttempts: learned.successfulAttempts,
        failedAttempts: learned.failedAttempts,
      };
    });
    return {
      id: item.behaviour,
      name: definition.name,
      description: definition.description,
      category: definition.category === 'toolUse' ? 'Tool use' : 'Foraging',
      historicallyDiscovered: item.historicallyDiscovered,
      currentlyKnown: item.currentlyKnown,
      status: item.currentlyKnown ? 'known' : item.historicallyDiscovered ? 'lost' : 'unknown',
      practitioners,
      adoptionPercent: Math.round(item.adoption * 100),
      averageProficiency: Math.round(item.averageProficiency),
      highestProficiency: Math.round(item.highestProficiency),
      groups: { ...item.groups },
      ...(item.firstDiscovery ? { firstDiscovery: presentEvent(item.firstDiscovery) } : {}),
      events: item.events.map(presentEvent).sort(newestFirst),
    };
  });
  const knowledgeable = new Set(behaviours.flatMap((item) => item.practitioners.map((p) => p.id)));
  return {
    tick: source.currentTick,
    generation: source.currentGeneration,
    population: source.population,
    knownCount: behaviours.filter((item) => item.currentlyKnown).length,
    historicalCount: behaviours.filter((item) => item.historicallyDiscovered).length,
    knowledgeableIndividuals: knowledgeable.size,
    behaviours,
    events: source.events.map(presentEvent).sort(newestFirst),
    milestones: source.milestones.map(presentEvent).sort(newestFirst),
    summaries: source.summaries,
    historyLimited: source.retention.summariesDiscarded > 0,
  };
}

export function presentEvent(event: LearningEvent): LearningEventViewModel {
  const behaviour = behaviourDefinition(event.behaviour).name;
  const actor = event.agentId ? getFriendlyName(event.agentId) : null;
  const source = event.sourceAgentId ? getFriendlyName(event.sourceAgentId) : null;
  const labels: Record<LearningEvent['type'], string> = {
    behaviourDiscovered: `${behaviour} discovered`,
    behaviourObserved: `${behaviour} observed`,
    imitationAttempted: `${behaviour} imitation attempted`,
    behaviourAcquired: `${behaviour} acquired`,
    behaviourPracticed: `${behaviour} practiced`,
    behaviourDemonstrated: `${behaviour} demonstrated`,
    behaviourTransmitted: `${behaviour} transmitted`,
    behaviourLost: `${behaviour} lost`,
    behaviourRediscovered: `${behaviour} rediscovered`,
  };
  return {
    id: event.id,
    type: event.type,
    title: labels[event.type],
    detail: [actor, source ? `from ${source}` : null, event.outcome].filter(Boolean).join(' · '),
    tick: event.tick,
    generation: event.generation,
    behaviour: event.behaviour,
    ...(event.agentId ? { agentId: event.agentId } : {}),
    ...(event.sourceAgentId ? { sourceAgentId: event.sourceAgentId } : {}),
    ...(event.groupId ? { groupId: event.groupId } : {}),
    ...(event.outcome ? { outcome: event.outcome } : {}),
  };
}

function newestFirst(a: LearningEventViewModel, b: LearningEventViewModel): number {
  return b.tick - a.tick || b.id.localeCompare(a.id);
}
