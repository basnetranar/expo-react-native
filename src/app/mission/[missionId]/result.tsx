import { useLocalSearchParams } from 'expo-router';

import { ResultScreen } from '@/features/results/screens/result-screen';
import type { MissionResult } from '@/types/game';

export default function ResultRoute() {
  const { missionId, status = 'success' } = useLocalSearchParams<{
    missionId: string;
    status?: MissionResult;
  }>();
  return <ResultScreen missionId={missionId} status={status} />;
}
