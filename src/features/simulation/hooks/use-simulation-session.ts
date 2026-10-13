import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';

import { HistoryRepository } from '@/features/histories/services/history-repository';
import { ExpoHistoryStorageAdapter } from '@/features/histories/services/history-storage-adapter';
import { saveActiveWorldRecord } from '@/features/home/services/active-world-storage';
import {
  getActiveSimulationSession,
  registerActiveSimulationSession,
} from '@/features/simulation/services/active-simulation-session';
import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import { useSimulationUiStore } from '@/features/simulation/store/simulation-ui-store';
import type { SimulationSpeed } from '@/features/simulation/types';
import type { SimulationConfig } from '@/simulation';

export function useSimulationSession(
  config: SimulationConfig,
  options: { requireExistingHistory?: boolean; preferActiveSession?: boolean } = {},
) {
  const sessionOwner = useMemo(() => {
    const active = options.preferActiveSession ? getActiveSimulationSession() : null;
    return active
      ? { controller: active, ownsController: false }
      : {
          controller: new SimulationSessionController(
            config,
            undefined,
            new HistoryRepository(new ExpoHistoryStorageAdapter(String(config.seed))),
          ),
          ownsController: true,
        };
  }, [config, options.preferActiveSession]);
  const { controller, ownsController } = sessionOwner;
  const state = useSimulationUiStore();
  const mounted = useRef(true);

  const initializeHistories = useCallback(
    () =>
      controller
        .initializeHistories(new Date().toISOString(), {
          ...(options.requireExistingHistory ? { requireExisting: true } : {}),
        })
        .then(async () => {
          await saveActiveWorldRecord(controller);
          if (mounted.current) {
            useSimulationUiStore.getState().setWarning(null);
            useSimulationUiStore.getState().applyUpdate(controller.getUpdate());
          }
        })
        .catch((error) => {
          if (!mounted.current) return;
          useSimulationUiStore
            .getState()
            .setWarning(
              error instanceof Error
                ? `Saved histories could not be restored: ${error.message}`
                : options.requireExistingHistory
                  ? 'The saved simulation could not be restored.'
                  : 'Saved histories could not be restored. The current simulation remains available.',
            );
          if (options.requireExistingHistory)
            useSimulationUiStore.getState().setError('The saved simulation could not be restored.');
        }),
    [controller, options.requireExistingHistory],
  );

  useEffect(() => {
    mounted.current = true;
    useSimulationUiStore.getState().reset();
    const unregisterSession = ownsController
      ? registerActiveSimulationSession(controller)
      : () => undefined;
    const unsubscribe = controller.subscribe((update) =>
      useSimulationUiStore.getState().applyUpdate(update),
    );
    const appStateSubscription = AppState.addEventListener('change', (status) =>
      controller.handleAppState(status),
    );
    try {
      useSimulationUiStore
        .getState()
        .applyUpdate(ownsController ? controller.initialize() : controller.getUpdate());
      if (ownsController) void initializeHistories();
    } catch (error) {
      useSimulationUiStore
        .getState()
        .setError(error instanceof Error ? error.message : 'Unable to initialize simulation.');
    }
    return () => {
      mounted.current = false;
      appStateSubscription.remove();
      unsubscribe();
      unregisterSession();
      if (ownsController)
        void controller
          .persistActiveHistory()
          .then(() => saveActiveWorldRecord(controller))
          .catch(() => undefined)
          .finally(() => controller.dispose());
      if (ownsController) useSimulationUiStore.getState().reset();
    };
  }, [controller, initializeHistories, ownsController]);

  return {
    ...state,
    play: () => controller.resume(),
    pause: () => controller.pause(),
    setSpeed: (speed: SimulationSpeed) => controller.setSpeed(speed),
    selectAgent: (id: string | null) => controller.selectAgent(id),
    retryHistoryPersistence: () => initializeHistories(),
  };
}
