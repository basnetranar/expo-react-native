import type { Href } from 'expo-router';

export const routes = {
  lab: '/lab' as const,
  onboarding: '/onboarding' as const,
  createWorld: '/world/create' as const,
  worldOverview: '/world/overview' as const,
  simulation: '/simulation' as const,
  evolutionTimeline: '/evolution/timeline' as const,
  evolutionGeneration: (generation: number): Href => ({
    pathname: '/evolution/generation/[generation]',
    params: { generation: String(generation) },
  }),
  population: '/population' as const,
  lineage: (id?: string): Href => (id ? { pathname: '/lineage', params: { id } } : '/lineage'),
  experiments: '/experiments' as const,
  histories: '/histories' as const,
  social: '/social' as const,
  socialGroup: (id: string): Href => ({ pathname: '/social/group/[id]', params: { id } }),
  socialRelationships: (id: string): Href => ({
    pathname: '/social/relationships/[id]',
    params: { id },
  }),
  socialActivity: '/social/activity' as const,
  socialInsights: '/social/insights' as const,
  learning: '/learning' as const,
  learningBehaviours: '/learning/behaviours' as const,
  learningBehaviour: (id: string): Href => ({
    pathname: '/learning/behaviours/[id]',
    params: { id },
  }),
  learningHistory: '/learning/history' as const,
  individualLearning: (id: string): Href => ({
    pathname: '/learning/individual/[id]',
    params: { id },
  }),
  learningTransmission: (id: string): Href => ({
    pathname: '/learning/transmission/[id]',
    params: { id },
  }),
  settings: '/settings' as const,
  hominin: (id: string): Href => ({
    pathname: '/hominin/[id]',
    params: { id },
  }),
  discovery: (id: string): Href => ({
    pathname: '/discovery/[id]',
    params: { id },
  }),
};
