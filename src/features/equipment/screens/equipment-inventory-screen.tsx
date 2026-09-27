import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { EquipmentCard } from '@/features/equipment/components/equipment-card';
import { equipment } from '@/features/equipment/data/equipment';

export function EquipmentInventoryScreen() {
  return (
    <AppScreen scroll>
      <SectionHeader eyebrow="Quartermaster" title="Equipment Inventory" />
      <AppText color="secondary">
        Access · Hacking · Stealth · Mobility · Disguise · Utility
      </AppText>
      <ResponsiveGrid phoneColumns={1} tabletColumns={2} largeTabletColumns={3}>
        {equipment.map((item) => (
          <EquipmentCard key={item.id} item={item} />
        ))}
      </ResponsiveGrid>
    </AppScreen>
  );
}
