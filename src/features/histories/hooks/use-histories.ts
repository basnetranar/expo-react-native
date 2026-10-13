import { useCallback, useEffect, useState } from 'react';

import type { HistoriesSnapshot } from '@/features/histories/types';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';

export function useHistories() {
  const controller = getActiveSimulationSession();
  const read = useCallback(() => controller?.getHistoriesSnapshot() ?? null, [controller]);
  const [histories, setHistories] = useState<HistoriesSnapshot | null>(() => read());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!controller) return;
    return controller.subscribe(() => setHistories(read()));
  }, [controller, read]);

  const run = useCallback(
    async <T>(operation: () => Promise<T>) => {
      if (!controller || busy) return null;
      setBusy(true);
      setError(null);
      try {
        const result = await operation();
        setHistories(read());
        return result;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'The history operation failed.');
        return null;
      } finally {
        setBusy(false);
      }
    },
    [busy, controller, read],
  );

  return {
    histories,
    busy,
    error,
    reason: controller ? null : ('no-session' as const),
    createCheckpoint: (label: string) => run(() => controller!.createHistoryCheckpoint(label)),
    createBranch: (checkpointId: string, name: string) =>
      run(() => controller!.createHistoryBranch(checkpointId, name)),
    switchBranch: (branchId: string) => run(() => controller!.switchHistoryBranch(branchId)),
    renameBranch: (branchId: string, name: string) =>
      run(() => controller!.renameHistoryBranch(branchId, name)),
    renameCheckpoint: (checkpointId: string, label: string) =>
      run(() => controller!.renameHistoryCheckpoint(checkpointId, label)),
    deleteBranch: (branchId: string) => run(() => controller!.deleteHistoryBranch(branchId)),
    deleteCheckpoint: (checkpointId: string) =>
      run(() => controller!.deleteHistoryCheckpoint(checkpointId)),
  };
}
