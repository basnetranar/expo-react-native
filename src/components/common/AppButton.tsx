import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, sizing, spacing } from '@/theme';

type Variant = 'primary' | 'secondary' | 'destructive';

interface Props {
  label: string;
  onPress(): void;
  variant?: Variant;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled,
  accessibilityLabel,
}: Props) {
  const backgroundColor =
    variant === 'primary'
      ? colors.primary
      : variant === 'destructive'
        ? colors.destructive
        : colors.surface;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      pressRetentionOffset={spacing.sm}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <AppText
        variant="label"
        style={{ color: variant === 'secondary' ? colors.text : colors.onPrimary }}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: sizing.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.45 },
});
