import { useEffect, useMemo } from 'react';

import type { FamilyTreeViewModel, LineageIndex } from '@/features/lineage/types';
import { createFamilyTreeViewModel } from '@/features/lineage/utils/lineage-presentation';
import { createLineageIndex } from '@/features/lineage/utils/lineage-selectors';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import type { LineageRegistrySnapshot } from '@/simulation';

export function useFamilyTree(selectedId: string | undefined): {
  family: FamilyTreeViewModel | null;
  index: LineageIndex | null;
  source: LineageRegistrySnapshot | null;
  reason: 'no-session' | 'no-lineage' | null;
} {
  const controller = getActiveSimulationSession();
  const source = controller?.getLineageRegistrySnapshot() ?? null;

  useEffect(() => {
    if (!controller) return;
    controller.beginLineage();
    return () => controller.endLineage();
  }, [controller]);

  const index = useMemo(() => (source ? createLineageIndex(source.records) : null), [source]);
  const family = useMemo(
    () =>
      source && controller
        ? createFamilyTreeViewModel(source, selectedId, (id) => controller.getInspectorSnapshot(id))
        : null,
    [controller, selectedId, source],
  );
  return {
    family,
    index,
    source,
    reason: !controller ? 'no-session' : family ? null : 'no-lineage',
  };
}
