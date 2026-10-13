import { useEffect, useMemo } from 'react';

import type { EvolutionTimelineViewModel } from '@/features/evolution/types';
import { createEvolutionTimelineViewModel } from '@/features/evolution/utils/evolution-timeline-presentation';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';

export function useEvolutionTimeline(): {
  timeline: EvolutionTimelineViewModel | null;
  reason: 'no-session' | null;
} {
  const controller = getActiveSimulationSession();
  const source = controller?.getEvolutionHistorySnapshot() ?? null;
  const scenario = controller?.getUpdate().snapshot.scenario ?? null;

  useEffect(() => {
    if (!controller) return;
    controller.beginTimeline();
    return () => controller.endTimeline();
  }, [controller]);

  const timeline = useMemo(
    () => (source && scenario ? createEvolutionTimelineViewModel(source, scenario) : null),
    [scenario, source],
  );
  return { timeline, reason: controller ? null : 'no-session' };
}
