import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

const modes = [
  ['Planning', ''],
  ['Timeline', '/timeline'],
  ['Crew', '/crew'],
  ['Equipment', '/equipment'],
] as const;

export function PlanningNavigation({ missionId, active }: { missionId: string; active: string }) {
  return (
    <View style={styles.container}>
      {modes.map(([label, suffix]) => (
        <Pressable
          key={label}
          accessibilityRole="tab"
          accessibilityState={{ selected: label === active }}
          onPress={() => router.replace(`/mission/${missionId}/plan${suffix}`)}
          style={[styles.item, label === active && styles.active]}
        >
          <AppText variant="caption" style={label === active && styles.activeText}>
            {label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.xs,
    padding: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
  },
  active: { backgroundColor: colors.surfaceRaised },
  activeText: { color: colors.primary, fontWeight: '800' },
});
