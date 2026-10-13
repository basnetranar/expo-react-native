import type {
  HomininInspectorViewModel,
  InspectorHistoryItem,
  InspectorRelatedPerson,
  InspectorTrait,
} from '@/features/hominin/types';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import type { AgentInspectorSnapshot, BehaviourType, Genome, MemoryRecord } from '@/simulation';

type Resolver = (id: string) => AgentInspectorSnapshot | null;

const traitDefinitions: readonly {
  key: keyof Genome;
  label: string;
  explanation: string;
}[] = [
  { key: 'strength', label: 'Strength', explanation: 'Inherited potential for physical power.' },
  { key: 'speed', label: 'Speed', explanation: 'Inherited potential for rapid movement.' },
  { key: 'endurance', label: 'Endurance', explanation: 'Inherited capacity for sustained effort.' },
  {
    key: 'dexterity',
    label: 'Dexterity',
    explanation: 'Inherited potential for precise handling.',
  },
  {
    key: 'vision',
    label: 'Vision',
    explanation: 'Inherited sensory potential for seeing farther.',
  },
  {
    key: 'metabolicEfficiency',
    label: 'Metabolic efficiency',
    explanation: 'Inherited efficiency in managing energy and hydration.',
  },
  {
    key: 'memoryPotential',
    label: 'Memory potential',
    explanation: 'Inherited capacity to retain useful experiences.',
  },
  {
    key: 'learningAbility',
    label: 'Learning ability',
    explanation: 'Inherited potential to learn from outcomes and observation.',
  },
  {
    key: 'socialSensitivity',
    label: 'Social sensitivity',
    explanation: 'Inherited responsiveness to nearby individuals and social information.',
  },
  {
    key: 'curiosity',
    label: 'Curiosity',
    explanation: 'Inherited tendency to explore uncertain opportunities.',
  },
];

