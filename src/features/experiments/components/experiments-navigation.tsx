import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const items: readonly { label: string; route: Href | null }[] = [
  { label: 'Simulation', route: routes.simulation },
  { label: 'Population', route: routes.population },
  { label: 'Timeline', route: routes.evolutionTimeline },
  { label: 'Family Tree', route: routes.lineage() },
  { label: 'Experiments', route: null },
  { label: 'Histories', route: routes.histories },
  { label: 'World', route: routes.worldOverview },
  { label: 'Settings', route: routes.settings },
];

export function ExperimentsNavigation({ compact = false }: { compact?: boolean }) {
  return (
    <View style={compact ? styles.bottom : styles.rail} accessibilityRole="tablist">
      {!compact ? (
        <AppText variant="heading" style={styles.brand}>
          FIRST{`\n`}MINDS
        </AppText>
      ) : null}
      {items
        .filter((item) => !compact || !['World', 'Family Tree', 'Settings'].includes(item.label))
        .map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: item.route === null }}
            disabled={!item.route}
            onPress={() => item.route && router.push(item.route)}
            style={({ pressed }) => [
              compact ? styles.bottomItem : styles.railItem,
              item.route === null && styles.selected,
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.dot, item.route === null && styles.selectedDot]} />
            <AppText
              variant="caption"
              style={[compact && styles.compactLabel, item.route === null && styles.selectedText]}
            >
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
  railItem: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  bottom: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  bottomItem: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  selected: { backgroundColor: colors.surfaceStrong },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  selectedDot: { backgroundColor: colors.accentScience },
  selectedText: { color: colors.accentScience, fontWeight: '800' },
  compactLabel: { fontSize: 10 },
  pressed: { opacity: 0.65 },
});
