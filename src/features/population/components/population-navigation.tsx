import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const items: readonly { label: string; route: Href | 'back' | null }[] = [
  { label: 'Simulation', route: 'back' },
  { label: 'Population', route: null },
  { label: 'Timeline', route: routes.evolutionTimeline },
  { label: 'Family Tree', route: routes.lineage() },
  { label: 'Experiments', route: routes.experiments },
  { label: 'Histories', route: routes.histories },
  { label: 'World', route: routes.worldOverview },
  { label: 'Settings', route: routes.settings },
];

export function PopulationBottomNav() {
  return (
    <View style={styles.bottom} accessibilityRole="tablist">
      {items
        .filter((item) => !['World', 'Family Tree', 'Experiments'].includes(item.label))
        .map((item) => (
          <NavigationItem key={item.label} item={item} compact />
        ))}
    </View>
  );
}

export function PopulationLeftRail() {
  return (
    <View style={styles.rail}>
      <AppText variant="heading" style={styles.brand}>
        FIRST{`\n`}MINDS
      </AppText>
      {items.map((item) => (
        <NavigationItem key={item.label} item={item} />
      ))}
    </View>
  );
}

function NavigationItem({ item, compact }: { item: (typeof items)[number]; compact?: boolean }) {
  const selected = item.route === null;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      disabled={selected}
      onPress={() => navigate(item.route)}
      style={({ pressed }) => [
        compact ? styles.bottomItem : styles.railItem,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.dot, selected && styles.selectedDot]} />
      <AppText variant="caption" style={selected && styles.selectedText}>
        {item.label}
      </AppText>
    </Pressable>
  );
}

function navigate(route: Href | 'back' | null) {
  if (route === 'back') {
    if (router.canGoBack()) router.back();
    else router.replace(routes.simulation);
  } else if (route) router.push(route);
}

const styles = StyleSheet.create({
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
  selected: { backgroundColor: colors.surfaceStrong },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.textMuted },
  selectedDot: { backgroundColor: colors.accentScience },
  selectedText: { color: colors.accentScience, fontWeight: '800' },
  pressed: { opacity: 0.7 },
});
