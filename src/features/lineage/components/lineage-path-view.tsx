import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { TraitBar } from '@/components/common/TraitBar';
import { LineageNode } from '@/features/lineage/components/lineage-node';
import type { FamilyTreeViewModel, LineageIndex } from '@/features/lineage/types';
import {
  getLineagePath,
  getLineageTraitComparison,
} from '@/features/lineage/utils/lineage-selectors';
import type { TraitName } from '@/simulation';
import { colors, spacing } from '@/theme';

export function LineagePathView({ family, index, onSelect }: Props) {
  const ancestors = [...family.lineage.ancestors].reverse();
  const descendants = family.lineage.descendants;
  const startOptions = [...ancestors, family.lineage.individual].map((record) => record.id);
  const endOptions = [family.lineage.individual, ...descendants].map((record) => record.id);
  const [startId, setStartId] = useState(startOptions[0]!);
  const [endId, setEndId] = useState(endOptions.at(-1)!);
  const [trait, setTrait] = useState<TraitName>('memoryPotential');
  const path = useMemo(() => getLineagePath(index, startId, endId), [endId, index, startId]);
  const comparison = path
    ? getLineageTraitComparison(
        index,
        path.path.map((record) => record.id),
        trait,
      )
    : [];
  return (
    <View style={styles.container}>
      <AppCard>
        <AppText variant="label">Choose endpoints</AppText>
        <AppText variant="caption" color="secondary">
          Ancestor or selected individual
        </AppText>
        <ScrollView horizontal contentContainerStyle={styles.options}>
          {startOptions.map((id) => (
            <Endpoint
              key={id}
              id={id}
              selected={id === startId}
              family={family}
              onPress={setStartId}
            />
          ))}
        </ScrollView>
        <AppText variant="caption" color="secondary">
          Selected individual or descendant
        </AppText>
        <ScrollView horizontal contentContainerStyle={styles.options}>
          {endOptions.map((id) => (
            <Endpoint key={id} id={id} selected={id === endId} family={family} onPress={setEndId} />
          ))}
        </ScrollView>
      </AppCard>
      {path ? (
        <>
          <AppCard>
            <AppText variant="label">Recorded lineage path</AppText>
            <ScrollView horizontal contentContainerStyle={styles.path}>
              {path.path.map((record, position) => {
                const person = family.people.get(record.id)!;
                return (
                  <View key={record.id} style={styles.pathItem}>
                    {position ? <AppText style={styles.arrow}>→</AppText> : null}
                    <LineageNode
                      person={person}
                      selected={record.id === family.selected.record.id}
                      onPress={onSelect}
                    />
                  </View>
                );
              })}
            </ScrollView>
            {path.additionalPaths ? (
              <AppText color="secondary">
                At least one additional shortest path is recorded.
              </AppText>
            ) : null}
          </AppCard>
          <AppCard>
            <AppText variant="label">Inherited trait across this path</AppText>
            <AppText variant="caption" color="secondary">
              These values represent inherited traits, not skills acquired during life. Differences
              do not identify a specific mutation or imply that one value is always better.
            </AppText>
            <SegmentControl<TraitName>
              options={family.traitNames}
              value={trait}
              onChange={setTrait}
              label="Inherited trait"
              getLabel={formatTrait}
            />
            {comparison.map((value) => (
              <TraitBar
                key={value.id}
                label={`${family.people.get(value.id)?.name ?? value.id} · Gen ${value.generation}`}
                value={Math.round(value.value)}
              />
            ))}
          </AppCard>
        </>
      ) : (
        <AppCard>
          <AppText color="secondary">
            No direct recorded descent path connects these individuals.
          </AppText>
        </AppCard>
      )}
    </View>
  );
}

function Endpoint({
  id,
  selected,
  family,
  onPress,
}: {
  id: string;
  selected: boolean;
  family: FamilyTreeViewModel;
  onPress(id: string): void;
}) {
  const person = family.people.get(id)!;
  return (
    <AppText
      onPress={() => onPress(id)}
      style={[styles.endpoint, selected && styles.selectedEndpoint]}
    >
      {person.name} · G{person.record.birthGeneration}
    </AppText>
  );
}

function formatTrait(value: TraitName) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

interface Props {
  family: FamilyTreeViewModel;
  index: LineageIndex;
  onSelect(id: string): void;
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  options: { gap: spacing.sm, paddingVertical: spacing.xs },
  endpoint: {
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    overflow: 'hidden',
  },
  selectedEndpoint: { borderColor: colors.accentDiscovery, color: colors.accentDiscovery },
  path: { alignItems: 'center', paddingVertical: spacing.sm },
  pathItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  arrow: { paddingHorizontal: spacing.sm, color: colors.accentScience },
});
