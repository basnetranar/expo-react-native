import {
  closeActiveSimulationSession,
  getActiveSimulationSession,
  registerActiveSimulationSession,
} from '@/features/simulation/services/active-simulation-session';
import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';

describe('active simulation identity', () => {
  it('reuses one registered controller and closes it before replacement', () => {
    const controller = new SimulationSessionController({ seed: 'active-identity' });
    controller.initialize();
    const unregister = registerActiveSimulationSession(controller);
    expect(getActiveSimulationSession()).toBe(controller);
    closeActiveSimulationSession(controller);
    expect(getActiveSimulationSession()).toBeNull();
    expect(() => controller.resume()).toThrow('disposed');
    unregister();
  });
});
