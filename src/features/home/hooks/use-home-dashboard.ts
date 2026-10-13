import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {
  loadSavedWorldSummary,
  type SavedWorldSummary,
} from '@/features/home/services/active-world-storage';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';

export function useHomeDashboard() {
  const [saved, setSaved] = useState<SavedWorldSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSaved(await loadSavedWorldSummary());
    } catch (reason) {
      setSaved(null);
      setError(reason instanceof Error ? reason.message : 'Saved world metadata is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );
  const controller = getActiveSimulationSession();
  return {
    active: controller?.getUpdate() ?? null,
    histories: controller?.getHistoriesSnapshot() ?? null,
    saved,
    loading,
    error,
    refresh,
  };
}
