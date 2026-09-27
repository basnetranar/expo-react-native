import { useLocalSearchParams } from 'expo-router';

import { MissionEquipmentScreen } from '@/features/equipment/screens/mission-equipment-screen';

export default function MissionEquipmentRoute() {
  const { missionId } = useLocalSearchParams<{ missionId: string }>();
  return <MissionEquipmentScreen missionId={missionId} />;
}
