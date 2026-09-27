import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function PlanningCanvas({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.canvas, compact && styles.compact]}>
      <View style={styles.roomA} />
      <View style={styles.roomB} />
      <View style={styles.route} />
      <View style={styles.camera} />
      <View style={styles.legend}>
        <AppText variant="label">Mission Floor Plan</AppText>
        <AppText variant="caption">Static tactical preview</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    minHeight: 380,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  compact: { minHeight: 260 },
  roomA: {
    position: 'absolute',
    left: '8%',
    top: '12%',
    width: '40%',
    height: '36%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  roomB: {
    position: 'absolute',
    right: '8%',
    bottom: '16%',
    width: '36%',
    height: '44%',
    borderWidth: 2,
    borderColor: colors.border,
  },
  route: {
    position: 'absolute',
    left: '18%',
    top: '52%',
    width: '58%',
    height: 3,
    backgroundColor: colors.route,
    transform: [{ rotate: '-12deg' }],
  },
  camera: {
    position: 'absolute',
    right: '24%',
    top: '24%',
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.cameraVision,
    opacity: 0.22,
  },
  legend: { position: 'absolute', left: spacing.md, bottom: spacing.md, gap: spacing.xs },
});
