import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';

import { LoadingState } from '@/components/feedback/LoadingState';
import { hasDismissedOnboarding } from '@/features/onboarding/services/onboarding-storage';

export default function IndexRoute() {
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  useEffect(() => {
    let mounted = true;
    void hasDismissedOnboarding()
      .then((value) => mounted && setDismissed(value))
      .catch(() => mounted && setDismissed(false));
    return () => {
      mounted = false;
    };
  }, []);
  if (dismissed === null) return <LoadingState label="Preparing First Minds" />;
  return <Redirect href={dismissed ? '/lab' : '/onboarding'} />;
}
