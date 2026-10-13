import type { HomininSummary, HomininTrait } from '@/features/hominin/types';

export const mockHominins: HomininSummary[] = [
  { id: 'ara', name: 'Ara', generation: 12, age: 26, lifeStage: 'Adult', alive: true },
  { id: 'toma', name: 'Toma', generation: 12, age: 31, lifeStage: 'Adult', alive: true },
  { id: 'kiri', name: 'Kiri', generation: 13, age: 8, lifeStage: 'Juvenile', alive: true },
  { id: 'senu', name: 'Senu', generation: 11, age: 42, lifeStage: 'Adult', alive: false },
];

export const mockTraits: HomininTrait[] = [
  { name: 'Strength', value: 67 },
  { name: 'Speed', value: 54 },
  { name: 'Endurance', value: 74 },
  { name: 'Vision', value: 63 },
  { name: 'Memory', value: 71 },
  { name: 'Learning', value: 78 },
  { name: 'Social Awareness', value: 69 },
  { name: 'Curiosity', value: 84 },
];
