import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { EmptyState } from '@/components/feedback/EmptyState';
import { FamilyTreeCanvas } from '@/features/lineage/components/family-tree-canvas';
import { LineageDetailPanel } from '@/features/lineage/components/lineage-detail-panel';
import { LineageLeftRail } from '@/features/lineage/components/lineage-navigation';
import { LineageNode } from '@/features/lineage/components/lineage-node';
import { LineagePathView } from '@/features/lineage/components/lineage-path-view';
import { useFamilyTree } from '@/features/lineage/hooks/use-family-tree';
import type { FamilyTreeViewModel } from '@/features/lineage/types';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, sizing, spacing } from '@/theme';
import { routes } from '@/types/navigation';

type Mode = 'tree' | 'path';

export function LineageScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const requestedId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [selectedId, setSelectedId] = useState(requestedId);
  const [mode, setMode] = useState<Mode>('tree');
  const [showFullTree, setShowFullTree] = useState(false);
  const { family, index, reason } = useFamilyTree(selectedId);
  const { isTablet } = useResponsiveLayout();

  if (!family || !index)
    return (
      <SafeAreaView style={styles.empty}>
        <EmptyState
          title={reason === 'no-session' ? 'Family tree unavailable' : 'No lineage records'}
          message={
            reason === 'no-session'
              ? 'Open the Family Tree from an active simulation. No second world is created.'
              : 'This simulation has no recorded individuals to display.'
          }
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Create a World'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.createWorld))}
        />
      </SafeAreaView>
    );

  const select = (id: string) => setSelectedId(id);
  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {isTablet ? <LineageLeftRail /> : null}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.content, isTablet && styles.tabletContent]}
        >
          <Header family={family} isTablet={isTablet} />
          <SegmentControl<Mode>
            options={['tree', 'path']}
            value={mode}
            onChange={setMode}
            label="Lineage view"
            getLabel={(value) => (value === 'tree' ? 'Family Tree' : 'Lineage Path')}
          />
          {isTablet ? (
            <View style={styles.tabletColumns}>
              <View style={styles.treeColumn}>
                {mode === 'tree' ? (
                  <FamilyTreeCanvas family={family} onSelect={select} />
                ) : (
                  <LineagePathView family={family} index={index} onSelect={select} />
                )}
                <FamilyStatistics family={family} />
              </View>
              <View style={styles.detailColumn}>
                <LineageDetailPanel family={family} onSelect={select} />
              </View>
            </View>
          ) : (
            <View style={styles.phoneStack}>
              <SelectedSummary family={family} onSelect={select} />
              {mode === 'tree' ? (
                showFullTree ? (
                  <FamilyTreeCanvas family={family} onSelect={select} />
                ) : (
                  <ImmediateFamily family={family} onSelect={select} />
                )
              ) : (
                <LineagePathView family={family} index={index} onSelect={select} />
              )}
              <FamilyStatistics family={family} />
              {mode === 'tree' ? (
                <AppButton
                  label={showFullTree ? 'Show Immediate Family' : 'View Full Family Tree'}
                  onPress={() => setShowFullTree(!showFullTree)}
                />
              ) : null}
              <LineageDetailPanel family={family} onSelect={select} />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function Header({ family, isTablet }: { family: FamilyTreeViewModel; isTablet: boolean }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerCopy}>
        <AppText variant="caption" style={styles.eyebrow}>
          FIRST MINDS / FAMILY TREE
        </AppText>
        <AppText variant={isTablet ? 'display' : 'heading'}>Family Tree & Lineage Explorer</AppText>
        <AppText color="secondary">
          Generation {family.selected.record.birthGeneration} · {family.people.size} retained
          records
        </AppText>
      </View>
      <View style={styles.generationBadge}>
        <AppText variant="caption" style={styles.badgeText}>
          Gen {family.selected.record.birthGeneration}
        </AppText>
      </View>
    </View>
  );
}

function SelectedSummary({
  family,
  onSelect,
}: {
  family: FamilyTreeViewModel;
  onSelect(id: string): void;
}) {
  return <LineageNode person={family.selected} selected onPress={onSelect} />;
}

