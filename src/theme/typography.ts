import type { TextStyle } from 'react-native';

import { colors } from '@/theme/colors';

export const typography = {
  title: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: colors.text },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600', color: colors.text },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400', color: colors.text },
  label: { fontSize: 16, lineHeight: 20, fontWeight: '600', color: colors.text },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400', color: colors.textSecondary },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
