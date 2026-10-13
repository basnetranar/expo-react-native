import type { CultureStage, Hominin, LearnedBehaviourType } from '@/simulation/engine/types';

export function behaviourPrevalence(
  population: readonly Hominin[],
  type: LearnedBehaviourType,
): number {
  const alive = population.filter((agent) => agent.alive);
  if (alive.length === 0) return 0;
  return (
    alive.filter((agent) => agent.learnedBehaviours.some((item) => item.type === type)).length /
    alive.length
  );
}

export function classifyCulture(count: number, population: number): CultureStage {
  if (count === 0 || population === 0) return 'absent';
  if (count === 1) return 'innovation';
  const prevalence = count / population;
  if (prevalence < 0.1) return 'observed';
  if (prevalence < 0.25) return 'spreading';
  if (prevalence < 0.5) return 'cultural';
  return 'established';
}