function ImmediateFamily({
  family,
  onSelect,
}: {
  family: FamilyTreeViewModel;
  onSelect(id: string): void;
}) {
  const [relation, setRelation] = useState<'parents' | 'siblings' | 'children'>('parents');
  const rows = useMemo(() => {
    if (relation === 'siblings')
      return [
        { label: 'Full siblings', people: family.lineage.siblings.full },
        { label: 'Selected', people: [family.lineage.individual] },
        { label: 'Half siblings', people: family.lineage.siblings.half },
      ];
    if (relation === 'children')
      return [
        { label: 'Selected', people: [family.lineage.individual] },
        { label: 'Children', people: family.lineage.children },
        { label: 'Grandchildren', people: family.lineage.grandchildren },
      ];
    return [
      { label: 'Parents', people: family.lineage.parents },
      { label: 'Selected', people: [family.lineage.individual] },
      { label: 'Children', people: family.lineage.children },
    ];
  }, [family, relation]);
  return (
    <AppCard>
      <AppText variant="heading">Immediate family</AppText>
      <SegmentControl<'parents' | 'siblings' | 'children'>
        options={['parents', 'siblings', 'children']}
        value={relation}
        onChange={setRelation}
        label="Immediate family relationship"
        getLabel={(value) => `${value[0]!.toUpperCase()}${value.slice(1)}`}
      />
      {rows.map((row, index) => (
        <View key={row.label} style={styles.familyRow}>
          {index > 0 && relation !== 'siblings' ? <View style={styles.connector} /> : null}
          <AppText variant="caption" color="secondary">
            {row.label.toUpperCase()}
          </AppText>
          <ScrollView horizontal contentContainerStyle={styles.peopleRow}>
            {row.people.length ? (
              row.people.map((record) => (
                <View key={record.id} style={styles.phoneNode}>
                  <LineageNode
                    person={family.people.get(record.id)!}
                    selected={record.id === family.selected.record.id}
                    onPress={onSelect}
                  />
                </View>
              ))
            ) : (
              <AppText color="secondary">None recorded</AppText>
            )}
          </ScrollView>
        </View>
      ))}
    </AppCard>
  );
}

function FamilyStatistics({ family }: { family: FamilyTreeViewModel }) {
  const values = [
    ['Children', family.statistics.children],
    ['Descendants', family.statistics.knownDescendants],
    ['Ancestors', family.statistics.knownAncestors],
    ['Generations', family.statistics.generationsRepresented],
  ] as const;
  return (
    <AppCard>
      <AppText variant="label">Recorded family statistics</AppText>
      <View style={styles.stats}>
        {values.map(([label, value]) => (
          <View key={label} style={styles.stat}>
            <AppText variant="heading">{value}</AppText>
            <AppText variant="caption" color="secondary">
              {label}
            </AppText>
          </View>
        ))}
      </View>
      {family.statistics.missingParents ? (
        <AppText variant="caption" color="secondary">
          {family.statistics.missingParents} parent identifier(s) are referenced but their records
          are unavailable.
        </AppText>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  empty: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  body: { flex: 1, flexDirection: 'row' },
  content: {
    width: '100%',
    maxWidth: sizing.contentMaxWidth,
    alignSelf: 'center',
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  tabletContent: { maxWidth: 1500, paddingHorizontal: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerCopy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.1 },
  generationBadge: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentDiscovery,
    borderRadius: radius.full,
  },
  badgeText: { color: colors.accentDiscovery, fontWeight: '800' },
  tabletColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  treeColumn: { flex: 1, minWidth: 0, gap: spacing.md },
  detailColumn: { width: 320 },
  phoneStack: { gap: spacing.md },
  familyRow: { gap: spacing.xs },
  peopleRow: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  phoneNode: { width: 104 },
  connector: { alignSelf: 'center', width: 2, height: 24, backgroundColor: colors.accentScience },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: {
    flexGrow: 1,
    minWidth: 88,
    padding: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
  },
});
