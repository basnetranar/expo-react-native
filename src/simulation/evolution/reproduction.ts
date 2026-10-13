import { createHominin } from '@/simulation/agents/Hominin';
import { distance } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Hominin, ReproductionFailureReason } from '@/simulation/engine/types';
import { inheritGenome } from '@/simulation/evolution/inheritance';

export interface ReproductionResult {
  births: Hominin[];
  attempts: number;
  failures: Record<ReproductionFailureReason, number>;
  parentAgeTotal: number;
  reproducingParents: number;
}

const emptyFailures = (): Record<ReproductionFailureReason, number> => ({
  energy: 0,
  hydration: 0,
  health: 0,
  cooldown: 0,
  partner: 0,
  capacity: 0,
});

export function canReproduce(agent: Hominin, config: SimulationConfig): boolean {
  return agent.alive && !conditionFailure(agent, config);
}

export function reproducePopulation(options: {
  population: Hominin[];
  generation: number;
  tick: number;
  rng: SeededRng;
  config: SimulationConfig;
  nextId: () => string;
  chance: number;
}): ReproductionResult {
  const { population, generation, tick, rng, config, nextId, chance } = options;
  const result: ReproductionResult = {
    births: [],
    attempts: 0,
    failures: emptyFailures(),
    parentAgeTotal: 0,
    reproducingParents: 0,
  };
  const paired = new Set<string>();
  for (const first of population) {
    if (!first.alive || paired.has(first.id)) continue;
    const ageFactor = fertilityFactor(first.age, config);
    if (ageFactor === 0 || !rng.chance(chance * ageFactor)) continue;
    result.attempts += 1;
    if (population.length + result.births.length >= config.population.maximum) {
      result.failures.capacity += 1;
      continue;
    }
    const failure = conditionFailure(first, config);
    if (failure) {
      result.failures[failure] += 1;
      continue;
    }
    if (isOnCooldown(first, tick, config)) {
      result.failures.cooldown += 1;
      continue;
    }
    const partner = population.find(
      (candidate) =>
        candidate.id !== first.id &&
        !paired.has(candidate.id) &&
        canReproduce(candidate, config) &&
        !isOnCooldown(candidate, tick, config) &&
        (distance(first.position, candidate.position) <= config.reproduction.localPartnerRadius ||
          first.homeRegion === candidate.homeRegion),
    );
    if (!partner) {
      result.failures.partner += 1;
      continue;
    }
    paired.add(first.id);
    paired.add(partner.id);
    const child = createHominin({
      id: nextId(),
      generation,
      position: { ...first.position },
      genome: inheritGenome(first.genome, partner.genome, rng, config),
      age: 0,
      parents: [first.id, partner.id],
    });
    child.needs = { energy: 76, hydration: 78, safety: 84 };
    first.children.push(child.id);
    partner.children.push(child.id);
    first.needs.energy -= config.reproduction.parentEnergyCost;
    partner.needs.energy -= config.reproduction.parentEnergyCost;
    first.lastBirthTick = tick;
    partner.lastBirthTick = tick;
    result.parentAgeTotal += first.age + partner.age;
    result.reproducingParents += 2;
    result.births.push(child);
  }
  return result;
}

export function fertilityFactor(age: number, config: SimulationConfig): number {
  const { minimumAge, maximumAge, peakAgeStart, peakAgeEnd } = config.reproduction;
  if (age < minimumAge || age > maximumAge) return 0;
  if (age < peakAgeStart)
    return 0.55 + ((age - minimumAge) / Math.max(1, peakAgeStart - minimumAge)) * 0.45;
  if (age <= peakAgeEnd) return 1;
  return 1 - ((age - peakAgeEnd) / Math.max(1, maximumAge - peakAgeEnd)) * 0.7;
}

function conditionFailure(
  agent: Hominin,
  config: SimulationConfig,
): 'energy' | 'hydration' | 'health' | null {
  if (agent.age < config.reproduction.minimumAge || agent.age > config.reproduction.maximumAge)
    return 'health';
  if (agent.needs.energy <= config.reproduction.energy) return 'energy';
  if (agent.needs.hydration <= config.reproduction.hydration) return 'hydration';
  if (agent.health <= config.reproduction.health) return 'health';
  return null;
}

function isOnCooldown(agent: Hominin, tick: number, config: SimulationConfig): boolean {
  return (
    agent.lastBirthTick !== null &&
    tick - agent.lastBirthTick <
      config.reproduction.birthSpacingGenerations * config.time.ticksPerGeneration
  );
}
