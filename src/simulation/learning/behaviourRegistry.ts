import type { LearnedBehaviourType } from '@/simulation/engine/types';

export interface LearnableBehaviourDefinition {
  id: LearnedBehaviourType;
  name: string;
  category: 'toolUse' | 'foraging';
  description: string;
  baseDifficulty: number;
  observable: boolean;
  requiredResources: readonly ('stone' | 'hardFood' | 'food')[];
}

export const learnableBehaviours: Readonly<
  Record<LearnedBehaviourType, LearnableBehaviourDefinition>
> = {
  stoneCracking: {
    id: 'stoneCracking',
    name: 'Stone cracking',
    category: 'toolUse',
    description: 'Uses suitable stones to open hard food. Skill improves access efficiency.',
    baseDifficulty: 0.62,
    observable: true,
    requiredResources: ['stone', 'hardFood'],
  },
  socialForaging: {
    id: 'socialForaging',
    name: 'Social foraging',
    category: 'foraging',
    description: 'Uses reliable social information to find and gather food with others.',
    baseDifficulty: 0.42,
    observable: true,
    requiredResources: ['food'],
  },
};

export const learnableBehaviourTypes = Object.freeze(
  Object.keys(learnableBehaviours) as LearnedBehaviourType[],
);

export function behaviourDefinition(type: LearnedBehaviourType): LearnableBehaviourDefinition {
  return learnableBehaviours[type];
}
