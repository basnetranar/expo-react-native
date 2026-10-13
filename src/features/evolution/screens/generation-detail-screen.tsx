import { router, useLocalSearchParams } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AppScreen } from '@/components/layout/AppScreen';
import { GenerationDetailCard } from '@/features/evolution/components/generation-detail-card';
import { useEvolutionTimeline } from '@/features/evolution/hooks/use-evolution-timeline';
import { routes } from '@/types/navigation';

export function GenerationDetailScreen() {
  const params = useLocalSearchParams<{ generation?: string | string[] }>();
  const raw = Array.isArray(params.generation) ? params.generation[0] : params.generation;
  const generation = raw ? Number(raw) : Number.NaN;
  const { timeline } = useEvolutionTimeline();
  const detail = timeline?.generations.find((item) => item.generation === generation) ?? null;

  if (!detail)
    return (
      <AppScreen>
        <EmptyState
          title="Generation unavailable"
          message="This generation is not present in the active session’s retained history."
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Open Timeline'}
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace(routes.evolutionTimeline)
          }
        />
      </AppScreen>
    );

  return (
    <AppScreen scroll maxWidth="readable" statusBarStyle="light">
      <GenerationDetailCard detail={detail} />
    </AppScreen>
  );
}
