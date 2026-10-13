import { StyleSheet, View, type ViewStyle } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function MetricTile({ label, value, accent = colors.accentScience, style }: Props) {
  return (
    <View style={[styles.tile, style]}>
      <View style={[styles.marker, { backgroundColor: accent }]} />
      <AppText variant="caption">{label}</AppText>
      <AppText variant="metric" selectable style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

interface Props {
  label: string;
  value: string;
  accent?: string;
  style?: ViewStyle | undefined;
}

const styles = StyleSheet.create({
  tile: {
    minWidth: 112,
    flex: 1,
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  marker: { width: 28, height: 3, borderRadius: radius.full },
  value: { fontVariant: ['tabular-nums'] },
});
