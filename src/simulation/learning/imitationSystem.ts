import { clamp, distance } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type {
  AcquisitionSource,
  Hominin,
  LearnedBehaviour,
  LearnedBehaviourType,
  World,
} from '@/simulation/engine/types';
import { behaviourDefinition } from '@/simulation/learning/behaviourRegistry';
import { getTile } from '@/simulation/world/World';

export interface LearningInteraction {
  behaviour: LearnedBehaviourType;
  observerId: string;
  sourceAgentId: string;
  groupId?: string;
  observed: boolean;
  demonstrated: boolean;
  attempted: boolean;
  acquired: boolean;
  source: AcquisitionSource;
  observationCount: number;
  firstDemonstration: boolean;
}

export function imitateNearby(
  population: readonly Hominin[],
  nearbyFor: (agent: Hominin) => readonly Hominin[],
  world: World,
  rng: SeededRng,
  tick: number,
  config: SimulationConfig,
): LearningInteraction[] {
  const interactions: LearningInteraction[] = [];
  for (const observer of [...population].sort((a, b) => a.id.localeCompare(b.id))) {
    if (!canObserve(observer, config)) continue;
    const demonstrator = [...nearbyFor(observer)]
      .filter(
        (other) =>
          other.alive &&
          other.id !== observer.id &&
          distance(observer.position, other.position) <= config.learning.observationRadius &&
          other.demonstratedBehaviour !== null &&
          other.demonstrableSuccess > 0,
      )
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, config.learning.observationCandidateLimit)[0];
    if (!demonstrator?.demonstratedBehaviour) continue;
    const behaviour = demonstrator.learnedBehaviours.find(
      (item) => item.type === demonstrator.demonstratedBehaviour,
    );
    if (!behaviour || !behaviourDefinition(behaviour.type).observable) continue;
    const relationship = observer.relationships.find((item) => item.agentId === demonstrator.id);
    const socialInfluence =
      (relationship?.trust ?? 0) +
      (relationship?.familiarity ?? 0) * 0.5 +
      (relationship?.kinship ?? 0) * 30 +
      (observer.groupId !== null && observer.groupId === demonstrator.groupId ? 10 : 0);
    const teaching =
      (relationship?.familiarity ?? 0) >= config.learning.teachingFamiliarity &&
      socialInfluence >= config.learning.teachingTrust &&
      behaviour.proficiency >= config.learning.teachingProficiency;
    const existing = observer.learningOpportunities.find(
      (item) => item.behaviour === behaviour.type && item.sourceAgentId === demonstrator.id,
    );
    const wasDemonstrated = existing?.demonstrated ?? false;
    if (existing) {
      existing.lastObservedAtTick = tick;
      existing.observationCount += 1;
      existing.demonstrated ||= teaching;
    } else {
      observer.learningOpportunities.push({
        behaviour: behaviour.type,
        sourceAgentId: demonstrator.id,
        firstObservedAtTick: tick,
        lastObservedAtTick: tick,
        observationCount: 1,
        attemptCount: 0,
        failedAttempts: 0,
        demonstrated: teaching,
      });
    }
    const opportunity = existing ?? observer.learningOpportunities.at(-1)!;
    const alreadyKnown = observer.learnedBehaviours.some((item) => item.type === behaviour.type);
    const resourcesAvailable = hasRequiredResources(observer, behaviour.type, world);
    const attempted =
      !alreadyKnown &&
      resourcesAvailable &&
      rng.chance(Math.min(0.55, 0.28 + opportunity.observationCount * 0.03));
    let acquired = false;
    if (attempted) {
      opportunity.attemptCount += 1;
      const clarity =
        (behaviour.proficiency / 100) * 0.55 + (demonstrator.demonstrableSuccess / 100) * 0.45;
      const probability = clamp(
        observer.phenotype.learningAbility * 0.0025 +
          observer.phenotype.dexterity * (behaviour.type === 'stoneCracking' ? 0.0015 : 0.0005) +
          observer.phenotype.socialSensitivity * 0.0015 +
          clarity * 0.22 +
          Math.min(0.12, opportunity.observationCount * 0.015) +
          (teaching ? 0.1 : 0),
        0,
        0.72,
      );
      acquired = rng.chance(probability);
      if (acquired) {
        const learned: LearnedBehaviour = {
          type: behaviour.type,
          proficiency: clamp(config.learning.imitationBaseProficiency + rng.range(-4, 4)),
          reinforcement: 1,
          learnedFrom: demonstrator.id,
          firstLearnedAtTick: tick,
          acquisitionSource: teaching ? 'teaching' : 'imitation',
          practiceCount: 1,
          successfulAttempts: 1,
          failedAttempts: opportunity.failedAttempts,
          lastPracticedAtTick: tick,
        };
        observer.learnedBehaviours.push(learned);
      } else opportunity.failedAttempts += 1;
    }
    interactions.push({
      behaviour: behaviour.type,
      observerId: observer.id,
      sourceAgentId: demonstrator.id,
      ...(observer.groupId ? { groupId: observer.groupId } : {}),
      observed: true,
      demonstrated: teaching,
      attempted,
      acquired,
      source: teaching ? 'teaching' : 'imitation',
      observationCount: opportunity.observationCount,
      firstDemonstration: teaching && !wasDemonstrated,
    });
  }
  return interactions;
}

function canObserve(agent: Hominin, config: SimulationConfig): boolean {
  return (
    agent.alive &&
    (agent.currentBehaviour === 'observe' || agent.currentBehaviour === 'follow') &&
    agent.needs.energy > config.learning.minimumObservationEnergy &&
    agent.needs.hydration > config.learning.minimumObservationHydration &&
    agent.needs.safety > config.learning.minimumObservationSafety
  );
}

function hasRequiredResources(agent: Hominin, type: LearnedBehaviourType, world: World): boolean {
  const tile = getTile(world, agent.position);
  return type === 'stoneCracking'
    ? tile.objects.includes('stone') && tile.hardFood > 0
    : tile.food + tile.hardFood > 0;
}
