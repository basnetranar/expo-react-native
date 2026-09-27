import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { CrewCard } from '@/features/crew/components/crew-card';
import { crew } from '@/features/crew/data/crew';

export function CrewRosterScreen() {
  return (
    <AppScreen scroll>
      <SectionHeader eyebrow="Safehouse" title="Crew Roster" />
      <AppText color="secondary">
        Five specialists are available. Levels, traits, fatigue, and progression come later.
      </AppText>
      <ResponsiveGrid phoneColumns={1} tabletColumns={2} largeTabletColumns={3}>
        {crew.map((member) => (
          <CrewCard key={member.id} member={member} />
        ))}
      </ResponsiveGrid>
    </AppScreen>
  );
}
