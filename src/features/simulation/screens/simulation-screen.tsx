import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { LoadingState } from '@/components/feedback/LoadingState';
import { loadActiveWorldRecord } from '@/features/home/services/active-world-storage';
import { DevDiagnosticsPanel } from '@/features/simulation/components/dev-diagnostics-panel';
import { ExtinctionOverlay } from '@/features/simulation/components/extinction-overlay';
import { LatestEventCard } from '@/features/simulation/components/latest-event-card';
import { PopulationSummary } from '@/features/simulation/components/population-summary';
import { RecentEventsPanel } from '@/features/simulation/components/recent-events-panel';
import { ResourceStatusRow } from '@/features/simulation/components/resource-status-row';
import { SelectedAgentCard } from '@/features/simulation/components/selected-agent-card';
import { SimulationBottomNav } from '@/features/simulation/components/simulation-bottom-nav';
import { SimulationControls } from '@/features/simulation/components/simulation-controls';
import { SimulationHud } from '@/features/simulation/components/simulation-hud';
import { WorldViewport } from '@/features/simulation/components/world-viewport';
import { useSimulationSession } from '@/features/simulation/hooks/use-simulation-session';
import { deduplicateEvents } from '@/features/simulation/utils/event-presentation';
import { defaultWorldConfiguration } from '@/features/world/types';
import {
  type WorldRouteParams,
  worldConfigurationFromRoute,
  worldConfigurationToSimulationConfig,
} from '@/features/world/world-configuration';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import type { SimulationConfig } from '@/simulation';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export const simulationSafeAreaEdges = ['top', 'bottom'] as const;

export function SimulationScreen() {
  const params = useLocalSearchParams<
    WorldRouteParams & { restore?: string; destination?: string }
  >();
  if (params.restore === '1')
    return <PersistedSimulation destination={firstParam(params.destination)} />;
  return <ConfiguredSimulation params={params} />;
}

function ConfiguredSimulation({ params }: { params: WorldRouteParams }) {
  const { food, population, predators, scenario, seed, water } = params;
  const simulationConfig = useMemo(
    () =>
      worldConfigurationToSimulationConfig(
        worldConfigurationFromRoute(
          {
            ...(food === undefined ? {} : { food }),
            ...(population === undefined ? {} : { population }),
            ...(predators === undefined ? {} : { predators }),
            ...(scenario === undefined ? {} : { scenario }),
            ...(seed === undefined ? {} : { seed }),
            ...(water === undefined ? {} : { water }),
          },
          defaultWorldConfiguration,
        ),
      ),
    [food, population, predators, scenario, seed, water],
  );
  const hasExplicitConfiguration = [food, population, predators, scenario, seed, water].some(
    (value) => value !== undefined,
  );
  return (
    <SimulationExperience
      config={simulationConfig}
      preferActiveSession={!hasExplicitConfiguration}
    />
  );
}

function PersistedSimulation({ destination }: { destination?: string | undefined }) {
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let mounted = true;
    void loadActiveWorldRecord()
      .then((record) => {
        if (!mounted) return;
        if (!record) setError('No saved simulation metadata was found.');
        else setConfig(record.config);
      })
      .catch(
        (reason) =>
          mounted &&
          setError(
            reason instanceof Error ? reason.message : 'The saved simulation is unavailable.',
          ),
      );
    return () => {
      mounted = false;
    };
  }, [attempt]);
  if (error)
    return (
      <SafeAreaView style={styles.centered}>
        <AppText variant="heading">Could not restore simulation</AppText>
        <AppText color="secondary">{error}</AppText>
        <AppButton
          label="Retry Restore"
          onPress={() => {
            setError(null);
            setAttempt((value) => value + 1);
          }}
        />
        <AppButton
          label="Saved Histories"
          variant="secondary"
          onPress={() => router.push(routes.histories)}
        />
        <AppButton
          label="Return Home"
          variant="secondary"
          onPress={() => router.replace(routes.lab)}
        />
      </SafeAreaView>
    );
  if (!config) return <LoadingState label="Loading saved world" />;
  return <SimulationExperience config={config} requireExistingHistory destination={destination} />;
}

