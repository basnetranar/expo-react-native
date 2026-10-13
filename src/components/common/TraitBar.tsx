import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function TraitBar({ label, value }: { label: string; value: number }) {
  return (
    <View accessibilityLabel={`${label}: ${value} percent`} style={styles.container}>
      <View style={styles.row}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="caption" selectable>
          {value}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  track: {
    height: 8,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderRadius: radius.full,
  },
  fill: { height: '100%', backgroundColor: colors.accentScience, borderRadius: radius.full },
});
