import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

import { useAppState } from '@/hooks/useAppState';
import { updateManager } from '@/updates/updateService';

export function AppUpdateListener({ children }: PropsWithChildren) {
  const { isActive, wasBackgrounded } = useAppState();
  const wasActive = useRef(isActive);

  useEffect(() => {
    const returnedToForeground = isActive && !wasActive.current && wasBackgrounded;
    wasActive.current = isActive;
    if (returnedToForeground) {
      void updateManager.checkForUpdate({ download: true, applyIfSafe: false });
    }
  }, [isActive, wasBackgrounded]);

  return children;
}
