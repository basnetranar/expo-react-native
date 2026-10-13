import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { PopulationIndividualRow as Individual } from '@/features/population/types';
import { stageLabel, traitLabel } from '@/features/population/utils/population-presentation';
import { HOMININ_ASSETS } from '@/features/simulation/utils/simulation-assets';
import type { TraitName } from '@/simulation';
import { colors, radius, sizing, spacing } from '@/theme';

export const PopulationIndividualRow = memo(function PopulationIndividualRow({
  individual,
  selectedTrait,
  onPress,
}: {
  individual: Individual;
  selectedTrait: TraitName;
  onPress(id: string): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Inspect ${individual.name}, ${individual.id}`}
      onPress={() => onPress(individual.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Image
        source={HOMININ_ASSETS[individual.lifeStage][individual.portraitVariant]!}
        contentFit="cover"
        style={styles.portrait}
      />
      <View style={styles.identity}>
        <View style={styles.nameRow}>
          <AppText variant="label">{individual.name}</AppText>
          <View style={styles.liveDot} />
        </View>
        <AppText variant="caption" color="secondary" numberOfLines={1}>
          {individual.id} · G{individual.generation} · Age {individual.age.toFixed(1)}
        </AppText>
        <AppText variant="caption">
          {stageLabel(individual.lifeStage)} · {formatBehaviour(individual.currentBehaviour)}
        </AppText>
      </View>
      <View style={styles.trait}>
        <AppText variant="caption" color="secondary" numberOfLines={1}>
          {traitLabel(selectedTrait)}
        </AppText>
        <AppText variant="label" selectable style={styles.traitValue}>
          {Math.round(individual.traits[selectedTrait])}
        </AppText>
      </View>
      <AppText variant="heading" style={styles.chevron}>
        ›
      </AppText>
    </Pressable>
  );
});

function formatBehaviour(value: string): string {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

const styles = StyleSheet.create({
  row: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.surface,
  },
  portrait: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundElevated,
  },
  identity: { flex: 1, minWidth: 0, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  liveDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.positive },
  trait: { width: 88, alignItems: 'flex-end', gap: 2 },
  traitValue: { color: colors.accentScience },
  chevron: { width: sizing.minimumTouchTarget / 2, color: colors.textSecondary },
  pressed: { opacity: 0.72 },
});
