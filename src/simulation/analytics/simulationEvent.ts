import type { SimulationEvent } from '@/simulation/engine/types';

export const recentEvents = (events: readonly SimulationEvent[], count = 12): SimulationEvent[] =>
  events.slice(-count).map((event) => ({ ...event }));
