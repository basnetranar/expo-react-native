import type { Href } from 'expo-router';

export const routes = {
  home: '/home' as const,
  missions: '/missions' as const,
  crew: '/crew' as const,
  equipment: '/equipment' as const,
  upgrades: '/upgrades' as const,
  settings: '/settings' as const,
  mission: (missionId: string): Href => ({
    pathname: '/mission/[missionId]',
    params: { missionId },
  }),
  briefing: (missionId: string): Href => ({
    pathname: '/mission/[missionId]/briefing',
    params: { missionId },
  }),
  planning: (missionId: string): Href => ({
    pathname: '/mission/[missionId]/plan',
    params: { missionId },
  }),
  execution: (missionId: string): Href => ({
    pathname: '/mission/[missionId]/execute',
    params: { missionId },
  }),
  result: (missionId: string, status: 'success' | 'failure' = 'success'): Href => ({
    pathname: '/mission/[missionId]/result',
    params: { missionId, status },
  }),
};
