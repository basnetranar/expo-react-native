import { useLocalSearchParams } from 'expo-router';

import { MissionCrewScreen } from '@/features/crew/screens/mission-crew-screen';

export default function MissionCrewRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <MissionCrewScreen missionId={missionId} />;
}
