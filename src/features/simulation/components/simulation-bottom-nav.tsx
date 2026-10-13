import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const items: { label: string; route: Href | null }[] = [
  { label: 'Simulation', route: null },
  { label: 'Population', route: routes.population },
  { label: 'Social', route: routes.social },
  { label: 'Learning', route: routes.learning },
  { label: 'Timeline', route: routes.evolutionTimeline },
];

export function SimulationBottomNav() {
  return (
    <View style={styles.nav} accessibilityRole="tablist">
      {items.map((item) => (
        <Pressable
          key={item.label}
          accessibilityRole="tab"
          accessibilityLabel={`Open ${item.label.toLowerCase()}`}
          accessibilityState={{ selected: !item.route }}
          disabled={!item.route}
          onPress={() => item.route && router.push(item.route)}
          style={({ pressed }) => [styles.item, pressed && styles.pressed]}
        >
          <View style={[styles.dot, !item.route && styles.activeDot]} />
          <AppText variant="caption" style={!item.route && styles.activeLabel}>
            {item.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundElevated,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  item: { flex: 1, minHeight: 58, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textMuted },
  activeDot: { backgroundColor: colors.accentDiscovery },
  activeLabel: { color: colors.accentDiscovery, fontWeight: '700' },
  pressed: { opacity: 0.65 },
});
