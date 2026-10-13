import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

export function OnboardingProgress({ current, count }: { current: number; count: number }) {
  return (
    <View accessibilityLabel={`Introduction step ${current + 1} of ${count}`} style={styles.row}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={[styles.dot, index === current && styles.active]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.textMuted },
  active: { width: 24, backgroundColor: colors.accentScience },
});
