import { useState } from 'react';

import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { EquipmentCard } from '@/features/equipment/components/equipment-card';
import { equipment } from '@/features/equipment/data/equipment';
import { PlanningNavigation } from '@/features/planning/components/planning-navigation';

export function MissionEquipmentScreen({ missionId }: { missionId: string }) {
  const [selected, setSelected] = useState(['lockpick', 'camera-loop']);
  const toggle = (id: string) =>
    setSelected((value) =>
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    );
  return (
    <AppScreen scroll edges={['top', 'bottom']}>
      <PlanningNavigation missionId={missionId} active="Equipment" />
      <AppText variant="heading">Mission Loadout</AppText>
      <AppText color="secondary">Choose placeholder tools for the operation.</AppText>
      <ResponsiveGrid phoneColumns={1} tabletColumns={2} largeTabletColumns={3}>
        {equipment.map((item) => (
          <EquipmentCard
            key={item.id}
            item={item}
            selected={selected.includes(item.id)}
            onPress={() => toggle(item.id)}
          />
        ))}
      </ResponsiveGrid>
    </AppScreen>
  );
}
