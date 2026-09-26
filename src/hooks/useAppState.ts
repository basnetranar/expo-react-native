import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useAppState() {
  const [currentState, setCurrentState] = useState<AppStateStatus>(AppState.currentState);
  const previousState = useRef(currentState);
  const [wasBackgrounded, setWasBackgrounded] = useState(false);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setWasBackgrounded(
        previousState.current === 'background' || previousState.current === 'inactive',
      );
      previousState.current = nextState;
      setCurrentState(nextState);
    });
    return () => subscription.remove();
  }, []);

  return { currentState, isActive: currentState === 'active', wasBackgrounded };
}
