import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SimulationSpeed, SimulationStatus } from '@/features/simulation/types';
import { colors, radius, sizing, spacing } from '@/theme';

const speeds: SimulationSpeed[] = [1, 5, 10, 50];

export function SimulationControls({
  status,
  speed,
  onToggle,
  onSpeed,
}: {
  status: SimulationStatus;
  speed: SimulationSpeed;
  onToggle(): void;
  onSpeed(speed: SimulationSpeed): void;
}) {
  const running = status === 'running';
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={running ? 'Pause simulation' : 'Resume simulation'}
        disabled={status === 'extinct'}
        onPress={onToggle}
        style={({ pressed }) => [
          styles.play,
          pressed && styles.pressed,
          status === 'extinct' && styles.disabled,
        ]}
      >
        <AppText variant="heading" style={styles.playText}>
          {running ? 'Ⅱ' : '▶'}
        </AppText>
      </Pressable>
      <View style={styles.speeds}>
        {speeds.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityLabel={`Set speed to ${value} times`}
            accessibilityState={{ selected: speed === value }}
            onPress={() => onSpeed(value)}
            style={({ pressed }) => [
              styles.speed,
              speed === value && styles.speedSelected,
              pressed && styles.pressed,
            ]}
          >
            <AppText variant="label" style={speed === value && styles.speedSelectedText}>
              {value}x
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  play: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.accentDiscovery,
    backgroundColor: colors.surface,
  },
  playText: { color: colors.accentDiscovery },
  speeds: { flex: 1, flexDirection: 'row', gap: spacing.xs },
  speed: {
    flex: 1,
    minWidth: sizing.minimumTouchTarget,
    minHeight: sizing.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  speedSelected: {
    borderColor: colors.accentDiscovery,
    backgroundColor: 'rgba(243, 183, 79, 0.16)',
  },
  speedSelectedText: { color: colors.accentDiscovery },
  pressed: { opacity: 0.68 },
  disabled: { opacity: 0.4 },
});
