import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { MetricTile } from '@/components/common/MetricTile';
import { SegmentControl } from '@/components/common/SegmentControl';
import { EmptyState } from '@/components/feedback/EmptyState';
import { GenerationDetailCard } from '@/features/evolution/components/generation-detail-card';
import { HighlightedMilestoneCard } from '@/features/evolution/components/highlighted-milestone-card';
import { MilestonePanel } from '@/features/evolution/components/milestone-panel';
import { TimelineChart } from '@/features/evolution/components/timeline-chart';
import { TimelineLeftRail } from '@/features/evolution/components/timeline-left-rail';
import { TimelineSelector } from '@/features/evolution/components/timeline-selector';
import { TrendCard } from '@/features/evolution/components/trend-card';
import { useEvolutionTimeline } from '@/features/evolution/hooks/use-evolution-timeline';
import type {
  GenerationDetail,
  MilestoneCategory,
  TimelineMetric,
} from '@/features/evolution/types';
import {
  behaviourLabel,
  findGeneration,
  milestoneCategories,
  scenarioLabel,
  traitLabel,
} from '@/features/evolution/utils/evolution-timeline-presentation';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import type { LearnedBehaviourType, TraitName } from '@/simulation';
import { colors, sizing, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const metrics: readonly TimelineMetric[] = ['population', 'births', 'deaths'];
const filters: readonly ('all' | MilestoneCategory)[] = ['all', ...milestoneCategories];

export function EvolutionTimelineScreen() {
  const { timeline, reason } = useEvolutionTimeline();
  const { isTablet } = useResponsiveLayout();
  const [metric, setMetric] = useState<TimelineMetric>('population');
  const [trait, setTrait] = useState<TraitName>('memoryPotential');
  const [culture, setCulture] = useState<LearnedBehaviourType>('stoneCracking');
  const [filter, setFilter] = useState<'all' | MilestoneCategory>('all');
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const resolvedGeneration = selectedGeneration ?? timeline?.latestGeneration ?? null;
  const selectedDetail = useMemo(
    () => (timeline ? findGeneration(timeline, resolvedGeneration) : null),
    [resolvedGeneration, timeline],
  );
  const highlightedMilestone = useMemo(
    () =>
      timeline?.milestones.findLast(
        (item) => item.category === 'discovery' || item.category === 'culture',
      ) ??
      timeline?.milestones.at(-1) ??
      null,
    [timeline?.milestones],
  );

  if (!timeline)
    return (
      <SafeAreaView edges={['bottom']} style={styles.safeArea}>
        <EmptyState
          title="Timeline unavailable"
          message={
            reason === 'no-session'
              ? 'Open the Evolution Timeline from an active Live Simulation. No second simulation is created.'
              : 'Historical records could not be loaded.'
          }
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Create a World'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.createWorld))}
        />
      </SafeAreaView>
    );

  const openGeneration = (generation: number) => {
    if (isTablet) setSelectedGeneration(generation);
    else router.push(routes.evolutionGeneration(generation));
  };
  const header = (
    <View style={styles.headerContent}>
      <View style={styles.context}>
        <View style={styles.contextRow}>
          <AppText variant="caption" style={styles.eyebrow}>
            {scenarioLabel(timeline.scenario).toUpperCase()} · TICK {timeline.currentTick}
          </AppText>
          <View style={styles.generationBadge}>
            <AppText variant="caption" style={styles.badgeText}>
              Generation {timeline.currentGeneration}
            </AppText>
          </View>
        </View>
        <AppText color="secondary">
          Completed generation history · Current generation {timeline.currentGeneration}
        </AppText>
      </View>
      {timeline.retention.generationsDiscarded > 0 || timeline.retention.eventsDiscarded > 0 ? (
        <AppCard>
          <AppText variant="label">Bounded history</AppText>
          <AppText variant="caption">
            Oldest retained records were discarded: {timeline.retention.generationsDiscarded}{' '}
            generations and {timeline.retention.eventsDiscarded} events.
          </AppText>
        </AppCard>
      ) : null}
      <View style={styles.metrics}>
        <MetricTile
          label="Population"
          value={display(timeline.population)}
          accent={colors.positive}
        />
        <MetricTile
          label="Retained peak"
          value={display(timeline.retainedPeakPopulation)}
          accent={colors.accentScience}
        />
        <MetricTile
          label="Births"
          value={display(timeline.births)}
          accent={colors.accentDiscovery}
        />
        <MetricTile label="Deaths" value={display(timeline.deaths)} accent={colors.accentDanger} />
      </View>
      {!timeline.chart.length ? (
        <EmptyState
          title="No completed generations yet"
          message="Run the Live Simulation through a generation to begin recording historical measurements."
        />
      ) : (
        <View style={[styles.dashboard, isTablet && styles.tabletDashboard]}>
          <View style={styles.mainColumn}>
            <AppCard>
              <AppText variant="heading">Population history</AppText>
              <SegmentControl
                label="Population metric"
                options={metrics}
                value={metric}
                onChange={(value: TimelineMetric) => setMetric(value)}
              />
              <TimelineChart
                points={timeline.chart}
                metric={metric}
                selectedGeneration={resolvedGeneration}
                onSelect={openGeneration}
              />
            </AppCard>
            {!isTablet && highlightedMilestone ? (
              <HighlightedMilestoneCard milestone={highlightedMilestone} />
            ) : null}
            <View style={[styles.insights, isTablet && styles.tabletInsights]}>
              <View style={styles.insightColumn}>
                <TimelineSelector
                  label="Inherited trait"
                  options={timeline.traitNames}
                  value={trait}
                  onChange={(value: TraitName) => setTrait(value)}
                  getLabel={traitLabel}
                />
                <TrendCard
                  title={`${traitLabel(trait)} trend`}
                  description="Average inherited genetic potential among living individuals at each completed generation."
                  points={timeline.traitSeries[trait]}
                />
              </View>
              <View style={styles.insightColumn}>
                <TimelineSelector
                  label="Cultural behaviour"
                  options={timeline.culturalBehaviours}
                  value={culture}
                  onChange={(value: LearnedBehaviourType) => setCulture(value)}
                  getLabel={behaviourLabel}
                />
                <TrendCard
                  title={`${behaviourLabel(culture)} cultural history`}
                  description="Recorded prevalence among living individuals; this is acquired behaviour, not inheritance."
                  points={timeline.culturalSeries[culture]}
                  percent
                />
              </View>
            </View>
          </View>
          <View style={styles.sideColumn}>
            <TimelineSelector
              label="Milestone category"
              options={filters}
              value={filter}
              onChange={(value: 'all' | MilestoneCategory) => setFilter(value)}
              getLabel={(value) => (value === 'all' ? 'All' : capitalize(value))}
            />
            <MilestonePanel milestones={timeline.milestones} category={filter} />
            {isTablet && selectedDetail ? <GenerationDetailCard detail={selectedDetail} /> : null}
          </View>
        </View>
      )}
      <View style={styles.historyHeading}>
        <AppText variant="heading">Generation history</AppText>
        <AppText variant="caption">
          {timeline.generations.length} of {timeline.retention.generationLimit} retained slots used
        </AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screenBody}>
        {isTablet ? <TimelineLeftRail /> : null}
        <FlatList
          data={timeline.generations}
          keyExtractor={(item) => String(item.generation)}
          renderItem={({ item }) => (
            <GenerationRow
              detail={item}
              selected={item.generation === resolvedGeneration}
              onPress={() => openGeneration(item.generation)}
            />
          )}
          ListHeaderComponent={header}
          ListEmptyComponent={
            <AppText color="secondary">Generation rows will appear after completion.</AppText>
          }
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.listContent, isTablet && styles.tabletListContent]}
          initialNumToRender={12}
          windowSize={7}
          style={styles.list}
        />
      </View>
    </SafeAreaView>
  );
}

