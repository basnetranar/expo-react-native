import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { sizing, spacing } from '@/theme';

interface Props {
  icon: ReactNode;
  accessibilityLabel: string;
  onPress(): void;
  disabled?: boolean;
}

export function IconButton({ icon, accessibilityLabel, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={spacing.sm}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: sizing.minimumTouchTarget,
    minHeight: sizing.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  disabled: { opacity: 0.4 },
});
