import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';

const play = jest.fn();
const pause = jest.fn();
const setSpeed = jest.fn();
const selectAgent = jest.fn();
const retryHistoryPersistence = jest.fn();
const push = jest.fn();
const replace = jest.fn();
const controller = new SimulationSessionController({ seed: 'ui-smoke' });
const initialized = controller.initialize();

let mockedStatus = initialized.status;
let mockedWarning: string | null = null;

jest.doMock('expo-router', () => ({
  router: { push, replace },
  useLocalSearchParams: () => ({ population: '24' }),
}));

jest.doMock('@/responsive/useResponsiveLayout', () => ({
  useResponsiveLayout: () => ({ isPhone: true, isTablet: false }),
}));

jest.doMock('@/features/simulation/hooks/use-simulation-session', () => ({
  useSimulationSession: () => ({
    ...initialized,
    status: mockedStatus,
    isInitialized: true,
    error: null,
    warning: mockedWarning,
    play,
    pause,
    setSpeed,
    selectAgent,
    retryHistoryPersistence,
  }),
}));

jest.doMock('@/features/home/services/active-world-storage', () => ({
  loadActiveWorldRecord: jest.fn(),
}));

const { SimulationScreen, simulationSafeAreaEdges } = jest.requireActual<
  typeof import('@/features/simulation/screens/simulation-screen')
>('@/features/simulation/screens/simulation-screen');

describe('Live Simulation screen', () => {
  let renderer: ReactTestRenderer;

  afterAll(() => controller.dispose());
  beforeEach(() => {
    jest.clearAllMocks();
    mockedStatus = 'paused';
    mockedWarning = null;
    act(() => {
      renderer = create(<SimulationScreen />);
    });
  });
  afterEach(() => act(() => renderer.unmount()));

  it('renders a real snapshot and wires play, speed, and agent selection', () => {
    expect(renderer.root.findByProps({ children: 'Stable Savannah' })).toBeTruthy();
    act(() =>
      renderer.root.findByProps({ accessibilityLabel: 'Resume simulation' }).props.onPress(),
    );
    expect(play).toHaveBeenCalledTimes(1);
    act(() =>
      renderer.root.findByProps({ accessibilityLabel: 'Set speed to 10 times' }).props.onPress(),
    );
    expect(setSpeed).toHaveBeenCalledWith(10);

    const firstAgent = initialized.snapshot.aliveAgents[0]!;
    const marker = renderer.root
      .findAllByProps({ accessibilityHint: `Engine ID ${firstAgent.id}` })
      .find((node) => typeof node.props.onPress === 'function')!;
    act(() => marker.props.onPress());
    expect(selectAgent).toHaveBeenCalledWith(firstAgent.id);
  });

  it('shows selected-agent details and the extinction overlay state', () => {
    expect(
      renderer.root.findAll(
        (node) =>
          typeof node.props.accessibilityLabel === 'string' &&
          node.props.accessibilityLabel.startsWith(getFriendlyName(initialized.selectedAgentId!)),
      ),
    ).not.toHaveLength(0);
    mockedStatus = 'extinct';
    act(() => renderer.update(<SimulationScreen />));
    expect(renderer.root.findByProps({ children: 'Population Extinct' })).toBeTruthy();
  });

  it('keeps the header and phone navigation inside the system safe areas', () => {
    expect(simulationSafeAreaEdges).toEqual(['top', 'bottom']);
    expect(renderer.root.findByProps({ accessibilityRole: 'tablist' })).toBeTruthy();
  });

  it('offers a non-destructive retry when saved history restoration fails', () => {
    mockedWarning = 'Saved histories could not be restored.';
    act(() => renderer.update(<SimulationScreen />));
    expect(renderer.root.findByProps({ children: 'History recovery needed' })).toBeTruthy();
    act(() =>
      renderer.root.findByProps({ accessibilityLabel: 'Retry History Restore' }).props.onPress(),
    );
    expect(retryHistoryPersistence).toHaveBeenCalledTimes(1);
    expect(renderer.root.findByProps({ children: 'Stable Savannah' })).toBeTruthy();
  });
});
