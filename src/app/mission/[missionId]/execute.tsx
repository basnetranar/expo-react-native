import { useLocalSearchParams } from 'expo-router';

import { ExecutionScreen } from '@/features/execution/screens/execution-screen';

export default function ExecuteRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <ExecutionScreen missionId={missionId} />;
}
