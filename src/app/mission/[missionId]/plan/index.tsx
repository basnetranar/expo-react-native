import { useLocalSearchParams } from 'expo-router';

import { PlanningScreen } from '@/features/planning/screens/planning-screen';

export default function PlanningRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <PlanningScreen missionId={missionId} />;
}
