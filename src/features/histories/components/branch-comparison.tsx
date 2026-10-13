import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import type { EvolutionBranch } from '@/features/histories/types';
import {
  branchColor,
  branchPopulationSeries,
} from '@/features/histories/utils/history-presentation';
import { colors, spacing } from '@/theme';

export function BranchComparison({ branches }: { branches: readonly EvolutionBranch[] }) {
  type Metric = 'population' | 'births' | 'deaths' | 'stoneCracking' | 'memoryPotential';
  const [metric, setMetric] = useState<Metric>('population');
  const summaryValue = (summary: EvolutionBranch['history'][number]) => {
    if (metric === 'stoneCracking') return summary.behaviourPrevalence.stoneCracking * 100;
    if (metric === 'memoryPotential') return summary.averageGenome.memoryPotential;
    return summary[metric];
  };
  const values = branches.flatMap((branch) => branch.history.map(summaryValue));
  if (metric === 'population') values.push(...branches.map((branch) => branch.population));
  const maxValue = Math.max(1, ...values);
  return (
    <AppCard accessibilityLabel="Population comparison across histories">
      <AppText variant="heading">Population comparison</AppText>
      <AppText variant="caption" color="secondary">
        Recorded values only. No missing generations are interpolated.
      </AppText>
      <SegmentControl<Metric>
        label="Comparison metric"
        options={['population', 'births', 'deaths', 'stoneCracking', 'memoryPotential'] as const}
        value={metric}
        onChange={setMetric}
        getLabel={(value) =>
          value === 'stoneCracking'
            ? 'Stone cracking'
            : value === 'memoryPotential'
              ? 'Memory'
              : `${value[0]!.toUpperCase()}${value.slice(1)}`
        }
      />
      <View style={styles.chart}>
        {branches.map((branch) => {
          const populationSeries = branchPopulationSeries(branch);
          const series =
            metric === 'population'
              ? populationSeries.map((point) => ({
                  generation: point.generation,
                  value: point.population,
                }))
              : branch.history.map((summary) => ({
                  generation: summary.generation,
                  value: summaryValue(summary),
                }));
          const color = branchColor(branches, branch.id);
          return (
            <View key={branch.id} style={styles.row}>
              <View style={[styles.legend, { backgroundColor: color }]} />
              <View style={styles.rowText}>
                <AppText variant="label" numberOfLines={1}>
                  {branch.name}
                </AppText>
                <AppText variant="caption" color="secondary">
                  Gen {branch.generation} · Pop {branch.population}
                </AppText>
              </View>
              <View style={styles.spark}>
                {series.slice(-18).map((point, index) => (
                  <View
                    key={`${point.generation}-${index}`}
                    accessibilityLabel={`Generation ${point.generation}, ${metric} ${point.value}`}
                    style={[
                      styles.bar,
                      {
                        height: Math.max(3, (point.value / maxValue) * 64),
                        backgroundColor: color,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>
    </AppCard>
  );
}

export function BranchDiagram({
  branches,
  selectedId,
}: {
  branches: readonly EvolutionBranch[];
  selectedId: string;
}) {
  return (
    <AppCard>
      <AppText variant="heading">Evolutionary branches</AppText>
      <View style={styles.diagram}>
        {branches.map((branch) => (
          <View key={branch.id} style={styles.branchLine}>
            <View
              style={[
                styles.node,
                { borderColor: branchColor(branches, branch.id) },
                branch.id === selectedId && styles.selectedNode,
              ]}
            />
            <View style={styles.branchCopy}>
              <AppText variant="label">{branch.name}</AppText>
              <AppText variant="caption" color="secondary">
                {branch.parentBranchId
                  ? `Diverged at generation ${branch.originGeneration}`
                  : 'World start'}{' '}
                · Gen {branch.generation} · Pop {branch.population}
              </AppText>
            </View>
            <AppText
              variant="caption"
              style={branch.status === 'active' ? styles.live : styles.paused}
            >
              {branch.status.toUpperCase()}
            </AppText>
          </View>
        ))}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  chart: { gap: spacing.md, paddingTop: spacing.sm },
  row: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  legend: { width: 10, height: 10, borderRadius: 5 },
  rowText: { width: 132, gap: 2 },
  spark: {
    flex: 1,
    height: 68,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  bar: {
    flex: 1,
    minWidth: 3,
    maxWidth: 16,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    opacity: 0.9,
  },
  diagram: { gap: spacing.sm },
  branchLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 58,
    paddingVertical: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  node: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 4,
    backgroundColor: colors.background,
  },
  selectedNode: { transform: [{ scale: 1.25 }] },
  branchCopy: { flex: 1, gap: 2 },
  live: { color: colors.positive, fontWeight: '800' },
  paused: { color: colors.textMuted },
});
