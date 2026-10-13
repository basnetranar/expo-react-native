import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, sizing, spacing } from '@/theme';

export function SegmentControl<T extends string>({
  options,
  value,
  onChange,
  label,
  getLabel = (option) => option,
}: Props<T>) {
  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={styles.container}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option)}
            style={({ pressed }) => [
              styles.option,
              selected && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            <AppText variant="caption" style={selected && styles.selectedText}>
              {getLabel(option)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

interface Props<T extends string> {
  options: readonly T[];
  value: T;
  onChange(value: T): void;
  label: string;
  getLabel?(value: T): string;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  option: {
    minHeight: sizing.minimumTouchTarget,
    flex: 1,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
  },
  selected: { backgroundColor: colors.surfaceStrong },
  selectedText: { color: colors.accentDiscovery, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
