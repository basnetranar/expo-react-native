import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { WorldFactorSlider } from '@/components/common/WorldFactorSlider';
import { colors, radius, sizing, spacing } from '@/theme';

export function EnvironmentControl({ label, explanation, current, proposed, onChange }: Props) {
  const changed = proposed !== current;
  return (
    <View style={[styles.container, changed && styles.changed]}>
      <View style={styles.heading}>
        <View style={styles.copy}>
          <AppText variant="label">{label}</AppText>
          <AppText variant="caption" color="secondary">
            {explanation}
          </AppText>
        </View>
        <View style={styles.values}>
          <AppText variant="caption" color="secondary">
            Current {current}%
          </AppText>
          <AppText variant="label" style={changed && styles.proposed}>
            Proposed {proposed}%
          </AppText>
        </View>
      </View>
      <WorldFactorSlider
        label={`${label} proposed value`}
        value={proposed}
        min={50}
        max={150}
        step={5}
        onValueChange={onChange}
      />
      <View style={styles.footer}>
        <AppText variant="caption" color="secondary">
          50% minimum · 150% maximum
        </AppText>
        <Pressable
          accessibilityRole="button"
          disabled={!changed}
          onPress={() => onChange(current)}
          style={({ pressed }) => [
            styles.reset,
            !changed && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="caption" style={styles.resetText}>
            Reset to current
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

interface Props {
  label: string;
  explanation: string;
  current: number;
  proposed: number;
  onChange(value: number): void;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  changed: { borderColor: colors.accentScience },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  copy: { flex: 1, minWidth: 150, gap: spacing.xs },
  values: { flexShrink: 0, alignItems: 'flex-end', gap: spacing.xs },
  proposed: { color: colors.accentDiscovery, fontVariant: ['tabular-nums'] },
  footer: {
    minHeight: sizing.minimumTouchTarget,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  reset: {
    minHeight: sizing.minimumTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  resetText: { color: colors.accentScience },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.65 },
});
