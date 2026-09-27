import { useLocalSearchParams } from 'expo-router';

import { MissionOverviewScreen } from '@/features/missions/screens/mission-overview-screen';

export default function MissionRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <MissionOverviewScreen missionId={missionId} />;
}
