import { lifeStageFor } from '@/simulation/agents/phenotype';
import type { EngineCheckpointV1 } from '@/simulation/checkpoints/engine-checkpoint';
import { behaviourTypes, traitNames } from '@/simulation/engine/types';

const predatorStates = new Set(['patrol', 'detect', 'chase', 'rest']);
const interventionStatuses = new Set(['scheduled', 'active', 'completed', 'cancelled']);

export class SimulationInvariantError extends Error {
  constructor(readonly failures: readonly string[]) {
    super(`Simulation invariant failure: ${failures.join('; ')}`);
    this.name = 'SimulationInvariantError';
  }
}

export function assertSimulationInvariants(
  checkpoint: EngineCheckpointV1,
  previous?: Pick<EngineCheckpointV1, 'tick' | 'generation'>,
): void {
  const failures: string[] = [];
  const { state } = checkpoint;
  if (previous && checkpoint.tick < previous.tick) failures.push('tick moved backwards');
  if (previous && checkpoint.generation < previous.generation)
    failures.push('generation moved backwards');
  if (checkpoint.generation > checkpoint.tick) failures.push('generation exceeds tick');
  findNonFinite(checkpoint, '$', failures);

  const agents = state.population;
  const ids = new Set<string>();
  const lineage = new Map(state.lineage.records.map((record) => [record.id, record]));
  const archived = new Map(state.deceasedAgentSnapshots);
  for (const agent of agents) {
    const path = `agent ${agent.id}`;
    if (ids.has(agent.id)) failures.push(`${path} has a duplicate ID`);
    ids.add(agent.id);
    if (!lineage.has(agent.id)) failures.push(`${path} is missing from lineage`);
    if (!Number.isInteger(agent.age) || agent.age < 0) failures.push(`${path} has invalid age`);
    if (agent.phenotype.lifeStage !== lifeStageFor(agent.age))
      failures.push(`${path} has inconsistent life stage`);
    if (!behaviourTypes.includes(agent.currentBehaviour))
      failures.push(`${path} has invalid behaviour`);
    if (
      !inside(agent.position.x, 0, state.world.width - 1) ||
      !inside(agent.position.y, 0, state.world.height - 1)
    )
      failures.push(`${path} is outside the world`);
    for (const trait of traitNames)
      if (!inside(agent.genome[trait], 0, 100)) failures.push(`${path} has invalid ${trait}`);
    for (const [name, value] of Object.entries({ ...agent.needs, health: agent.health }))
      if (!inside(value, 0, 100)) failures.push(`${path} has invalid ${name}`);
    if (agent.alive && agent.death) failures.push(`${path} is living with death metadata`);
    if (!agent.alive && !agent.death) failures.push(`${path} is dead without death metadata`);
    if (agent.death && agent.death.tick > checkpoint.tick)
      failures.push(`${path} dies after the current tick`);
    if (agent.memories.length > 13) failures.push(`${path} exceeds maximum memory capacity`);
    if (agent.relationships.length > checkpoint.config.memory.relationshipLimit)
      failures.push(`${path} exceeds relationship limit`);
    if (!inside(agent.carriedFood, 0, 12)) failures.push(`${path} has invalid carried food`);
    const relationshipIds = new Set<string>();
    for (const relationship of agent.relationships) {
      if (relationshipIds.has(relationship.agentId))
        failures.push(`${path} has duplicate relationship`);
      relationshipIds.add(relationship.agentId);
      if (!inside(relationship.familiarity, 0, 100) || !inside(relationship.trust, 0, 100))
        failures.push(`${path} has invalid familiarity or trust`);
      if (!inside(relationship.affinity, -100, 100)) failures.push(`${path} has invalid affinity`);
    }
    for (const learned of agent.learnedBehaviours) {
      if (!inside(learned.proficiency, 0, 100))
        failures.push(`${path} has invalid learning proficiency`);
      if (
        learned.practiceCount < 0 ||
        learned.successfulAttempts < 0 ||
        learned.failedAttempts < 0 ||
        learned.lastPracticedAtTick < learned.firstLearnedAtTick
      )
        failures.push(`${path} has invalid learning history`);
    }
    for (const opportunity of agent.learningOpportunities)
      if (
        opportunity.observationCount < 1 ||
        opportunity.attemptCount < 0 ||
        opportunity.failedAttempts < 0 ||
        opportunity.lastObservedAtTick < opportunity.firstObservedAtTick
      )
        failures.push(`${path} has invalid learning opportunity`);
    for (const parentId of agent.parents)
      if (!lineage.has(parentId)) failures.push(`${path} references missing parent ${parentId}`);
    for (const childId of agent.children) {
      const child = agents.find((candidate) => candidate.id === childId) ?? archived.get(childId);
      const childRecord = lineage.get(childId);
      if (!childRecord) failures.push(`${path} references missing child ${childId}`);
      else if (!childRecord.parentIds.includes(agent.id))
        failures.push(`${path} has inconsistent child ${childId}`);
      if (child && !child.parents.includes(agent.id))
        failures.push(`${path} disagrees with child ${childId}`);
    }
  }

  if (state.social) {
    const groupIds = new Set<string>();
    const memberships = new Set<string>();
    for (const group of state.social.groups) {
      if (groupIds.has(group.id)) failures.push(`duplicate social group ${group.id}`);
      groupIds.add(group.id);
      if (group.memberIds.length < 2 || group.memberIds.length > 8)
        failures.push(`social group ${group.id} has invalid size`);
      for (const memberId of group.memberIds) {
        if (memberships.has(memberId))
          failures.push(`${memberId} belongs to multiple social groups`);
        memberships.add(memberId);
        const member = agents.find((agent) => agent.id === memberId);
        if (member?.groupId !== group.id) failures.push(`${memberId} has inconsistent group ID`);
      }
    }
  }

  if (agents.filter((agent) => agent.alive).length > checkpoint.config.population.maximum)
    failures.push('living population exceeds configured maximum');
  if (state.world.tiles.length !== state.world.width * state.world.height)
    failures.push('world tile count is inconsistent');
  for (const [index, tile] of state.world.tiles.entries()) {
    if (!inside(tile.food, 0, tile.foodCapacity)) failures.push(`tile ${index} food is invalid`);
    if (!inside(tile.hardFood, 0, tile.hardFoodCapacity))
      failures.push(`tile ${index} hard food is invalid`);
    if (!inside(tile.water, 0, tile.waterCapacity)) failures.push(`tile ${index} water is invalid`);
  }
  for (const predator of state.predators) {
    if (!predatorStates.has(predator.state))
      failures.push(`predator ${predator.id} state is invalid`);
    if (
      !inside(predator.position.x, 0, state.world.width - 1) ||
      !inside(predator.position.y, 0, state.world.height - 1)
    )
      failures.push(`predator ${predator.id} is outside the world`);
    if (!inside(predator.stamina, 0, 100) || predator.restTicks < 0)
      failures.push(`predator ${predator.id} has invalid stamina or rest`);
  }
  for (const summary of state.history.summaries)
    for (const [behaviour, prevalence] of Object.entries(summary.behaviourPrevalence))
      if (!inside(prevalence, 0, 1))
        failures.push(`generation ${summary.generation} ${behaviour} prevalence is invalid`);
  for (const item of state.interventions.interventions) {
    if (!interventionStatuses.has(item.status))
      failures.push(`intervention ${item.id} status is invalid`);
    if (item.type === 'drought' ? item.value !== 1 : !inside(item.value, 0.5, 1.5))
      failures.push(`intervention ${item.id} value is invalid`);
  }
  // Active interventions are individually limited to 0.5–1.5, then composed by the
  // engine's documented clamp. Drought contributes a 0.4 water factor.
  if (!inside(state.world.interventionFoodMultiplier, 0.25, 2))
    failures.push('food intervention multiplier is invalid');
  if (!inside(state.world.interventionWaterMultiplier, 0.25, 2))
    failures.push('water intervention multiplier is invalid');
  if (!inside(state.world.predatorPressureMultiplier, 0.25, 2))
    failures.push('predator intervention multiplier is invalid');

  if (failures.length) throw new SimulationInvariantError(failures);
}

function inside(value: number, minimum: number, maximum: number): boolean {
  return (
    Number.isFinite(value) && value >= minimum - Number.EPSILON && value <= maximum + Number.EPSILON
  );
}

function findNonFinite(value: unknown, path: string, failures: string[]): void {
  if (typeof value === 'number' && !Number.isFinite(value)) {
    failures.push(`${path} contains a non-finite number`);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => findNonFinite(item, `${path}[${index}]`, failures));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value as Record<string, unknown>))
    findNonFinite(child, `${path}.${key}`, failures);
}
