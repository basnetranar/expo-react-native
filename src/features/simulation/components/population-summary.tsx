import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SimulationSessionSnapshot } from '@/features/simulation/types';
import type { LifeStageCounts } from '@/simulation';
import { colors, radius, spacing } from '@/theme';

export function PopulationSummary({ snapshot }: { snapshot: SimulationSessionSnapshot }) {
  const counts = snapshot.latestStats?.lifeStages ?? countStages(snapshot);
  const total = Math.max(1, snapshot.populationSize);
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText variant="label" style={styles.sectionTitle}>
          Population
        </AppText>
        <AppText variant="metric">{snapshot.populationSize}</AppText>
      </View>
      <View style={styles.bar}>
        {(Object.keys(counts) as (keyof LifeStageCounts)[]).map((stage, index) => (
          <View
            key={stage}
            style={{
              flex: counts[stage] / total,
              minWidth: counts[stage] ? 2 : 0,
              backgroundColor: stageColors[index],
            }}
          />
        ))}
      </View>
      <View style={styles.stages}>
        <Stage label="Juvenile" value={counts.juvenile} />
        <Stage label="Young Adult" value={counts.youngAdult} />
        <Stage label="Adult" value={counts.adult} />
        <Stage label="Old" value={counts.old} />
      </View>
      <View style={styles.totals}>
        <AppText variant="caption">Births {snapshot.latestStats?.births ?? 0}</AppText>
        <AppText variant="caption">Deaths {snapshot.latestStats?.deaths ?? 0}</AppText>
      </View>
    </View>
  );
}

function countStages(snapshot: SimulationSessionSnapshot): LifeStageCounts {
  const counts: LifeStageCounts = { juvenile: 0, youngAdult: 0, adult: 0, old: 0 };
  for (const agent of snapshot.aliveAgents) counts[agent.phenotype.lifeStage] += 1;
  return counts;
}

function Stage({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stage}>
      <AppText variant="label" style={styles.stageNumber}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.stageLabel}>
        {label}
      </AppText>
    </View>
  );
}

const stageColors = [
  colors.accentScience,
  colors.resourceWater,
  colors.accentDiscovery,
  colors.textMuted,
] as const;

const styles = StyleSheet.create({
  section: { gap: spacing.sm, paddingVertical: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.accentScience },
  bar: { flexDirection: 'row', height: 10, borderRadius: radius.full, overflow: 'hidden' },
  stages: { flexDirection: 'row', gap: spacing.xs },
  stage: { flex: 1, alignItems: 'center' },
  stageNumber: { fontVariant: ['tabular-nums'] },
  stageLabel: { fontSize: 10, textAlign: 'center' },
  totals: { flexDirection: 'row', justifyContent: 'space-between' },
});
