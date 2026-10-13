import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const items = [
  { label: 'Simulation', route: routes.simulation },
  { label: 'Population', route: routes.population },
  { label: 'Timeline', route: routes.evolutionTimeline },
  { label: 'Family Tree', route: null },
  { label: 'Experiments', route: routes.experiments },
  { label: 'Histories', route: routes.histories },
  { label: 'World', route: routes.worldOverview },
  { label: 'Settings', route: routes.settings },
] as const;

export function LineageLeftRail() {
  return (
    <View style={styles.rail}>
      <AppText variant="heading" style={styles.brand}>
        FIRST{`\n`}MINDS
      </AppText>
      {items.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="button"
          accessibilityState={{ selected: item.route === null }}
          disabled={!item.route}
          onPress={() => item.route && router.push(item.route)}
          style={({ pressed }) => [
            styles.item,
            item.route === null && styles.selected,
            pressed && styles.pressed,
          ]}
        >
          <View style={[styles.dot, item.route === null && styles.selectedDot]} />
          <AppText variant="caption" style={item.route === null && styles.selectedText}>
            {item.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    width: 148,
    flexShrink: 0,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    backgroundColor: colors.backgroundElevated,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.border,
  },
  brand: { letterSpacing: 1.4, paddingBottom: spacing.lg },
  item: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  selected: { backgroundColor: colors.surfaceStrong },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  selectedDot: { backgroundColor: colors.accentScience },
  selectedText: { color: colors.accentScience, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
