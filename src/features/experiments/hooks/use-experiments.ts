import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ExperimentSourceSnapshot } from '@/features/experiments/types';
import { createExperimentsViewModel } from '@/features/experiments/utils/experiment-presentation';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import type { EnvironmentInterventionCommand } from '@/simulation';

export function useExperiments() {
  const controller = getActiveSimulationSession();
  const read = useCallback((): ExperimentSourceSnapshot | null => {
    if (!controller) return null;
    const session = controller.getUpdate();
    return {
      environment: controller.getEnvironmentInterventionSnapshot(),
      summaries: controller.getEvolutionHistorySnapshot().summaries,
      scenario: session.snapshot.scenario,
      status: session.status,
      population: session.snapshot.populationSize,
    };
  }, [controller]);
  const [source, setSource] = useState<ExperimentSourceSnapshot | null>(() => read());
  const submitting = useRef(false);
  const lastSubmission = useRef<{ tick: number; key: string } | null>(null);

  useEffect(() => {
    if (!controller) return;
    return controller.subscribe(() => setSource(read()));
  }, [controller, read]);

  const apply = useCallback(
    (commands: readonly EnvironmentInterventionCommand[]) => {
      if (!controller || submitting.current || !commands.length) return false;
      const tick = controller.getEnvironmentInterventionSnapshot().currentTick;
      const key = JSON.stringify(commands);
      if (lastSubmission.current?.tick === tick && lastSubmission.current.key === key) return false;
      submitting.current = true;
      try {
        controller.scheduleEnvironmentInterventions(commands);
        lastSubmission.current = { tick, key };
        setSource(read());
        return true;
      } finally {
        submitting.current = false;
      }
    },
    [controller, read],
  );
  const cancel = useCallback(
    (id: string) => {
      if (!controller) return;
      controller.cancelEnvironmentIntervention(id);
      setSource(read());
    },
    [controller, read],
  );
  const experiments = useMemo(() => (source ? createExperimentsViewModel(source) : null), [source]);
  return { experiments, apply, cancel, reason: controller ? null : ('no-session' as const) };
}
