import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';

const categories = ['Crew Training', 'Planning Tools', 'Equipment', 'Intel', 'Operations'];

export function UpgradesScreen() {
  return (
    <AppScreen scroll>
      <SectionHeader eyebrow="Long Game" title="Upgrades" />
      <AppText color="secondary">
        Future upgrades will improve specialists, tools, intelligence, and operational capacity.
      </AppText>
      <ResponsiveGrid phoneColumns={1} tabletColumns={2} largeTabletColumns={3}>
        {categories.map((category) => (
          <AppCard key={category}>
            <StatusBadge label="Coming Soon" tone="warning" />
            <AppText variant="heading">{category}</AppText>
            <AppText color="secondary">
              Upgrade paths will unlock when progression is implemented.
            </AppText>
          </AppCard>
        ))}
      </ResponsiveGrid>
    </AppScreen>
  );
}
