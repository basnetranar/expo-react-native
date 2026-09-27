import { useState } from 'react';

import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { CrewCard } from '@/features/crew/components/crew-card';
import { crew } from '@/features/crew/data/crew';
import { PlanningNavigation } from '@/features/planning/components/planning-navigation';

export function MissionCrewScreen({ missionId }: { missionId: string }) {
  const [selected, setSelected] = useState(['runner', 'hacker', 'safecracker']);
  const toggle = (id: string) =>
    setSelected((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  return (
    <AppScreen scroll edges={['top', 'bottom']}>
      <PlanningNavigation missionId={missionId} active="Crew" />
      <AppText variant="heading">Assign Crew</AppText>
      <AppText color="secondary">
        Select specialists for this mission. Balance rules are not active yet.
      </AppText>
      <ResponsiveGrid phoneColumns={1} tabletColumns={2} largeTabletColumns={3}>
        {crew.map((member) => (
          <CrewCard
            key={member.id}
            member={member}
            selected={selected.includes(member.id)}
            onPress={() => toggle(member.id)}
          />
        ))}
      </ResponsiveGrid>
    </AppScreen>
  );
}
