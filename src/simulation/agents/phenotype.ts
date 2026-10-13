import { clamp } from '@/simulation/engine/math';
import type { Genome, LifeStage, Phenotype } from '@/simulation/engine/types';
import { traitNames } from '@/simulation/engine/types';

export function lifeStageFor(age: number): LifeStage {
  if (age < 14) return 'juvenile';
  if (age < 20) return 'youngAdult';
  if (age < 45) return 'adult';
  return 'old';
}

export function derivePhenotype(genome: Genome, age: number, health: number): Phenotype {
  const lifeStage = lifeStageFor(age);
  const development =
    lifeStage === 'juvenile'
      ? 0.72
      : lifeStage === 'youngAdult'
        ? 0.9
        : lifeStage === 'old'
          ? 0.78
          : 1;
  const condition = 0.5 + clamp(health) / 200;
  const values = {} as Record<(typeof traitNames)[number], number>;
  for (const trait of traitNames) values[trait] = clamp(genome[trait] * development * condition);
  const cognitiveAverage =
    (genome.memoryPotential +
      genome.learningAbility +
      genome.socialSensitivity +
      genome.vision * 0.35) /
    3.35;
  return {
    ...values,
    lifeStage,
    visionRange: 2 + (values.vision / 100) * 5,
    cognitiveCost: cognitiveAverage / 100,
  };
}
