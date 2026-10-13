import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function SocialNavigation({ selected }: { selected: 'groups' | 'activity' | 'insights' }) {
  const items: { key: typeof selected; label: string; route: Href }[] = [
    { key: 'groups', label: 'Groups', route: routes.social },
    { key: 'activity', label: 'Activity', route: routes.socialActivity },
    { key: 'insights', label: 'Insights', route: routes.socialInsights },
  ];
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {items.map((item) => (
        <Pressable
          key={item.key}
          accessibilityRole="tab"
          accessibilityState={{ selected: selected === item.key }}
          onPress={() => selected !== item.key && router.replace(item.route)}
          style={[styles.item, selected === item.key && styles.selected]}
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
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  selected: { backgroundColor: colors.surfaceStrong, borderRadius: radius.sm },
  selectedText: { color: colors.accentScience },
});