function GenerationRow({
  detail,
  selected,
  onPress,
}: {
  detail: GenerationDetail;
  selected: boolean;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open generation ${detail.generation} details`}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.generationRow,
        selected && styles.selectedRow,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="label" style={styles.generationNumber}>
        G{detail.generation}
      </AppText>
      <AppText variant="caption" style={styles.rowMetric}>
        Population {detail.population}
      </AppText>
      <AppText variant="caption" style={styles.rowMetric}>
        Births {detail.births}
      </AppText>
      <AppText variant="caption" style={styles.rowMetric}>
        Deaths {detail.deaths}
      </AppText>
      <AppText variant="caption" style={styles.chevron}>
        ›
      </AppText>
    </Pressable>
  );
}

function display(value: number | null): string {
  return value === null ? '—' : String(value);
}

function capitalize(value: string): string {
  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  listContent: {
    width: '100%',
    maxWidth: sizing.contentMaxWidth,
    alignSelf: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  tabletListContent: { paddingHorizontal: spacing.xl },
  screenBody: { flex: 1, flexDirection: 'row' },
  list: { flex: 1 },
  headerContent: { gap: spacing.md },
  context: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  generationBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accentDiscovery,
  },
  badgeText: { color: colors.accentDiscovery, fontWeight: '800' },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dashboard: { gap: spacing.md },
  tabletDashboard: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { flex: 2, minWidth: 0, gap: spacing.md },
  insights: { gap: spacing.md },
  tabletInsights: { flexDirection: 'row', alignItems: 'flex-start' },
  insightColumn: { flex: 1, minWidth: 0, gap: spacing.sm },
  sideColumn: { flex: 1, minWidth: 0, gap: spacing.md },
  historyHeading: { gap: 2, paddingTop: spacing.sm },
  generationRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  selectedRow: { borderColor: colors.accentScience, backgroundColor: colors.surfaceStrong },
  generationNumber: { minWidth: 42, color: colors.accentDiscovery },
  rowMetric: { flex: 1 },
  chevron: { color: colors.accentScience, fontSize: 24 },
  pressed: { opacity: 0.7 },
});
