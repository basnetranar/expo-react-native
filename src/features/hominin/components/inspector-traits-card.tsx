import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { TraitBar } from '@/components/common/TraitBar';
import type { InspectorTrait } from '@/features/hominin/types';
import { colors, spacing } from '@/theme';

export function InspectorTraitsCard({ traits }: { traits: readonly InspectorTrait[] }) {
  return (
    <AppCard>
      <AppText variant="heading">Inherited potential</AppText>
      <AppText color="secondary">
        These ten genome values are inherited. They shape potential but cannot be edited directly.
      </AppText>
      <View style={styles.list}>
        {traits.map((trait) => (
          <View key={trait.key} style={styles.trait}>
            <TraitBar label={trait.label} value={trait.value} />
            <AppText variant="caption">{trait.explanation}</AppText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  trait: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
