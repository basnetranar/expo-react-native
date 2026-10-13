import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { HomininInspectorViewModel } from '@/features/hominin/types';
import { SIMULATION_ART } from '@/features/simulation/utils/simulation-assets';
import { colors, radius, spacing } from '@/theme';

export function InspectorIdentityCard({ individual }: { individual: HomininInspectorViewModel }) {
  return (
    <AppCard style={styles.card}>
      <Image source={SIMULATION_ART.portrait} contentFit="cover" style={styles.portrait} />
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <View style={styles.titleCopy}>
            <AppText variant="title" selectable>
              {individual.name}
            </AppText>
            <AppText variant="caption" selectable>
              Stable ID · {individual.id}
            </AppText>
          </View>
          <View style={[styles.status, !individual.alive && styles.deceasedStatus]}>
            <AppText variant="caption" style={styles.statusText}>
              {individual.statusLabel}
            </AppText>
          </View>
        </View>
        <AppText color="secondary" selectable>
          {individual.lifeStage} · Age {individual.age.toFixed(1)} · Generation{' '}
          {individual.generation}
        </AppText>
        <View style={styles.behaviour}>
          <AppText variant="caption" style={styles.eyebrow}>
            {individual.alive ? 'CURRENT BEHAVIOUR' : 'FINAL RECORDED BEHAVIOUR'}
          </AppText>
          <AppText variant="heading">{individual.behaviour}</AppText>
        </View>
        {individual.deathDetail ? (
          <AppText variant="caption" color="secondary" selectable>
            {individual.deathDetail}
          </AppText>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  portrait: { width: '100%', aspectRatio: 2.1 },
  copy: { gap: spacing.sm, padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  titleCopy: { flex: 1 },
  status: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: 'rgba(111, 165, 108, 0.18)',
    borderWidth: 1,
    borderColor: colors.accentNature,
  },
  deceasedStatus: {
    backgroundColor: 'rgba(216, 102, 84, 0.16)',
    borderColor: colors.accentDanger,
  },
  statusText: { color: colors.textPrimary, fontWeight: '700' },
  behaviour: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 0.8 },
});
