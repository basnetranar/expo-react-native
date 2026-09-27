import { useLocalSearchParams } from 'expo-router';

import { TimelineScreen } from '@/features/timeline/screens/timeline-screen';

export default function TimelineRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <TimelineScreen missionId={missionId} />;
}
