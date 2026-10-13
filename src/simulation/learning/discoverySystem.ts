import { clamp } from '@/simulation/engine/math';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { SimulationConfig } from '@/simulation/engine/simulationConfig';
import type { Hominin, LearnedBehaviour, World } from '@/simulation/engine/types';
import { getTile } from '@/simulation/world/World';

export function attemptStoneDiscovery(
  agent: Hominin,
  world: World,
  tick: number,
  rng: SeededRng,
  config: SimulationConfig,
): { eligible: boolean; discovered: boolean } {
  if (agent.learnedBehaviours.some((item) => item.type === 'stoneCracking'))
    return { eligible: false, discovered: false };
  const tile = getTile(world, agent.position);
  const eligible =
    tile.hardFood > 0 &&
    tile.objects.includes('stone') &&
    agent.needs.energy > config.discovery.minimumEnergy &&
    agent.needs.safety > config.discovery.minimumSafety &&
    agent.phenotype.dexterity > config.discovery.minimumDexterity &&
    agent.phenotype.curiosity > config.discovery.minimumCuriosity &&
    agent.phenotype.learningAbility > config.discovery.minimumLearning;
  if (!eligible) return { eligible: false, discovered: false };
  const modifiers =
    (agent.phenotype.dexterity / 100) *
    (agent.phenotype.curiosity / 100) *
    (agent.phenotype.learningAbility / 100);
  if (!rng.chance(config.discovery.stoneBaseChance * modifiers))
    return { eligible: true, discovered: false };
  const learned: LearnedBehaviour = {
    type: 'stoneCracking',
    proficiency: clamp(12 + agent.phenotype.dexterity * 0.08),
    reinforcement: 1,
    firstLearnedAtTick: tick,
    acquisitionSource: 'experimentation',
    practiceCount: 1,
    successfulAttempts: 1,
    failedAttempts: 0,
    lastPracticedAtTick: tick,
  };
  agent.learnedBehaviours.push(learned);
  return { eligible: true, discovered: true };
}

export function reinforceSocialForaging(agent: Hominin, benefited: boolean, tick: number): boolean {
  if (agent.currentBehaviour !== 'follow' || !benefited) return false;
  const existing = agent.learnedBehaviours.find((item) => item.type === 'socialForaging');
  if (existing) {
    existing.reinforcement += 1;
    existing.proficiency = clamp(existing.proficiency + 1.5);
    return false;
  }
  if (agent.relationships.some((relationship) => relationship.followBenefits >= 3)) {
    agent.learnedBehaviours.push({
      type: 'socialForaging',
      proficiency: 18,
      reinforcement: 1,
      firstLearnedAtTick: tick,
      acquisitionSource: 'experience',
      practiceCount: 3,
      successfulAttempts: 3,
      failedAttempts: 0,
      lastPracticedAtTick: tick,
    });
    return true;
  }
  return false;
}
