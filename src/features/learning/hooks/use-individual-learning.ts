import { useEffect } from 'react';

import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import type { AgentInspectorSnapshot } from '@/simulation';

export function useIndividualLearning(id: string | undefined): AgentInspectorSnapshot | null {
  const controller = getActiveSimulationSession();
  const snapshot = id && controller ? controller.getInspectorSnapshot(id) : null;
  useEffect(() => {
    if (!id || !controller) return;
    controller.beginInspection(id);
    return () => controller.endInspection();
  }, [controller, id]);
  return snapshot;
}
