import type {
  AgentDetailSnapshot,
  AgentInspectorSnapshot,
  AgentSnapshot,
  GenerationSummary,
  Hominin,
  PopulationAgentSnapshot,
} from '@/simulation/engine/types';

export function snapshotAgent(agent: Hominin): AgentSnapshot {
  return {
    id: agent.id,
    generation: agent.generation,
    position: { ...agent.position },
    age: agent.age,
    health: agent.health,
    needs: { ...agent.needs },
    phenotype: { ...agent.phenotype },
    currentBehaviour: agent.currentBehaviour,
    learnedBehaviours: agent.learnedBehaviours.map((item) => ({ ...item })),
  };
}

export function snapshotPopulationAgent(agent: Hominin): PopulationAgentSnapshot {
  return {
    ...snapshotAgent(agent),
    genome: { ...agent.genome },
  };
}

export function snapshotAgentDetail(agent: Hominin): AgentDetailSnapshot {
  return {
    ...snapshotAgent(agent),
    traits: {
      memoryPotential: agent.genome.memoryPotential,
      learningAbility: agent.genome.learningAbility,
      curiosity: agent.genome.curiosity,
      socialSensitivity: agent.genome.socialSensitivity,
    },
    childrenCount: agent.children.length,
    groupId: agent.groupId,
  };
}

export function snapshotAgentInspector(agent: Hominin): AgentInspectorSnapshot {
  return {
    ...snapshotAgent(agent),
    alive: agent.alive,
    genome: { ...agent.genome },
    memories: agent.memories.map((memory) => ({
      ...memory,
      ...(memory.position ? { position: { ...memory.position } } : {}),
    })),
    relationships: agent.relationships.map((relationship) => ({ ...relationship })),
    actionPreferences: { ...agent.actionPreferences },
    parents: [...agent.parents],
    children: [...agent.children],
    carriedFood: agent.carriedFood,
    groupId: agent.groupId,
    socialEvents: [],
    learningOpportunities: agent.learningOpportunities.map((item) => ({ ...item })),
    learningEvents: [],
    ...(agent.death
      ? {
          death: {
            ...agent.death,
            position: { ...agent.death.position },
            keyTraits: { ...agent.death.keyTraits },
          },
        }
      : {}),
  };
}

export function cloneAgentInspector(snapshot: AgentInspectorSnapshot): AgentInspectorSnapshot {
  return {
    ...snapshot,
    position: { ...snapshot.position },
    needs: { ...snapshot.needs },
    phenotype: { ...snapshot.phenotype },
    learnedBehaviours: snapshot.learnedBehaviours.map((behaviour) => ({ ...behaviour })),
    genome: { ...snapshot.genome },
    memories: snapshot.memories.map((memory) => ({
      ...memory,
      ...(memory.position ? { position: { ...memory.position } } : {}),
    })),
    relationships: snapshot.relationships.map((relationship) => ({ ...relationship })),
    actionPreferences: { ...snapshot.actionPreferences },
    parents: [...snapshot.parents],
    children: [...snapshot.children],
    socialEvents: snapshot.socialEvents.map((event) => ({
      ...event,
      participantIds: [...event.participantIds],
    })),
    learningOpportunities: snapshot.learningOpportunities.map((item) => ({ ...item })),
    learningEvents: snapshot.learningEvents.map((event) => ({ ...event })),
    ...(snapshot.death
      ? {
          death: {
            ...snapshot.death,
            position: { ...snapshot.death.position },
            keyTraits: { ...snapshot.death.keyTraits },
          },
        }
      : {}),
  };
}

export function cloneAgent(agent: Hominin): Hominin {
  return {
    ...agent,
    position: { ...agent.position },
    needs: { ...agent.needs },
    phenotype: { ...agent.phenotype },
    memories: agent.memories.map((item) => ({
      ...item,
      ...(item.position ? { position: { ...item.position } } : {}),
    })),
    relationships: agent.relationships.map((item) => ({ ...item })),
    learnedBehaviours: agent.learnedBehaviours.map((item) => ({ ...item })),
    learningOpportunities: agent.learningOpportunities.map((item) => ({ ...item })),
    actionPreferences: { ...agent.actionPreferences },
    parents: [...agent.parents],
    children: [...agent.children],
    ...(agent.death
      ? {
          death: {
            ...agent.death,
            position: { ...agent.death.position },
            keyTraits: { ...agent.death.keyTraits },
          },
        }
      : {}),
  };
}

export function cloneSummary(summary: GenerationSummary): GenerationSummary {
  return {
    ...summary,
    deathCauses: { ...summary.deathCauses },
    averageGenome: { ...summary.averageGenome },
    averagePhenotype: { ...summary.averagePhenotype },
    behaviourPrevalence: { ...summary.behaviourPrevalence },
    environment: { ...summary.environment },
    lifeStages: { ...summary.lifeStages },
    reproduction: {
      ...summary.reproduction,
      failures: { ...summary.reproduction.failures },
    },
    resources: { ...summary.resources },
    tools: { ...summary.tools },
    migration: {
      ...summary.migration,
      centroid: { ...summary.migration.centroid },
      regionalOccupancy: { ...summary.migration.regionalOccupancy },
    },
  };
}