export function formatTraitValue(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatBehaviour(value: string): string {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

export function createHomininInspectorViewModel(
  snapshot: AgentInspectorSnapshot,
  resolve: Resolver,
): HomininInspectorViewModel {
  const related = (id: string, detail: string): InspectorRelatedPerson => {
    const record = resolve(id);
    return {
      id,
      name: getFriendlyName(id),
      detail: record
        ? `${formatStage(record.phenotype.lifeStage)} · Gen ${record.generation}`
        : detail,
      available: Boolean(record),
    };
  };
  const traits: InspectorTrait[] = traitDefinitions.map((definition) => ({
    ...definition,
    value: formatTraitValue(snapshot.genome[definition.key]),
  }));
  const learnedBehaviours = snapshot.learnedBehaviours
    .map((behaviour) => ({
      key: `${behaviour.type}-${behaviour.firstLearnedAtTick}`,
      label: formatBehaviour(behaviour.type),
      proficiency: formatTraitValue(behaviour.proficiency),
      reinforcement: behaviour.reinforcement,
      learnedAtTick: behaviour.firstLearnedAtTick,
      acquisitionSource: behaviour.acquisitionSource,
      practiceCount: behaviour.practiceCount,
      successfulAttempts: behaviour.successfulAttempts,
      failedAttempts: behaviour.failedAttempts,
      lastPracticedAtTick: behaviour.lastPracticedAtTick,
      learnedFrom: behaviour.learnedFrom
        ? related(behaviour.learnedFrom, 'Teacher record unavailable')
        : null,
    }))
    .sort((first, second) => first.learnedAtTick - second.learnedAtTick);
  const preferences = (Object.entries(snapshot.actionPreferences) as [BehaviourType, number][])
    .filter(([, value]) => Math.abs(value) >= 0.05)
    .map(([behaviour, value]) => ({
      key: behaviour,
      label: formatBehaviour(behaviour),
      value: Number(value.toFixed(1)),
      direction: value >= 0 ? ('favoured' as const) : ('avoided' as const),
    }))
    .sort((first, second) => Math.abs(second.value) - Math.abs(first.value));
  const history = createLifeHistory(snapshot);
  return {
    id: snapshot.id,
    name: getFriendlyName(snapshot.id),
    generation: snapshot.generation,
    age: snapshot.age,
    lifeStage: formatStage(snapshot.phenotype.lifeStage),
    alive: snapshot.alive,
    statusLabel: snapshot.alive ? 'Living · live state' : 'Deceased · final recorded state',
    behaviour: formatBehaviour(snapshot.currentBehaviour),
    needs: {
      energy: snapshot.needs.energy,
      hydration: snapshot.needs.hydration,
      health: snapshot.health,
      safety: snapshot.needs.safety,
    },
    traits,
    learnedBehaviours,
    preferences,
    parents: snapshot.parents.map((id) => related(id, 'Parent record unavailable')),
    children: snapshot.children.map((id) => related(id, 'Child record unavailable')),
    socialConnections: snapshot.relationships
      .map((relationship) => ({
        ...related(relationship.agentId, 'Connection record unavailable'),
        familiarity: relationship.familiarity,
        trust: relationship.trust,
        kinship: relationship.kinship,
        observedSuccess: relationship.observedSuccess,
        followBenefits: relationship.followBenefits,
        affinity: relationship.affinity,
        interactionCount: relationship.interactionCount,
        cooperationCount: relationship.cooperationCount,
        sharingCount: relationship.sharingCount,
        groomingCount: relationship.groomingCount,
      }))
      .sort(
        (first, second) =>
          second.familiarity +
          second.trust +
          second.kinship * 100 -
          (first.familiarity + first.trust + first.kinship * 100),
      ),
    history,
    retainedMemoryCount: snapshot.memories.length,
    deathDetail: snapshot.death
      ? `${formatBehaviour(snapshot.death.cause)} at tick ${snapshot.death.tick}, age ${snapshot.death.age.toFixed(1)}.`
      : null,
    groupId: snapshot.groupId,
    carriedFood: snapshot.carriedFood,
  };
}

function createLifeHistory(snapshot: AgentInspectorSnapshot): InspectorHistoryItem[] {
  const memories = snapshot.memories.map((memory) => memoryHistory(memory));
  const learning: InspectorHistoryItem[] = snapshot.learnedBehaviours.map((behaviour) => ({
    key: `learned-${behaviour.type}-${behaviour.firstLearnedAtTick}`,
    tick: behaviour.firstLearnedAtTick,
    title: `Learned ${formatBehaviour(behaviour.type)}`,
    description: behaviour.learnedFrom
      ? `Acquired through observation of ${getFriendlyName(behaviour.learnedFrom)} (${behaviour.learnedFrom}).`
      : 'Acquired through this individual’s recorded experience.',
    tone: 'learning',
  }));
  const death: InspectorHistoryItem[] = snapshot.death
    ? [
        {
          key: `death-${snapshot.death.tick}`,
          tick: snapshot.death.tick,
          title: `Died from ${formatBehaviour(snapshot.death.cause)}`,
          description: snapshot.death.context ?? 'No additional context was recorded.',
          tone: 'death',
        },
      ]
    : [];
  const social: InspectorHistoryItem[] = snapshot.socialEvents.map((event) => ({
    key: event.id,
    tick: event.tick,
    title: formatBehaviour(event.type),
    description: `Recorded with ${
      event.participantIds
        .filter((id) => id !== snapshot.id)
        .map(getFriendlyName)
        .join(', ') || 'no other retained participant'
    }.`,
    tone: 'experience',
  }));
  return [...memories, ...learning, ...social, ...death].sort(
    (first, second) => first.tick - second.tick || first.key.localeCompare(second.key),
  );
}

function memoryHistory(memory: MemoryRecord): InspectorHistoryItem {
  const subject = memory.subjectId
    ? ` involving ${getFriendlyName(memory.subjectId)} (${memory.subjectId})`
    : '';
  return {
    key: `memory-${memory.id}-${memory.createdAtTick}`,
    tick: memory.createdAtTick,
    title: `Formed ${formatBehaviour(memory.type)} memory`,
    description: `A retained memory${subject}; last reinforced at tick ${memory.lastReinforcedTick}.`,
    tone: 'experience',
  };
}

function formatStage(value: string): string {
  return value === 'youngAdult'
    ? 'Young Adult'
    : `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}
