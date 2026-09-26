import * as SplashScreen from 'expo-splash-screen';
import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';

import { bootstrapApplication } from '@/bootstrap/bootstrapService';
import type { BootstrapStage } from '@/bootstrap/types';
import { LoadingState } from '@/components/feedback/LoadingState';

export function AppBootstrap({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [stage, setStage] = useState<BootstrapStage>('configuration');
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    void bootstrapApplication(setStage)
      .then(() => mounted && setReady(true))
      .catch(
        (reason: unknown) =>
          mounted && setError(reason instanceof Error ? reason : new Error(String(reason))),
      )
      .finally(() => SplashScreen.hideAsync().catch(() => undefined));
    return () => {
      mounted = false;
    };
  }, []);

  if (error) throw error;
  if (!ready) return <LoadingState label={`Starting: ${stage}`} />;
  return children;
}
