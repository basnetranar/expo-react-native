import { useEffect, useMemo } from 'react';

import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import type { SocialOverviewViewModel } from '@/features/social/types';
import { createSocialOverview } from '@/features/social/utils/social-presentation';

export function useSocialSnapshot(): SocialOverviewViewModel | null {
  const controller = getActiveSimulationSession();
  const snapshot = controller?.getSocialSnapshot() ?? null;
  useEffect(() => {
    if (!controller) return;
    controller.beginSocial();
    return () => controller.endSocial();
  }, [controller]);
  return useMemo(() => (snapshot ? createSocialOverview(snapshot) : null), [snapshot]);
}
