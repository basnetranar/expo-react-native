import { useLocalSearchParams } from 'expo-router';

import { MissionBriefingScreen } from '@/features/missions/screens/mission-briefing-screen';

export default function BriefingRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <MissionBriefingScreen missionId={missionId} />;
}
