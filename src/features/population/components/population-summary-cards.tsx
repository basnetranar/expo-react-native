import { StyleSheet, View } from 'react-native';

import { MetricTile } from '@/components/common/MetricTile';
import type { PopulationOverviewSnapshot } from '@/features/population/types';
import { colors, spacing } from '@/theme';

export function PopulationSummaryCards({
  population,
  showDiversity,
}: {
  population: PopulationOverviewSnapshot;
  showDiversity: boolean;
}) {
  const compact = !showDiversity;
  return (
    <View style={styles.grid}>
      <MetricTile
        label="Living"
        value={`${population.living}${formatChange(population.populationChange)}`}
        accent={colors.positive}
        style={compact ? styles.compactTile : undefined}
      />
      <MetricTile
        label="Peak"
        value={String(population.peakPopulation)}
        style={compact ? styles.compactTile : undefined}
      />
      <MetricTile
        label={compact ? 'Births · gen' : 'Births · this generation'}
        value={String(population.birthsThisGeneration)}
        accent={colors.accentDiscovery}
        style={compact ? styles.compactTile : undefined}
      />
      <MetricTile
        label={compact ? 'Deaths · gen' : 'Deaths · this generation'}
        value={String(population.deathsThisGeneration)}
        accent={colors.accentDanger}
        style={compact ? styles.compactTile : undefined}
      />
      {showDiversity ? (
        <MetricTile
          label="Trait variation index"
          value={
            population.diversity.index === null ? '—' : `${population.diversity.index.toFixed(1)}%`
          }
          accent={colors.accentScience}
        />
      ) : null}
    </View>
  );
}

function formatChange(change: number | null): string {
  if (change === null || change === 0) return '';
  return ` ${change > 0 ? '+' : '−'}${Math.abs(change)}`;
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  compactTile: { minWidth: 0, padding: spacing.sm },
});
