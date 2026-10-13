import type { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';

let activeController: SimulationSessionController | null = null;

export function registerActiveSimulationSession(
  controller: SimulationSessionController,
): () => void {
  activeController = controller;
  return () => {
    if (activeController === controller) activeController = null;
  };
}

export function getActiveSimulationSession(): SimulationSessionController | null {
  return activeController;
}

export function closeActiveSimulationSession(controller: SimulationSessionController): void {
  if (activeController === controller) activeController = null;
  controller.dispose();
}
