import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import {
  interventionTypeLabel,
  interventionValueLabel,
} from '@/features/experiments/utils/experiment-presentation';
import type { EnvironmentIntervention } from '@/simulation';
import { colors, spacing } from '@/theme';

export function ActiveInterventions({
  items,
  tick,
  onCancel,
}: {
  items: readonly EnvironmentIntervention[];
  tick: number;
  onCancel(id: string): void;
}) {
  return (
    <AppCard>
      <AppText variant="heading">Active interventions</AppText>
      {items.length ? (
        items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.copy}>
              <View style={styles.titleRow}>
                <AppText variant="label">{interventionTypeLabel(item.type)}</AppText>
                <AppText
                  variant="caption"
                  style={item.status === 'active' ? styles.active : styles.scheduled}
                >
                  {item.status.toUpperCase()}
                </AppText>
              </View>
              <AppText color="secondary">{interventionValueLabel(item.type, item.value)}</AppText>
              <AppText variant="caption" color="secondary">
                Starts tick {item.startTick} · {remainingLabel(item, tick)}
              </AppText>
            </View>
            <AppButton label="Cancel" variant="secondary" onPress={() => onCancel(item.id)} />
          </View>
        ))
      ) : (
        <AppText color="secondary">No scheduled or active interventions.</AppText>
      )}
    </AppCard>
  );
}

export function InterventionHistory({
  items,
  discarded,
}: {
  items: readonly EnvironmentIntervention[];
  discarded: number;
}) {
  return (
    <AppCard>
      <AppText variant="heading">Intervention history</AppText>
      {items.length ? (
        items.map((item) => (
          <View key={item.id} style={styles.historyRow}>
            <View style={styles.copy}>
              <AppText variant="label">{interventionTypeLabel(item.type)}</AppText>
              <AppText variant="caption" color="secondary">
                {interventionValueLabel(item.type, item.value)}
              </AppText>
            </View>
            <View style={styles.historyMeta}>
              <AppText
                variant="caption"
                style={item.status === 'cancelled' ? styles.cancelled : styles.completed}
              >
                {item.status}
              </AppText>
              <AppText variant="caption" color="secondary">
                Tick {item.endTick ?? item.startTick}
              </AppText>
            </View>
          </View>
        ))
      ) : (
        <AppText color="secondary">No intervention has completed or been cancelled.</AppText>
      )}
      {discarded ? (
        <AppText variant="caption" color="secondary">
          {discarded} older terminal records were discarded under the documented history limit.
        </AppText>
      ) : null}
    </AppCard>
  );
}

function remainingLabel(item: EnvironmentIntervention, tick: number) {
  if (item.status === 'scheduled') return 'waiting for next tick';
  if (item.durationTicks === null) return 'indefinite';
  return `${Math.max(0, item.startTick + item.durationTicks - tick)} ticks remaining`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  copy: { flex: 1, gap: spacing.xs },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  active: { color: colors.positive, fontWeight: '800' },
  scheduled: { color: colors.accentScience, fontWeight: '800' },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  historyMeta: { alignItems: 'flex-end', gap: spacing.xs },
  completed: { color: colors.positive },
  cancelled: { color: colors.textMuted },
});
