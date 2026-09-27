import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function TimelineTrack({
  label,
  width,
  color,
}: {
  label: string;
  width: `${number}%`;
  color: string;
}) {
  return (
    <View style={styles.row}>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
      <View style={styles.rail}>
        <View style={[styles.block, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { width: 100 },
  rail: { flex: 1, height: 16, backgroundColor: colors.surfaceRaised, borderRadius: radius.full },
  block: { height: 16, borderRadius: radius.full, opacity: 0.8 },
});
