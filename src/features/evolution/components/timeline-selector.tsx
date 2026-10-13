import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, sizing, spacing } from '@/theme';

export function TimelineSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  getLabel,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange(value: T): void;
  getLabel(value: T): string;
}) {
  return (
    <ScrollView
      horizontal
      accessibilityRole="tablist"
      accessibilityLabel={label}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
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
            <AppText variant="caption" style={selected && styles.selectedLabel}>
              {getLabel(option)}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xs },
  option: {
    minHeight: sizing.minimumTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.backgroundElevated,
  },
  selected: { borderColor: colors.accentScience, backgroundColor: colors.surfaceStrong },
  selectedLabel: { color: colors.accentScience, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
