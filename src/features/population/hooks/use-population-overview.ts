import { useEffect, useMemo, useState } from 'react';

import type { PopulationOverviewSnapshot } from '@/features/population/types';
import { createPopulationOverviewSnapshot } from '@/features/population/utils/population-presentation';
import { getActiveSimulationSession } from '@/features/simulation/services/active-simulation-session';
import type { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';

function readPopulation(controller: SimulationSessionController): PopulationOverviewSnapshot {
  const update = controller.getUpdate();
  return createPopulationOverviewSnapshot(controller.getPopulationDataSnapshot(), {
    scenario: update.snapshot.scenario,
    status: update.status,
    peakPopulation: update.snapshot.peakPopulation,
  });
}

export function usePopulationOverview(): {
  population: PopulationOverviewSnapshot | null;
  reason: 'no-session' | null;
} {
  const controller = useMemo(() => getActiveSimulationSession(), []);
  const [population, setPopulation] = useState<PopulationOverviewSnapshot | null>(() =>
    controller ? readPopulation(controller) : null,
  );

  useEffect(() => {
    if (!controller) return;
    return controller.subscribe(() => setPopulation(readPopulation(controller)));
  }, [controller]);

  return { population, reason: controller ? null : 'no-session' };
}