function SimulationExperience({
  config,
  requireExistingHistory = false,
  destination,
  preferActiveSession = false,
}: {
  config: SimulationConfig;
  requireExistingHistory?: boolean;
  destination?: string | undefined;
  preferActiveSession?: boolean;
}) {
  const layout = useResponsiveLayout();
  const usePhoneComposition = layout.isPhone || layout.height < 600;
  const session = useSimulationSession(config, { requireExistingHistory, preferActiveSession });
  const snapshot = session.snapshot;

  useEffect(() => {
    if (!snapshot || session.error || !destination) return;
    const target = {
      histories: routes.histories,
      population: routes.population,
      timeline: routes.evolutionTimeline,
      experiments: routes.experiments,
      social: routes.social,
      learning: routes.learning,
      guidedExperiment: { pathname: routes.experiments, params: { guide: '1' } },
    }[destination];
    if (target) router.push(target);
  }, [destination, session.error, snapshot]);

  if (session.error)
    return (
      <SafeAreaView style={styles.centered}>
        <AppText variant="heading">Simulation unavailable</AppText>
        <AppText color="secondary">{session.error}</AppText>
        {requireExistingHistory ? (
          <>
            <AppButton
              label="Retry Restore"
              onPress={() => void session.retryHistoryPersistence()}
            />
            <AppButton
              label="Saved Histories"
              variant="secondary"
              onPress={() => router.push(routes.histories)}
            />
            <AppButton
              label="Return Home"
              variant="secondary"
              onPress={() => router.replace(routes.lab)}
            />
          </>
        ) : (
          <AppButton
            label="Return to Create World"
            onPress={() => router.replace(routes.createWorld)}
          />
        )}
      </SafeAreaView>
    );
  if (!snapshot)
    return (
      <SafeAreaView style={styles.centered}>
        <AppText variant="label">Preparing the Savannah…</AppText>
      </SafeAreaView>
    );

  const presentedEvents = deduplicateEvents(snapshot.recentEvents);
  const latestEvent = presentedEvents.at(-1);
  const viewSelected = () => {
    if (session.selectedAgentId) router.push(routes.hominin(session.selectedAgentId));
  };
  const openTimeline = () => router.push(routes.evolutionTimeline);
  const controls = (
    <SimulationControls
      status={session.status}
      speed={session.speed}
      onToggle={session.status === 'running' ? session.pause : session.play}
      onSpeed={session.setSpeed}
    />
  );

  return (
    <SafeAreaView edges={simulationSafeAreaEdges} style={styles.safeArea}>
      <StatusBar style="light" />
      <SimulationHud snapshot={snapshot} />
      <ResourceStatusRow snapshot={snapshot} />
      {session.warning ? (
        <AppCard style={styles.warning} accessibilityRole="alert">
          <AppText variant="label">History recovery needed</AppText>
          <AppText variant="caption">{session.warning}</AppText>
          <AppButton
            label="Retry History Restore"
            variant="secondary"
            onPress={() => void session.retryHistoryPersistence()}
          />
        </AppCard>
      ) : null}
      {usePhoneComposition ? (
        <>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.phoneContent}
          >
            <WorldViewport
              compact
              agents={snapshot.aliveAgents}
              world={snapshot.world}
              selectedId={session.selectedAgentId}
              onSelect={session.selectAgent}
            />
            <LatestEventCard event={latestEvent} onPress={openTimeline} />
            {controls}
            <SelectedAgentCard agent={session.selectedAgent} onView={viewSelected} />
            <DevDiagnosticsPanel snapshot={snapshot} />
          </ScrollView>
          <SimulationBottomNav />
        </>
      ) : (
        <View style={styles.tabletBody}>
          <View style={styles.tabletWorld}>
            <WorldViewport
              agents={snapshot.aliveAgents}
              world={snapshot.world}
              selectedId={session.selectedAgentId}
              onSelect={session.selectAgent}
            />
            <View style={styles.tabletControls}>
              <View style={styles.controlGrow}>{controls}</View>
              <AppButton
                label="Population"
                accessibilityLabel="Open population"
                variant="secondary"
                onPress={() => router.push(routes.population)}
              />
              <AppButton
                label="Family Tree"
                accessibilityLabel="Open family tree for selected individual"
                variant="secondary"
                onPress={() => router.push(routes.lineage(session.selectedAgentId ?? undefined))}
              />
              <AppButton
                label="Experiments"
                accessibilityLabel="Open experiments"
                variant="secondary"
                onPress={() => router.push(routes.experiments)}
              />
              <AppButton
                label="Histories"
                accessibilityLabel="Open alternate evolutionary histories"
                variant="secondary"
                onPress={() => router.push(routes.histories)}
              />
            </View>
          </View>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            contentContainerStyle={styles.observationContent}
            style={styles.observationPanel}
          >
            <LatestEventCard event={latestEvent} onPress={openTimeline} />
            <PopulationSummary snapshot={snapshot} />
            <SelectedAgentCard detailed agent={session.selectedAgent} onView={viewSelected} />
            <RecentEventsPanel events={presentedEvents} onViewAll={openTimeline} />
            <DevDiagnosticsPanel snapshot={snapshot} />
          </ScrollView>
        </View>
      )}
      {session.status === 'extinct' ? (
        <ExtinctionOverlay
          snapshot={snapshot}
          onTimeline={openTimeline}
          onNewWorld={() => router.replace(routes.createWorld)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  warning: { marginHorizontal: spacing.md, borderColor: colors.warning },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  phoneContent: { gap: spacing.sm, paddingBottom: spacing.md },
  tabletBody: { flex: 1, flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  tabletWorld: { flex: 1, minWidth: 0, gap: spacing.sm },
  tabletControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  controlGrow: { flex: 1 },
  observationPanel: {
    width: 330,
    flexGrow: 0,
    flexShrink: 0,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  observationContent: { padding: spacing.md, gap: spacing.sm },
});
