import type { LifeStage, Terrain } from '@/simulation';

export const TERRAIN_ASSETS: Record<Terrain, number> = {
  plains: require('../../../../assets/terrain-plains.png'),
  scrub: require('../../../../assets/terrain-scrub.png'),
  riverbank: require('../../../../assets/terrain-riverbank.png'),
  rocky: require('../../../../assets/terrain-rocky.png'),
};

export const HOMININ_ASSETS: Record<LifeStage, readonly number[]> = {
  juvenile: [
    require('../../../../assets/hominins/hominin-juvenile.png'),
    require('../../../../assets/hominins/hominin-juvenile-02.png'),
  ],
  youngAdult: [
    require('../../../../assets/hominins/hominin-young-adult.png'),
    require('../../../../assets/hominins/hominin-young-adult-02.png'),
  ],
  adult: [
    require('../../../../assets/hominins/hominin-adult.png'),
    require('../../../../assets/hominins/hominin-adult-02.png'),
    require('../../../../assets/hominins/hominin-adult-03.png'),
  ],
  old: [
    require('../../../../assets/hominins/hominin-old.png'),
    require('../../../../assets/hominins/hominin-old-02.png'),
  ],
};

export const PREDATOR_ASSETS = [
  require('../../../../assets/predator-savannah.png'),
  require('../../../../assets/predator-savannah-02.png'),
] as const;

export const RESOURCE_ASSETS = {
  food: require('../../../../assets/food-resource.png'),
  water: require('../../../../assets/water-source.png'),
  stone: require('../../../../assets/stone-resource.png'),
} as const;

export const SIMULATION_ART = {
  world: require('../../../../assets/world-savannah-background.png'),
  stoneCracking: require('../../../../assets/event-stone-cracking.png'),
  portrait: require('../../../../assets/hominins/hominin-portrait-adult.png'),
} as const;

export const SOCIAL_ART = {
  hero: require('../../../../assets/social-group-hero.png'),
  foraging: require('../../../../assets/social-group-foraging.png'),
  sharing: require('../../../../assets/social-food-sharing.png'),
  grooming: require('../../../../assets/social-grooming.png'),
  portrait: require('../../../../assets/hominins/hominin-portrait-adult.png'),
} as const;
