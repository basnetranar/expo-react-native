import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { EnvironmentControl } from '@/features/experiments/components/environment-control';
import { draftToInterventionCommands } from '@/features/experiments/services/experiment-command-adapter';
import type { EnvironmentDraft, ExperimentsViewModel } from '@/features/experiments/types';
import type { EnvironmentInterventionCommand } from '@/simulation';
import { spacing } from '@/theme';

const durationOptions = ['1', '5', '10', 'indefinite'] as const;

export function EnvironmentControls({ experiments, draft, dirty, onDraft, onApply }: Props) {
  const commands = draftToInterventionCommands(
    draft,
    experiments.environment.factors,
    experiments.environment.ticksPerGeneration,
  );
  const update = (key: keyof EnvironmentDraft, value: number) =>
    onDraft({ ...draft, [key]: value });
  return (
    <AppCard style={styles.card}>
      <View>
        <AppText variant="heading">Environmental controls</AppText>
        <AppText color="secondary">
          Draft changes locally, then apply them to the active simulation on its next tick.
        </AppText>
      </View>
      <EnvironmentControl
        label="Food availability"
        explanation="Scales future soft and hard food regeneration. Existing food is not rewritten."
        current={experiments.current.foodAvailability}
        proposed={draft.foodAvailability}
        onChange={(value) => update('foodAvailability', value)}
      />
      <EnvironmentControl
        label="Water availability"
        explanation="Scales future water replenishment while preserving scenario water-source limits."
        current={experiments.current.waterAvailability}
        proposed={draft.waterAvailability}
        onChange={(value) => update('waterAvailability', value)}
      />
      <EnvironmentControl
        label="Predator pressure"
        explanation="Scales actual predator attack pressure without spawning or removing predators."
        current={experiments.current.predatorPressure}
        proposed={draft.predatorPressure}
        onChange={(value) => update('predatorPressure', value)}
      />
      <View style={styles.duration}>
        <AppText variant="label">Duration</AppText>
        <AppText variant="caption" color="secondary">
          Converted using {experiments.environment.ticksPerGeneration} ticks per generation.
        </AppText>
        <SegmentControl<(typeof durationOptions)[number]>
          label="Intervention duration"
          options={durationOptions}
          value={
            draft.durationGenerations === 0
              ? 'indefinite'
              : (String(draft.durationGenerations) as '1' | '5' | '10')
          }
          onChange={(value) =>
            update('durationGenerations', value === 'indefinite' ? 0 : Number(value))
          }
          getLabel={(value) => (value === 'indefinite' ? 'Indefinite' : `${value} gen`)}
        />
      </View>
      <AppButton
        label={
          dirty && commands.length
            ? `Apply ${commands.length} Change${commands.length === 1 ? '' : 's'}`
            : 'No Draft Changes'
        }
        disabled={!dirty || !commands.length || experiments.status === 'extinct'}
        onPress={() => onApply(commands)}
      />
      <AppText variant="caption" color="secondary">
        Applied changes take effect at tick {experiments.tick + 1}. Paused simulations do not
        advance.
      </AppText>
    </AppCard>
  );
}

interface Props {
  experiments: ExperimentsViewModel;
  draft: EnvironmentDraft;
  dirty: boolean;
  onDraft(value: EnvironmentDraft): void;
  onApply(commands: readonly EnvironmentInterventionCommand[]): void;
}

const styles = StyleSheet.create({ card: { gap: spacing.md }, duration: { gap: spacing.sm } });
