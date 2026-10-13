import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { OnboardingScreen } from '@/features/onboarding/screens/onboarding-screen';
import { dismissOnboarding } from '@/features/onboarding/services/onboarding-storage';

const mockReplace = jest.fn();
const mockBack = jest.fn();
let mockReplay: string | undefined;

jest.mock('expo-router', () => ({
  router: {
    replace: (...args: unknown[]) => mockReplace(...args),
    back: (...args: unknown[]) => mockBack(...args),
    canGoBack: () => true,
  },
  useLocalSearchParams: () => ({ replay: mockReplay }),
}));
jest.mock('@/features/onboarding/services/onboarding-storage', () => ({
  dismissOnboarding: jest.fn(async () => undefined),
}));

describe('onboarding screen', () => {
  let renderer: ReactTestRenderer;
  beforeEach(() => {
    jest.clearAllMocks();
    mockReplay = undefined;
    act(() => {
      renderer = create(<OnboardingScreen />);
    });
  });
  afterEach(() => act(() => renderer.unmount()));

  it('advances without persistence and skip dismisses through one replace', async () => {
    act(() => renderer.root.findByProps({ accessibilityLabel: 'Get Started' }).props.onPress());
    expect(
      renderer.root.findByProps({ children: 'Intelligence Begins with Survival' }),
    ).toBeTruthy();
    expect(dismissOnboarding).not.toHaveBeenCalled();
    await act(async () => {
      renderer.root.findByProps({ accessibilityLabel: 'Skip Introduction' }).props.onPress();
    });
    expect(dismissOnboarding).toHaveBeenCalledWith('skipped');
    expect(mockReplace).toHaveBeenCalledWith('/lab');
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('completes all four steps and safely returns after replay', async () => {
    act(() => renderer.unmount());
    mockReplay = '1';
    act(() => {
      renderer = create(<OnboardingScreen />);
    });
    for (const label of ['Get Started', 'Next', 'Next'])
      act(() => renderer.root.findByProps({ accessibilityLabel: label }).props.onPress());
    await act(async () => {
      renderer.root.findByProps({ accessibilityLabel: 'Start Exploring' }).props.onPress();
    });
    expect(dismissOnboarding).toHaveBeenCalledWith('completed');
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
