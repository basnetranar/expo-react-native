import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { PopulationFilterState, PopulationSort } from '@/features/population/types';
import { behaviourLabel, stageLabel } from '@/features/population/utils/population-presentation';
import type { LearnedBehaviourType, LifeStage } from '@/simulation';
import { colors, radius, sizing, spacing } from '@/theme';

const stages: readonly (LifeStage | 'all')[] = ['all', 'juvenile', 'youngAdult', 'adult', 'old'];
const behaviours: readonly (LearnedBehaviourType | 'all')[] = [
  'all',
  'stoneCracking',
  'socialForaging',
];
const sorts: readonly PopulationSort[] = [
  'age-desc',
  'age-asc',
  'generation',
  'name',
  'trait-desc',
  'trait-asc',
  'health-desc',
];

export function PopulationBrowserControls({
  filters,
  generations,
  onChange,
}: {
  filters: PopulationFilterState;
  generations: readonly number[];
  onChange(next: PopulationFilterState): void;
}) {
  const generationOptions: readonly (number | 'all')[] = ['all', ...generations];
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Search individuals by name or stable ID"
        placeholder="Search name or stable ID…"
        placeholderTextColor={colors.textMuted}
        value={filters.search}
        onChangeText={(search) => onChange({ ...filters, search })}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        style={styles.search}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <CycleButton
          label="Stage"
          value={filters.lifeStage === 'all' ? 'All' : stageLabel(filters.lifeStage)}
          onPress={() => onChange({ ...filters, lifeStage: nextOption(stages, filters.lifeStage) })}
        />
        <CycleButton
          label="Generation"
          value={filters.generation === 'all' ? 'All' : `G${filters.generation}`}
          onPress={() =>
            onChange({
              ...filters,
              generation: nextOption(generationOptions, filters.generation),
            })
          }
        />
        <CycleButton
          label="Learned"
          value={
            filters.learnedBehaviour === 'all' ? 'All' : behaviourLabel(filters.learnedBehaviour)
          }
          onPress={() =>
            onChange({
              ...filters,
              learnedBehaviour: nextOption(behaviours, filters.learnedBehaviour),
            })
          }
        />
        <CycleButton
          label="Sort"
          value={sortLabel(filters.sort)}
          onPress={() => onChange({ ...filters, sort: nextOption(sorts, filters.sort) })}
        />
      </ScrollView>
    </View>
  );
}

function CycleButton({ label, value, onPress }: { label: string; value: string; onPress(): void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Tap for next option.`}
      onPress={onPress}
      style={({ pressed }) => [styles.filter, pressed && styles.pressed]}
    >
      <AppText variant="caption" color="secondary">
        {label}
      </AppText>
      <AppText variant="caption" style={styles.filterValue}>
        {value}⌄
      </AppText>
    </Pressable>
  );
}

function nextOption<T>(options: readonly T[], current: T): T {
  return options[(options.indexOf(current) + 1) % options.length]!;
}

function sortLabel(sort: PopulationSort): string {
  const labels: Record<PopulationSort, string> = {
    'age-desc': 'Age ↓',
    'age-asc': 'Age ↑',
    generation: 'Generation',
    name: 'Name',
    'trait-desc': 'Trait ↓',
    'trait-asc': 'Trait ↑',
    'health-desc': 'Health ↓',
  };
  return labels[sort];
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  search: {
    minHeight: sizing.minimumTouchTarget,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  filters: { gap: spacing.sm },
  filter: {
    minHeight: sizing.minimumTouchTarget,
    minWidth: 108,
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderCurve: 'continuous',
    backgroundColor: colors.backgroundElevated,
  },
  filterValue: { color: colors.accentScience, fontWeight: '700' },
  pressed: { opacity: 0.7 },
});
