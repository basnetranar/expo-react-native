import { create } from 'zustand';

import type {
  SimulationSessionUpdate,
  SimulationSpeed,
  SimulationUiState,
} from '@/features/simulation/types';

const initialState: SimulationUiState = {
  status: 'idle',
  speed: 1,
  snapshot: null,
  selectedAgentId: null,
  selectedAgent: null,
  isInitialized: false,
  error: null,
  warning: null,
};

interface SimulationUiActions {
  applyUpdate(update: SimulationSessionUpdate): void;
  setSpeed(speed: SimulationSpeed): void;
  setError(error: string): void;
  setWarning(warning: string | null): void;
  reset(): void;
}

export const useSimulationUiStore = create<SimulationUiState & SimulationUiActions>((set) => ({
  ...initialState,
  applyUpdate: (update) => set({ ...update, isInitialized: true, error: null }),
  setSpeed: (speed) => set({ speed }),
  setError: (error) => set({ error, status: 'paused' }),
  setWarning: (warning) => set({ warning }),
  reset: () => set(initialState),
}));
