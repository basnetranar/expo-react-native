import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { TimelineSelector } from '@/features/evolution/components/timeline-selector';
import type { PopulationTraitStatistic } from '@/features/population/types';
import { traitLabel } from '@/features/population/utils/population-presentation';
import type { TraitName } from '@/simulation';
import { colors, radius, spacing } from '@/theme';

export function TraitOverviewCard({
  traits,
  selected,
  onSelect,
}: {
  traits: readonly PopulationTraitStatistic[];
  selected: TraitName;
  onSelect(value: TraitName): void;
}) {
  const statistic = traits.find((item) => item.trait === selected)!;
  return (
    <AppCard>
      <AppText variant="heading">Inherited trait overview</AppText>
      <AppText variant="caption" color="secondary">
        Genetic potential in the current living population; acquired knowledge is shown separately.
      </AppText>
      <TimelineSelector
        label="Inherited trait"
        options={traits.map((item) => item.trait)}
        value={selected}
        onChange={onSelect}
        getLabel={traitLabel}
      />
      <View style={styles.range}>
        <View style={[styles.rangeFill, rangeStyle(statistic.minimum, statistic.maximum)]} />
        <View style={[styles.averageMarker, { left: `${statistic.average}%` }]} />
      </View>
      <View style={styles.statistics}>
        <Statistic label="Minimum" value={statistic.minimum} />
        <Statistic label="Average" value={statistic.average} accent />
        <Statistic label="Maximum" value={statistic.maximum} />
        <Statistic label="Std. dev." value={statistic.standardDeviation} />
      </View>
    </AppCard>
  );
}

function Statistic({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={styles.statistic}>
      <AppText variant="caption" color="secondary">
        {label}
      </AppText>
      <AppText variant="label" selectable style={accent && styles.accent}>
        {value.toFixed(1)}
      </AppText>
    </View>
  );
}

function rangeStyle(minimum: number, maximum: number) {
  return { left: `${minimum}%` as const, width: `${Math.max(0, maximum - minimum)}%` as const };
}

const styles = StyleSheet.create({
  range: {
    height: 14,
    position: 'relative',
    borderRadius: radius.full,
    backgroundColor: colors.backgroundElevated,
  },
  rangeFill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: radius.full,
    backgroundColor: colors.accentScience,
  },
  averageMarker: {
    position: 'absolute',
    top: -3,
    width: 3,
    height: 20,
    marginLeft: -1,
    borderRadius: 2,
    backgroundColor: colors.accentDiscovery,
  },
  statistics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statistic: { minWidth: 76, flex: 1, gap: spacing.xs },
  accent: { color: colors.accentDiscovery },
});
