import { useEffect, useMemo } from 'react';

import type { LearningOverviewViewModel } from '@/features/learning/types';
import { createLearningOverview } from '@/features/learning/utils/learning-presentation';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';

export function useLearningSnapshot(): LearningOverviewViewModel | null {
  const controller = getActiveSimulationSession();
  const snapshot = controller?.getCulturalSnapshot() ?? null;
  useEffect(() => {
    if (!controller) return;
    controller.beginLearning();
    return () => controller.endLearning();
  }, [controller]);
  return useMemo(() => (snapshot ? createLearningOverview(snapshot) : null), [snapshot]);
}
