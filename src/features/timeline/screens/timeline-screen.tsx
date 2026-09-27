import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { PlanningNavigation } from '@/features/planning/components/planning-navigation';
import { Timeline } from '@/features/timeline/components/timeline';

export function TimelineScreen({ missionId }: { missionId: string }) {
  return (
    <AppScreen scroll edges={['top', 'bottom']}>
      <PlanningNavigation missionId={missionId} active="Timeline" />
      <AppText variant="heading">Operation Timeline</AppText>
      <AppText color="secondary">
        Static sequencing preview. Editing arrives with the simulation engine.
      </AppText>
      <AppCard>
        <Timeline />
      </AppCard>
    </AppScreen>
  );
}
