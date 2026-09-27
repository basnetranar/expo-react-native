import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';
import type { TimelineAction as TimelineActionData } from '@/types/game';

export function TimelineAction({ action }: { action: TimelineActionData }) {
  const minutes = String(Math.floor(action.atSeconds / 60)).padStart(2, '0');
  const seconds = String(action.atSeconds % 60).padStart(2, '0');
  return (
    <View style={styles.row}>
      <AppText style={styles.time}>
        {minutes}:{seconds}
      </AppText>
      <View style={styles.dot} />
      <View style={styles.copy}>
        <AppText variant="label">{action.label}</AppText>
        <AppText variant="caption">{action.actor}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  time: { width: 48, color: colors.textSecondary, fontVariant: ['tabular-nums'] },
  dot: { width: 9, height: 9, borderRadius: radius.full, backgroundColor: colors.primary },
  copy: { flex: 1 },
});
