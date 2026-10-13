import { drought } from '@/simulation/scenarios/drought';
import { hardFood } from '@/simulation/scenarios/hardFood';
import { stableSavannah } from '@/simulation/scenarios/stableSavannah';
import type { Scenario, ScenarioName } from '@/simulation/scenarios/types';

export const scenarios: Record<ScenarioName, Scenario> = { stableSavannah, drought, hardFood };
