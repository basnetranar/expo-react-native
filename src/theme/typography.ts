import type { TextStyle } from 'react-native';

import { colors } from '@/theme/colors';

export const typography = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: '900', color: colors.text },
  title: { fontSize: 32, lineHeight: 38, fontWeight: '800', color: colors.text },
  heading: { fontSize: 21, lineHeight: 27, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400', color: colors.text },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '700', color: colors.text },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400', color: colors.textSecondary },
  metric: { fontSize: 24, lineHeight: 29, fontWeight: '800', color: colors.text },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
