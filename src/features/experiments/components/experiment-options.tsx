import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { experimentPresets } from '@/features/experiments/data/presets';
import { environmentalEventCommand } from '@/features/experiments/services/experiment-command-adapter';
import type { EnvironmentDraft, ExperimentsViewModel } from '@/features/experiments/types';
import type { EnvironmentInterventionCommand } from '@/simulation';
import { colors, radius, spacing } from '@/theme';

const world = require('../../../../assets/world-savannah-background.png');

export function EnvironmentPreview({ experiments }: { experiments: ExperimentsViewModel }) {
  return (
    <AppCard style={styles.previewCard}>
      <AppText variant="heading">Current world</AppText>
      <View style={styles.preview}>
        <Image source={world} contentFit="cover" style={styles.image} />
        <View style={styles.previewOverlay}>
          <AppText variant="label">Live environmental values</AppText>
          <AppText variant="caption">
            Food regeneration {experiments.environment.effective.foodRegeneration.toFixed(2)}/tick
          </AppText>
          <AppText variant="caption">
            Water replenishment {experiments.environment.effective.waterRegeneration.toFixed(2)}
            /tick
          </AppText>
          <AppText variant="caption">
            Predator pressure ×{experiments.environment.effective.predatorPressure.toFixed(2)}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" color="secondary">
        Static Savannah artwork with actual current values; it is not a forecast.
      </AppText>
    </AppCard>
  );
}

export function ExperimentPresets({
  draft,
  onDraft,
}: {
  draft: EnvironmentDraft;
  onDraft(value: EnvironmentDraft): void;
}) {
  return (
    <AppCard>
      <AppText variant="heading">Draft presets</AppText>
      <AppText color="secondary">
        Presets populate the controls only. Review and apply them separately.
      </AppText>
      {experimentPresets.map((preset) => (
        <View key={preset.id} style={styles.optionRow}>
          <View style={styles.optionCopy}>
            <AppText variant="label">{preset.name}</AppText>
            <AppText variant="caption" color="secondary">
              {preset.explanation}
            </AppText>
          </View>
          <AppButton
            label="Use"
            variant="secondary"
            onPress={() => onDraft({ ...draft, ...preset.values })}
          />
        </View>
      ))}
    </AppCard>
  );
}

export function EnvironmentalEvents({
  ticksPerGeneration,
  disabled,
  onApply,
}: {
  ticksPerGeneration: number;
  disabled?: boolean;
  onApply(command: EnvironmentInterventionCommand): void;
}) {
  const events: readonly {
    name: string;
    detail: string;
    command: EnvironmentInterventionCommand;
  }[] = [
    {
      name: 'Drought',
      detail: 'Food ×0.65 and water ×0.40 for 5 generations.',
      command: environmentalEventCommand('drought', 5, ticksPerGeneration),
    },
    {
      name: 'Food scarcity',
      detail: 'Food regeneration ×0.60 for 5 generations.',
      command: environmentalEventCommand('foodScarcity', 5, ticksPerGeneration),
    },
    {
      name: 'Food abundance',
      detail: 'Food regeneration ×1.40 for 5 generations.',
      command: environmentalEventCommand('foodAbundance', 5, ticksPerGeneration),
    },
    {
      name: 'Increased predator pressure',
      detail: 'Attack pressure ×1.50 for 5 generations.',
      command: environmentalEventCommand('predatorIncrease', 5, ticksPerGeneration),
    },
    {
      name: 'Reduced predator pressure',
      detail: 'Attack pressure ×0.60 for 5 generations.',
      command: environmentalEventCommand('predatorReduction', 5, ticksPerGeneration),
    },
  ];
  return (
    <AppCard>
      <AppText variant="heading">Temporary environmental events</AppText>
      <AppText color="secondary">
        Each event changes real parameters at the next tick; outcomes remain emergent.
      </AppText>
      {events.map((event) => (
        <View key={event.name} style={styles.optionRow}>
          <View style={styles.optionCopy}>
            <AppText variant="label">{event.name}</AppText>
            <AppText variant="caption" color="secondary">
              {event.detail}
            </AppText>
          </View>
          <AppButton
            label="Schedule"
            variant="secondary"
            disabled={Boolean(disabled)}
            onPress={() => onApply(event.command)}
          />
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  previewCard: { overflow: 'hidden' },
  preview: {
    minHeight: 230,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  image: { position: 'absolute', inset: 0 },
  previewOverlay: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: 'rgba(3, 12, 21, 0.78)',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionCopy: { flex: 1, gap: spacing.xs },
});
