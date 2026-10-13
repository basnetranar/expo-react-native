import type { AgentInspectorSnapshot, SocialEvent, SocialMetrics } from '@/simulation';

export interface SocialPersonViewModel {
  id: string;
  name: string;
  generation: number;
  age: number;
  alive: boolean;
  groupId: string | null;
}

export interface SocialGroupViewModel {
  id: string;
  label: string;
  formedGeneration: number;
  formedTick: number;
  ageTicks: number;
  members: SocialPersonViewModel[];
  events: SocialActivityViewModel[];
}

export interface SocialActivityViewModel {
  id: string;
  type: SocialEvent['type'];
  title: string;
  detail: string;
  tick: number;
  generation: number;
  participantIds: readonly string[];
  participantNames: readonly string[];
  groupId?: string;
}

export interface SocialOverviewViewModel {
  tick: number;
  generation: number;
  population: number;
  groups: SocialGroupViewModel[];
  people: SocialPersonViewModel[];
  recentActivity: SocialActivityViewModel[];
  metrics: SocialMetrics;
  agents: readonly AgentInspectorSnapshot[];
}
