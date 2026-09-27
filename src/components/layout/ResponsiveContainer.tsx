import type { PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { spacing } from '@/theme';

export function ResponsiveContainer({ children }: PropsWithChildren) {
  const { isTablet } = useResponsiveLayout();
  return <View style={[styles.container, isTablet && styles.tablet]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: { width: '100%', gap: spacing.md },
  tablet: { flexDirection: 'row', alignItems: 'flex-start' },
});
