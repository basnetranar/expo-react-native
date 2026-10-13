import { useEffect, useMemo } from 'react';

import type { HomininInspectorViewModel } from '@/features/hominin/types';
import { createHomininInspectorViewModel } from '@/features/hominin/utils/hominin-presentation';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import type { AgentInspectorSnapshot } from '@/simulation';

type UnavailableReason = 'no-session' | 'missing-id' | null;

export function useHomininInspector(id: string | undefined): {
  loading: boolean;
  individual: HomininInspectorViewModel | null;
  reason: UnavailableReason;
} {
  const controller = getActiveSimulationSession();
  const snapshot: AgentInspectorSnapshot | null =
    id && controller ? controller.getInspectorSnapshot(id) : null;

  useEffect(() => {
    if (!id || !controller) return;
    controller.beginInspection(id);
    return () => controller.endInspection();
  }, [controller, id]);

  const individual = useMemo(() => {
    if (!snapshot || !controller) return null;
    return createHomininInspectorViewModel(snapshot, (relatedId) =>
      controller.getInspectorSnapshot(relatedId),
    );
  }, [controller, snapshot]);

  const reason: UnavailableReason = !id
    ? 'missing-id'
    : !controller
      ? 'no-session'
      : individual
        ? null
        : 'missing-id';
  return { loading: false, individual, reason };
}
