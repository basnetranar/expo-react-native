import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { deduplicateEvents, presentEvent } from '@/features/simulation/utils/event-presentation';
import type { SimulationEvent } from '@/simulation';
import { colors, spacing } from '@/theme';

export function RecentEventsPanel({
  events,
  onViewAll,
}: {
  events: readonly SimulationEvent[];
  onViewAll(): void;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="label">Recent Events</AppText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open timeline"
          onPress={onViewAll}
        >
          <AppText variant="caption" style={styles.link}>
            View All
          </AppText>
        </Pressable>
      </View>
      {events.length ? (
        deduplicateEvents(events)
          .reverse()
          .slice(0, 4)
          .map((event) => {
            const item = presentEvent(event);
            return (
              <View key={event.id} style={styles.event}>
                <View style={styles.mark} />
                <AppText variant="caption" style={styles.generation}>
                  Gen {event.generation}
                </AppText>
                <View style={styles.eventCopy}>
                  <AppText variant="label" style={styles.eventTitle}>
                    {item.title}
                  </AppText>
                  <AppText variant="caption" numberOfLines={1}>
                    {item.description}
                  </AppText>
                </View>
              </View>
            );
          })
      ) : (
        <AppText variant="caption">No major events yet.</AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm, paddingVertical: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { color: colors.accentScience },
  event: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  mark: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accentDiscovery },
  generation: { width: 46 },
  eventCopy: { flex: 1 },
  eventTitle: { fontSize: 13, lineHeight: 17 },
});
