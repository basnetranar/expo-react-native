import { Pressable, StyleSheet } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { StatusBadge } from '@/components/common/StatusBadge';
import { spacing } from '@/theme';
import type { EquipmentItem } from '@/types/game';

export function EquipmentCard({
  item,
  selected,
  onPress,
}: {
  item: EquipmentItem;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <AppCard style={styles.card}>
        <StatusBadge label={item.category} tone="info" />
        <AppText variant="heading">{item.name}</AppText>
        <AppText color="secondary">{item.description}</AppText>
        {selected ? (
          <AppText variant="caption" style={styles.selected}>
            EQUIPPED
          </AppText>
        ) : null}
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 158, gap: spacing.sm },
  selected: { fontWeight: '800' },
  pressed: { opacity: 0.72 },
});
