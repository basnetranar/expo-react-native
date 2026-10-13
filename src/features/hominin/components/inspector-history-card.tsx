import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { HomininInspectorViewModel, InspectorHistoryItem } from '@/features/hominin/types';
import { colors, spacing } from '@/theme';

export function InspectorHistoryCard({ individual }: { individual: HomininInspectorViewModel }) {
  return (
    <AppCard>
      <AppText variant="heading">Recorded life history</AppText>
      <AppText color="secondary">
        Chronology uses retained memory, learning, and death timestamps recorded by the engine.
      </AppText>
      {individual.history.length ? (
        <View style={styles.timeline}>
          {individual.history.map((item) => (
            <HistoryRow key={item.key} item={item} />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <AppText variant="label">No timestamped history available</AppText>
          <AppText variant="caption">
            This individual has no retained memories, learning milestones, or death record yet.
          </AppText>
        </View>
      )}
      <AppText variant="caption">
        Retained memories: {individual.retainedMemoryCount}. Memories may decay, so this is not a
        complete biography.
      </AppText>
    </AppCard>
  );
}

function HistoryRow({ item }: { item: InspectorHistoryItem }) {
  const color =
    item.tone === 'death'
      ? colors.accentDanger
      : item.tone === 'learning'
        ? colors.accentDiscovery
        : colors.accentScience;
  return (
    <View style={styles.row}>
      <View style={[styles.marker, { backgroundColor: color }]} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <AppText variant="label">{item.title}</AppText>
          <AppText variant="caption" selectable style={styles.tick}>
            Tick {item.tick}
          </AppText>
        </View>
        <AppText variant="caption">{item.description}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timeline: { gap: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.sm },
  marker: { width: 8, height: 8, marginTop: 6, borderRadius: 4 },
  copy: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  tick: { fontVariant: ['tabular-nums'] },
  empty: { gap: spacing.xs, paddingVertical: spacing.sm },
});
