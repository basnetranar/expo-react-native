import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function LearningNavigation({
  selected,
}: {
  selected: 'overview' | 'behaviours' | 'history';
}) {
  const items: { key: typeof selected; label: string; route: Href }[] = [
    { key: 'overview', label: 'Overview', route: routes.learning },
    { key: 'behaviours', label: 'Behaviours', route: routes.learningBehaviours },
    { key: 'history', label: 'Cultural History', route: routes.learningHistory },
  ];
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === item.key }}
          onPress={() => selected !== item.key && router.replace(item.route)}
          style={({ pressed }) => [
            styles.item,
            selected === item.key && styles.selected,
            pressed && styles.pressed,
          ]}
        >
          <AppText variant="label" style={selected === item.key && styles.selectedText}>
            {item.label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
  },
  selected: { backgroundColor: colors.surfaceStrong, borderRadius: radius.sm },
  selectedText: { color: colors.accentScience },
  pressed: { opacity: 0.7 },
});
