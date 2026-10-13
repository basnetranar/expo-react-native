import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { presentEvent } from '@/features/simulation/utils/event-presentation';
import type { SimulationEvent } from '@/simulation';
import { colors, radius, spacing } from '@/theme';

export function LatestEventCard({
  event,
  onPress,
}: {
  event: SimulationEvent | undefined;
  onPress(): void;
}) {
  if (!event)
    return (
      <View style={styles.card}>
        <View style={styles.eventMark} />
        <View style={styles.copy}>
          <AppText variant="caption" style={styles.eyebrow}>
            LATEST EVENT
          </AppText>
          <AppText variant="label">The world is taking shape</AppText>
          <AppText variant="caption">Start the simulation to observe emergent change.</AppText>
        </View>
      </View>
    );
  const item = presentEvent(event);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open timeline. ${item.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {item.artwork ? (
        <Image source={item.artwork} contentFit="cover" style={styles.artwork} />
      ) : (
        <View style={styles.eventMark} />
      )}
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="caption" style={styles.eyebrow}>
            LATEST EVENT
          </AppText>
          <AppText variant="caption">Gen {event.generation}</AppText>
        </View>
        <AppText variant="label" style={styles.title}>
          {item.title}
        </AppText>
        <AppText variant="caption">{item.description}</AppText>
      </View>
      <AppText variant="heading">›</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 94,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  artwork: { width: 70, height: 70, borderRadius: radius.sm },
  eventMark: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.accentDiscovery,
  },
  copy: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  eyebrow: { color: colors.accentDiscovery, fontWeight: '700' },
  title: { color: colors.textPrimary },
  pressed: { opacity: 0.72 },
});
