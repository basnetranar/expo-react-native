import { StatusBar, type StatusBarStyle } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, sizing, spacing } from '@/theme';

interface Props {
  scroll?: boolean;
  maxWidth?: 'content' | 'readable' | 'none';
  edges?: Edge[];
  style?: ViewStyle;
  statusBarStyle?: StatusBarStyle;
}

export function AppScreen({
  children,
  scroll,
  maxWidth = 'content',
  edges = ['bottom'],
  style,
  statusBarStyle = 'auto',
}: PropsWithChildren<Props>) {
  const { isTablet } = useResponsiveLayout();
  const width =
    maxWidth === 'none'
      ? undefined
      : maxWidth === 'readable'
        ? sizing.readableMaxWidth
        : sizing.contentMaxWidth;
  const contentStyle = [
    styles.content,
    { paddingHorizontal: isTablet ? spacing.xl : spacing.md, maxWidth: width },
    style,
  ];

  return (
    <SafeAreaView edges={edges} style={styles.safeArea}>
      <StatusBar style={statusBarStyle} />
      {scroll ? (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={contentStyle}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    alignSelf: 'center',
    flexGrow: 1,
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
});
