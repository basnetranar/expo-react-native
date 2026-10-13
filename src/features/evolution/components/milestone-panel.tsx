import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { EvolutionMilestone, MilestoneCategory } from '@/features/evolution/types';
import { colors, spacing } from '@/theme';

export function MilestonePanel({
  milestones,
  category,
}: {
  milestones: readonly EvolutionMilestone[];
  category: 'all' | MilestoneCategory;
}) {
  const filtered =
    category === 'all' ? milestones : milestones.filter((item) => item.category === category);
  return (
    <AppCard>
      <AppText variant="heading">Major milestones</AppText>
      {filtered.length ? (
        filtered.map((milestone) => (
          <View key={milestone.id} style={styles.row}>
            <View style={[styles.dot, { backgroundColor: categoryColor(milestone.category) }]} />
            <View style={styles.copy}>
              <AppText variant="caption" style={styles.generation}>
                Gen {milestone.generation} · Tick {milestone.tick}
              </AppText>
              <AppText variant="label">{milestone.title}</AppText>
              <AppText variant="caption">{milestone.description}</AppText>
            </View>
          </View>
        ))
      ) : (
        <AppText color="secondary">No recorded milestones match this filter.</AppText>
      )}
    </AppCard>
  );
}

function categoryColor(category: MilestoneCategory): string {
  if (category === 'discovery' || category === 'culture') return colors.accentDiscovery;
  if (category === 'extinction' || category === 'population') return colors.accentDanger;
  if (category === 'environment') return colors.accentNature;
  return colors.accentScience;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  dot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  copy: { flex: 1, gap: 2 },
  generation: { color: colors.accentDiscovery },
});
