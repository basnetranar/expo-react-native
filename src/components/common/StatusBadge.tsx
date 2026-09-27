import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

type Tone = 'success' | 'warning' | 'danger' | 'info';

export function StatusBadge({ label, tone = 'info' }: { label: string; tone?: Tone }) {
  const color =
    tone === 'success'
      ? colors.primary
      : tone === 'warning'
        ? colors.warning
        : tone === 'danger'
          ? colors.destructive
          : colors.accentBlue;
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <AppText variant="caption" style={{ color }}>
        {label.toUpperCase()}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
});
