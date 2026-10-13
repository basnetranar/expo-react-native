import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { EmptyState } from '@/components/feedback/EmptyState';
import { BranchComparison, BranchDiagram } from '@/features/histories/components/branch-comparison';
import { BranchCard, CheckpointCard } from '@/features/histories/components/history-cards';
import { HistoryNavigation } from '@/features/histories/components/history-navigation';
import { useHistories } from '@/features/histories/hooks/use-histories';
import { formatBytes } from '@/features/histories/utils/history-presentation';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, sizing, spacing } from '@/theme';
import { routes } from '@/types/navigation';

type PhoneSection = 'branches' | 'checkpoints';

export function HistoriesScreen() {
  const model = useHistories();
  const { isTablet } = useResponsiveLayout();
  const [section, setSection] = useState<PhoneSection>('branches');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rename, setRename] = useState('');
  const histories = model.histories;
  const selected = useMemo(
    () =>
      histories?.branches.find((branch) => branch.id === selectedId) ??
      histories?.branches[0] ??
      null,
    [histories, selectedId],
  );

  if (!histories)
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          title="Histories unavailable"
          message={
            model.reason === 'no-session'
              ? 'Open Alternate Histories from an active Live Simulation. No second simulation is created.'
              : 'Persistent histories are still loading or could not be restored.'
          }
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Create a World'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.createWorld))}
        />
      </SafeAreaView>
    );

  const checkpoints = selected
    ? histories.checkpoints.filter((item) => item.branchId === selected.id)
    : [];
  const createCheckpoint = () =>
    void model.createCheckpoint(`Generation ${selected?.generation ?? 0} checkpoint`);
  const createFromCurrent = async () => {
    const checkpoint = await model.createCheckpoint(
      `Branch point · Generation ${selected?.generation ?? 0}`,
    );
    if (checkpoint)
      await model.createBranch(checkpoint.id, `Branch ${histories.branches.length + 1}`);
  };
  const branchFrom = (checkpointId: string) =>
    void model.createBranch(checkpointId, `Branch ${histories.branches.length + 1}`);
  const confirmDeleteBranch = () =>
    selected &&
    Alert.alert(
      'Delete history?',
      `${selected.name} and its private checkpoints will be removed. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => void model.deleteBranch(selected.id),
        },
      ],
    );
  const details = selected ? (
    <View style={styles.stack}>
      <AppCard>
        <AppText variant="heading">Current selection</AppText>
        <AppText variant="display">{selected.name}</AppText>
        <AppText color="secondary">
          Generation {selected.generation} · Population {selected.population} · {selected.status}
        </AppText>
        <AppText variant="caption" color="secondary">
          {selected.parentBranchId
            ? `Diverged at generation ${selected.originGeneration}`
            : 'Original world line'}{' '}
          · Seed state is stored in its checkpoint.
        </AppText>
        <AppText variant="label">Environmental interventions</AppText>
        <AppText variant="caption" color="secondary">
          {selected.interventions.length
            ? selected.interventions
                .slice(-3)
                .map((item) => `${item.type} (${item.status})`)
                .join(' · ')
            : 'No recorded interventions in this history.'}
        </AppText>
        <AppText variant="label">Major milestones</AppText>
        <AppText variant="caption" color="secondary">
          {selected.events.length
            ? selected.events
                .slice(-3)
                .map((event) => `Gen ${event.generation}: ${event.type}`)
                .join(' · ')
            : 'No recorded milestones yet.'}
        </AppText>
        {selected.history.at(-1) ? (
          <AppText variant="caption" color="secondary">
            Latest culture: stone cracking{' '}
            {Math.round(selected.history.at(-1)!.behaviourPrevalence.stoneCracking * 100)}% · Memory
            potential {Math.round(selected.history.at(-1)!.averageGenome.memoryPotential)}
          </AppText>
        ) : null}
        <TextInput
          value={rename}
          onChangeText={setRename}
          placeholder="Rename history"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="History name"
        />
        <View style={styles.actions}>
          <AppButton
            label="Rename"
            variant="secondary"
            disabled={model.busy || !rename.trim()}
            onPress={() => {
              void model.renameBranch(selected.id, rename);
              setRename('');
            }}
          />
          {selected.status !== 'active' ? (
            <AppButton
              label="Switch history"
              disabled={model.busy}
              onPress={() => void model.switchBranch(selected.id)}
            />
          ) : null}
          {selected.parentBranchId && selected.status !== 'active' ? (
            <AppButton
              label="Delete history"
              variant="secondary"
              disabled={model.busy}
              onPress={confirmDeleteBranch}
            />
          ) : null}
        </View>
      </AppCard>
      <View style={styles.sectionHeading}>
        <AppText variant="heading">Saved checkpoints</AppText>
        <AppButton
          label="Create checkpoint"
          disabled={model.busy || selected.status !== 'active'}
          onPress={createCheckpoint}
        />
      </View>
      {checkpoints.map((checkpoint) => (
        <CheckpointCard
          key={checkpoint.id}
          item={checkpoint}
          sourceName={selected.name}
          disabled={model.busy}
          onBranch={() => branchFrom(checkpoint.id)}
          onRename={(label) => void model.renameCheckpoint(checkpoint.id, label)}
          onDelete={() =>
            Alert.alert('Delete checkpoint?', checkpoint.label, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => void model.deleteCheckpoint(checkpoint.id),
              },
            ])
          }
        />
      ))}
    </View>
  ) : null;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {isTablet ? <HistoryNavigation /> : null}
        <ScrollView contentContainerStyle={[styles.content, isTablet && styles.tabletContent]}>
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <AppText variant="caption" style={styles.eyebrow}>
                FIRST MINDS / ALTERNATE HISTORIES
              </AppText>
              <AppText variant={isTablet ? 'display' : 'heading'}>
                Alternate Evolutionary Histories
              </AppText>
              <AppText color="secondary">
                Explore deterministic branches from saved points without rewriting the main history.
              </AppText>
              <AppText variant="caption" color="secondary">
                {selected?.scenario === 'stableSavannah'
                  ? 'Stable Savannah'
                  : (selected?.scenario ?? 'Savannah')}{' '}
                · Generation {selected?.generation ?? 0}
              </AppText>
            </View>
            <View style={styles.storage}>
              <AppText variant="caption">
                {formatBytes(histories.totalStorageBytes)} /{' '}
                {formatBytes(histories.storageLimitBytes)}
              </AppText>
            </View>
          </View>
          {model.error ? (
            <AppCard style={styles.error}>
              <AppText>{model.error}</AppText>
            </AppCard>
          ) : null}
          {!isTablet ? (
            <SegmentControl<PhoneSection>
              label="History section"
              options={['branches', 'checkpoints'] as const}
              value={section}
              onChange={setSection}
              getLabel={(value) => (value === 'branches' ? 'Branches' : 'Checkpoints')}
            />
          ) : null}
          {isTablet ? (
            <View style={styles.tabletColumns}>
              <View style={styles.mainColumn}>
                <BranchComparison branches={histories.branches} />
                <BranchDiagram
                  branches={histories.branches}
                  selectedId={selected?.id ?? histories.activeBranchId}
                />
              </View>
              <View style={styles.sideColumn}>
                {histories.branches.map((branch) => (
                  <BranchCard
                    key={branch.id}
                    branch={branch}
                    branches={histories.branches}
                    selected={branch.id === selected?.id}
                    disabled={model.busy}
                    onSelect={() => setSelectedId(branch.id)}
                    onSwitch={() => void model.switchBranch(branch.id)}
                  />
                ))}
                {details}
              </View>
            </View>
          ) : section === 'branches' ? (
            <View style={styles.stack}>
              <AppButton
                label="Create new branch from current state"
                disabled={model.busy || selected?.status !== 'active'}
                onPress={() => void createFromCurrent()}
              />
              {histories.branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  branches={histories.branches}
                  selected={branch.id === selected?.id}
                  disabled={model.busy}
                  onSelect={() => setSelectedId(branch.id)}
                  onSwitch={() => void model.switchBranch(branch.id)}
                />
              ))}
            </View>
          ) : (
            details
          )}
        </ScrollView>
      </View>
      {!isTablet ? <HistoryNavigation compact /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1, flexDirection: 'row' },
  content: { gap: spacing.md, padding: spacing.md, paddingBottom: spacing.xxl },
  tabletContent: {
    width: '100%',
    maxWidth: sizing.contentMaxWidth,
    alignSelf: 'center',
    padding: spacing.xl,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.accentScience, letterSpacing: 1.1 },
  storage: {
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentDiscovery,
    borderRadius: 999,
  },
  error: { borderColor: colors.negative },
  tabletColumns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  mainColumn: { flex: 1.6, minWidth: 0, gap: spacing.md },
  sideColumn: { flex: 1, minWidth: 340, gap: spacing.md },
  stack: { gap: spacing.md },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  input: {
    minHeight: 46,
    color: colors.text,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
