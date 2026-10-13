import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SegmentControl } from '@/components/common/SegmentControl';
import { EmptyState } from '@/components/feedback/EmptyState';
import { EnvironmentControls } from '@/features/experiments/components/environment-controls';
import {
  EnvironmentalEvents,
  EnvironmentPreview,
  ExperimentPresets,
} from '@/features/experiments/components/experiment-options';
import { ExperimentsNavigation } from '@/features/experiments/components/experiments-navigation';
import {
  ActiveInterventions,
  InterventionHistory,
} from '@/features/experiments/components/intervention-lists';
import {
  PopulationResponse,
  ResourceObservation,
} from '@/features/experiments/components/population-response';
import { useExperiments } from '@/features/experiments/hooks/use-experiments';
import type { EnvironmentDraft } from '@/features/experiments/types';
import { GuidedExperimentCard } from '@/features/help/components/guided-experiment-card';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import type { EnvironmentInterventionCommand } from '@/simulation';
import { colors, sizing, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const sections = ['environment', 'events', 'presets'] as const;
type Section = (typeof sections)[number];

export function ExperimentsScreen() {
  const { guide } = useLocalSearchParams<{ guide?: string }>();
  const { experiments, apply, cancel, reason } = useExperiments();
  const { isTablet } = useResponsiveLayout();
  const [section, setSection] = useState<Section>('environment');
  const [draft, setDraft] = useState<EnvironmentDraft | null>(() => experiments?.current ?? null);
  const [dirty, setDirty] = useState(false);
  const [showGuide, setShowGuide] = useState(guide === '1');

  if (!experiments || !draft) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <EmptyState
          title="Experiments unavailable"
          message={
            reason === 'no-session'
              ? 'Open Experiments from an active Live Simulation. No second world is created.'
              : 'The current simulation state could not be read.'
          }
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Create a World'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.createWorld))}
        />
      </SafeAreaView>
    );
  }

  const updateDraft = (value: EnvironmentDraft) => {
    setDraft(value);
    setDirty(true);
  };
  const applyDraft = (commands: readonly EnvironmentInterventionCommand[]) => {
    if (apply(commands)) setDirty(false);
  };
  const scheduleEvent = (command: EnvironmentInterventionCommand) => apply([command]);

  const environmentPanel = (
    <EnvironmentControls
      experiments={experiments}
      draft={draft}
      dirty={dirty}
      onDraft={updateDraft}
      onApply={applyDraft}
    />
  );
  const selectedPanel =
    section === 'environment' ? (
      environmentPanel
    ) : section === 'events' ? (
      <EnvironmentalEvents
        ticksPerGeneration={experiments.environment.ticksPerGeneration}
        disabled={experiments.status === 'extinct'}
        onApply={scheduleEvent}
      />
    ) : (
      <ExperimentPresets
        draft={draft}
        onDraft={(value) => {
          updateDraft(value);
          setSection('environment');
        }}
      />
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {isTablet ? <ExperimentsNavigation /> : null}
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.content, isTablet && styles.tabletContent]}
        >
          <ExperimentsHeader
            scenario={experiments.scenario}
            generation={experiments.generation}
            tick={experiments.tick}
            status={experiments.status}
            isTablet={isTablet}
          />
          {showGuide ? <GuidedExperimentCard onDismiss={() => setShowGuide(false)} /> : null}
          <SegmentControl<Section>
            label="Experiment workspace"
            options={sections}
            value={section}
            onChange={setSection}
            getLabel={(value) => capitalize(value)}
          />
          {isTablet ? (
            <View style={styles.columns}>
              <View style={styles.mainColumn}>
                {selectedPanel}
                <ActiveInterventions
                  items={experiments.active}
                  tick={experiments.tick}
                  onCancel={cancel}
                />
                <PopulationResponse experiments={experiments} />
              </View>
              <View style={styles.sideColumn}>
                <EnvironmentPreview experiments={experiments} />
                <ResourceObservation experiments={experiments} />
                <InterventionHistory
                  items={experiments.history}
                  discarded={experiments.environment.retention.terminalRecordsDiscarded}
                />
              </View>
            </View>
          ) : (
            <View style={styles.phoneStack}>
              {selectedPanel}
              <EnvironmentPreview experiments={experiments} />
              <ActiveInterventions
                items={experiments.active}
                tick={experiments.tick}
                onCancel={cancel}
              />
              <PopulationResponse experiments={experiments} />
              <ResourceObservation experiments={experiments} />
              <InterventionHistory
                items={experiments.history}
                discarded={experiments.environment.retention.terminalRecordsDiscarded}
              />
            </View>
          )}
        </ScrollView>
      </View>
      {!isTablet ? <ExperimentsNavigation compact /> : null}
    </SafeAreaView>
  );
}

function ExperimentsHeader({ scenario, generation, tick, status, isTablet }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <AppText variant="caption" style={styles.eyebrow}>
          FIRST MINDS / EXPERIMENTS
        </AppText>
        <AppText variant={isTablet ? 'display' : 'heading'}>
          Experiments & Environmental Interventions
        </AppText>
        <AppText color="secondary">
          {scenarioName(scenario)} · Generation {generation} · Tick {tick}
        </AppText>
      </View>
      <View style={styles.headerActions}>
        <View style={[styles.status, status === 'running' && styles.liveStatus]}>
          <AppText variant="caption" style={styles.statusText}>
            {capitalize(status)}
          </AppText>
        </View>
        <AppButton
          label="Live Simulation"
          variant="secondary"
          onPress={() => router.push(routes.simulation)}
        />
      </View>
      {status === 'paused' ? (
        <AppCard style={styles.notice}>
          <AppText variant="caption">
            The simulation is paused. Scheduled changes wait for the next simulation tick.
          </AppText>
        </AppCard>
      ) : null}
      {status === 'extinct' ? (
        <AppCard style={styles.notice}>
          <AppText variant="caption">
            The population is extinct. History remains readable, but no further ticks can apply
            changes.
          </AppText>
        </AppCard>
      ) : null}
    </View>
  );
}

interface HeaderProps {
  scenario: string;
  generation: number;
  tick: number;
  status: string;
  isTablet: boolean;
}

function capitalize(value: string) {
  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1).replaceAll('-', ' ')}`;
}

function scenarioName(value: string) {
  if (value === 'stableSavannah') return 'Stable Savannah';
  if (value === 'hardFood') return 'Hard Food';
  return capitalize(value);
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
  header: { gap: spacing.sm },
  titleBlock: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.accentScience, letterSpacing: 1.1 },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm },
  status: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
  },
  liveStatus: { borderWidth: 1, borderColor: colors.positive },
  statusText: { fontWeight: '800' },
  notice: { borderColor: colors.accentDiscovery },
  columns: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  mainColumn: { flex: 1.55, gap: spacing.md, minWidth: 0 },
  sideColumn: { flex: 1, gap: spacing.md, minWidth: 300 },
  phoneStack: { gap: spacing.md },
});
