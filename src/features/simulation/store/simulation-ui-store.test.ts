import { useSimulationUiStore } from '@/features/simulation/store/simulation-ui-store';

describe('simulation UI store', () => {
  afterEach(() => useSimulationUiStore.getState().reset());

  it('contains only serializable UI/session fields and never an engine instance', () => {
    const state = useSimulationUiStore.getState();
    expect(Object.keys(state).sort()).toEqual(
      [
        'applyUpdate',
        'error',
        'isInitialized',
        'reset',
        'selectedAgent',
        'selectedAgentId',
        'setError',
        'setSpeed',
        'setWarning',
        'snapshot',
        'speed',
        'status',
        'warning',
      ].sort(),
    );
    expect(state).not.toHaveProperty('engine');
    expect(state).not.toHaveProperty('worldInternals');
  });
});
