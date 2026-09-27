import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.badge}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="label" selectable>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 96,
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
