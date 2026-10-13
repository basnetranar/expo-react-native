import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { GenerationDetail } from '@/features/evolution/types';
import {
  behaviourLabel,
  traitLabel,
} from '@/features/evolution/utils/evolution-timeline-presentation';
import { colors, spacing } from '@/theme';

const highlightedTraits = [
  'memoryPotential',
  'learningAbility',
  'curiosity',
  'socialSensitivity',
] as const;

export function GenerationDetailCard({ detail }: { detail: GenerationDetail }) {
  return (
    <AppCard>
      <AppText variant="heading">Generation {detail.generation} details</AppText>
      <View style={styles.metrics}>
        <Metric label="Population" value={detail.population} />
        <Metric label="Births" value={detail.births} />
        <Metric label="Deaths" value={detail.deaths} />
      </View>
      <AppText variant="label">Resources and pressure</AppText>
      <AppText variant="caption">
        Food per agent {detail.resources.foodPerAgent.toFixed(1)} · Water per agent{' '}
        {detail.resources.waterPerAgent.toFixed(1)}
      </AppText>
      <AppText variant="caption">
        Resource balance {detail.resources.balance} · Pressure {detail.resourcePressure.toFixed(2)}{' '}
        · Migration {Math.round(detail.migrationRate * 100)}%
      </AppText>
      <AppText variant="label">Inherited trait averages</AppText>
      {highlightedTraits.map((trait) => (
        <AppText key={trait} variant="caption">
          {traitLabel(trait)} {Math.round(detail.averageGenome[trait])}
        </AppText>
      ))}
      <AppText variant="label">Cultural prevalence</AppText>
      {(['stoneCracking', 'socialForaging'] as const).map((behaviour) => (
        <AppText key={behaviour} variant="caption">
          {behaviourLabel(behaviour)} {Math.round(detail.behaviourPrevalence[behaviour] * 100)}%
        </AppText>
      ))}
      <AppText variant="label">Milestones</AppText>
      {detail.milestones.length ? (
        detail.milestones.map((milestone) => (
          <AppText key={milestone.id} variant="caption">
            {milestone.title}
          </AppText>
        ))
      ) : (
        <AppText color="secondary">No milestones were recorded in this generation.</AppText>
      )}
    </AppCard>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="heading" style={styles.value}>
        {value}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', gap: spacing.sm },
  metric: {
    flex: 1,
    gap: 2,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  value: { fontVariant: ['tabular-nums'] },
});
