import { derivePhenotype } from '@/simulation/agents/phenotype';
import { SeededRng } from '@/simulation/engine/seededRng';
import type { DeathCause, Hominin } from '@/simulation/engine/types';

export function ageAgent(agent: Hominin, rng: SeededRng): DeathCause | null {
  agent.age += 1;
  agent.phenotype = derivePhenotype(agent.genome, agent.age, agent.health);
  const ageRisk = agent.age > 48 ? Math.min(0.7, (agent.age - 48) * 0.018) : 0;
  return rng.chance(ageRisk) ? 'age' : null;
}

export function markDead(agent: Hominin, cause: DeathCause, tick: number, context?: string): void {
  if (!agent.alive) return;
  agent.alive = false;
  agent.death = {
    cause,
    tick,
    age: agent.age,
    generation: agent.generation,
    position: { ...agent.position },
    keyTraits: {
      speed: agent.genome.speed,
      endurance: agent.genome.endurance,
      metabolicEfficiency: agent.genome.metabolicEfficiency,
      learningAbility: agent.genome.learningAbility,
    },
    ...(context ? { context } : {}),
  };
}
