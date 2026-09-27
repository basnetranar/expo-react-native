import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AppScreen } from '@/components/layout/AppScreen';
import { MissionCard } from '@/features/missions/components/mission-card';
import { missions } from '@/features/missions/data/missions';

export function MissionsScreen() {
  return (
    <AppScreen scroll>
      <SectionHeader eyebrow="Operations" title="Available Missions" />
      <AppText color="secondary">
        Choose a target, review the briefing, then assemble a plan.
      </AppText>
      {missions.map((mission) => (
        <MissionCard key={mission.id} mission={mission} />
      ))}
    </AppScreen>
  );
}
