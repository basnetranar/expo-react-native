import type { PropsWithChildren } from 'react';
import { Text, type TextProps } from 'react-native';

import { colors, typography, type TypographyVariant } from '@/theme';

interface Props extends TextProps {
  variant?: TypographyVariant;
  color?: 'default' | 'secondary' | 'destructive';
}

export function AppText({
  variant = 'body',
  color = 'default',
  style,
  children,
  ...props
}: PropsWithChildren<Props>) {
  const textColor =
    color === 'secondary'
      ? colors.textSecondary
      : color === 'destructive'
        ? colors.destructive
        : colors.text;
  return (
    <Text allowFontScaling style={[typography[variant], { color: textColor }, style]} {...props}>
      {children}
    </Text>
  );
}
