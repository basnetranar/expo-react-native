import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/feedback/EmptyState';
import { scenarioLabel } from '@/features/evolution/utils/evolution-timeline-presentation';
import { CulturalAdoptionCard } from '@/features/population/components/cultural-adoption-card';
import { GeneticVariationCard } from '@/features/population/components/genetic-variation-card';
import { LifeStageCard } from '@/features/population/components/life-stage-card';
import { PopulationBrowserControls } from '@/features/population/components/population-browser-controls';
import { PopulationHealthCard } from '@/features/population/components/population-health-card';
import { PopulationIndividualRow } from '@/features/population/components/population-individual-row';
import { PopulationInsightsCard } from '@/features/population/components/population-insights-card';
import {
  PopulationBottomNav,
  PopulationLeftRail,
} from '@/features/population/components/population-navigation';
import { PopulationSummaryCards } from '@/features/population/components/population-summary-cards';
import { PopulationTrendCard } from '@/features/population/components/population-trend-card';
import { TraitOverviewCard } from '@/features/population/components/trait-overview-card';
import { usePopulationOverview } from '@/features/population/hooks/use-population-overview';
import type {
  PopulationFilterState,
  PopulationOverviewSnapshot,
} from '@/features/population/types';
import { filterAndSortIndividuals } from '@/features/population/utils/population-presentation';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, sizing, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const initialFilters: PopulationFilterState = {
  search: '',
  lifeStage: 'all',
  generation: 'all',
  learnedBehaviour: 'all',
  selectedTrait: 'memoryPotential',
  sort: 'age-desc',
};

export function PopulationScreen() {
  const { population, reason } = usePopulationOverview();
  const { isTablet } = useResponsiveLayout();
  const [filters, setFilters] = useState(initialFilters);
  const individuals = useMemo(
    () => (population ? filterAndSortIndividuals(population.individuals, filters) : []),
    [filters, population],
  );
  const inspect = useCallback((id: string) => router.push(routes.hominin(id)), []);

  if (!population)
    return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.emptyScreen}>
        <EmptyState
          title="Population unavailable"
          message={
            reason === 'no-session'
              ? 'Open Population Overview from an active Live Simulation. No second simulation is created.'
              : 'The current population snapshot could not be loaded.'
          }
        />
        <AppButton
          label={router.canGoBack() ? 'Go Back' : 'Create a World'}
          onPress={() => (router.canGoBack() ? router.back() : router.replace(routes.createWorld))}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.body}>
        {isTablet ? <PopulationLeftRail /> : null}
        <FlatList
          data={individuals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PopulationIndividualRow
              individual={item}
              selectedTrait={filters.selectedTrait}
              onPress={inspect}
            />
          )}
          ListHeaderComponent={
            <PopulationDashboard
              population={population}
              filters={filters}
              resultCount={individuals.length}
              isTablet={isTablet}
              onFilters={setFilters}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title={population.living ? 'No matching individuals' : 'Population extinct'}
              message={
                population.living
                  ? 'Adjust the search or filters to browse the living population.'
                  : 'No living individuals remain. Historical generations remain available in the Evolution Timeline.'
              }
            />
          }
          ItemSeparatorComponent={RowSeparator}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, isTablet && styles.tabletContent]}
          initialNumToRender={16}
          maxToRenderPerBatch={20}
          windowSize={7}
          removeClippedSubviews
          style={styles.list}
        />
      </View>
      {!isTablet ? <PopulationBottomNav /> : null}
    </SafeAreaView>
  );
}

function PopulationDashboard({
  population,
  filters,
  resultCount,
  isTablet,
  onFilters,
}: {
  population: PopulationOverviewSnapshot;
  filters: PopulationFilterState;
  resultCount: number;
  isTablet: boolean;
  onFilters(next: PopulationFilterState): void;
}) {
  return (
    <View style={styles.header}>
      <View style={[styles.titleRow, !isTablet && styles.phoneTitleRow]}>
        <View style={[styles.titleCopy, !isTablet && styles.phoneTitleCopy]}>
          <AppText variant="caption" style={styles.eyebrow}>
            FIRST MINDS / POPULATION
          </AppText>
          <AppText variant={isTablet ? 'display' : 'heading'}>Population Overview</AppText>
          <AppText color="secondary">
            {scenarioLabel(population.scenario)} · Tick {population.tick}
          </AppText>
        </View>
        <View style={[styles.badges, !isTablet && styles.phoneBadges]}>
          <View style={styles.generationBadge}>
            <AppText variant="caption" style={styles.generationText}>
              Generation {population.generation}
            </AppText>
          </View>
          <View style={[styles.statusBadge, population.status !== 'running' && styles.pausedBadge]}>
            <View
              style={[
                styles.statusDot,
                population.status !== 'running' && styles.inactiveStatusDot,
              ]}
            />
            <AppText variant="caption">{statusLabel(population.status)}</AppText>
          </View>
        </View>
      </View>
      <PopulationSummaryCards population={population} showDiversity={isTablet} />
      <View style={[styles.dashboard, isTablet && styles.tabletDashboard]}>
        <View style={styles.mainColumn}>
          {isTablet ? <PopulationTrendCard trend={population.trend} /> : null}
          <LifeStageCard stages={population.lifeStages} />
          <View style={[styles.cardPair, !isTablet && styles.phoneCardPair]}>
            <View style={styles.cardColumn}>
              <GeneticVariationCard diversity={population.diversity} />
            </View>
            <View style={styles.cardColumn}>
              <PopulationHealthCard population={population} />
            </View>
          </View>
          <View style={[styles.cardPair, !isTablet && styles.phoneCardPair]}>
            <View style={styles.cardColumn}>
              <TraitOverviewCard
                traits={population.traits}
                selected={filters.selectedTrait}
                onSelect={(selectedTrait) => onFilters({ ...filters, selectedTrait })}
              />
            </View>
            <View style={styles.cardColumn}>
              <CulturalAdoptionCard adoption={population.culturalAdoption} />
            </View>
          </View>
          {!isTablet ? <OverviewLinks focusId={population.individuals[0]?.id} /> : null}
        </View>
        {isTablet ? (
          <View style={styles.sideColumn}>
            <PopulationInsightsCard insights={population.insights} />
            <OverviewLinks focusId={population.individuals[0]?.id} />
          </View>
        ) : null}
      </View>
      <View style={styles.browserHeading}>
        <View>
          <AppText variant="heading">Browse individuals</AppText>
          <AppText variant="caption" color="secondary">
            {resultCount} of {population.living} living individuals
          </AppText>
        </View>
      </View>
      <PopulationBrowserControls
        filters={filters}
        generations={population.generations}
        onChange={onFilters}
      />
    </View>
  );
}

function OverviewLinks({ focusId }: { focusId: string | undefined }) {
  return (
    <View style={styles.overviewLinks}>
      <AppButton
        label="View Evolution Timeline"
        variant="secondary"
        onPress={() => router.push(routes.evolutionTimeline)}
      />
      <AppButton
        label="Explore Family Tree"
        variant="secondary"
        onPress={() => router.push(routes.lineage(focusId))}
      />
    </View>
  );
}

function statusLabel(status: PopulationOverviewSnapshot['status']): string {
  return status === 'running' ? 'Live' : status === 'extinct' ? 'Extinct' : 'Paused';
}

function RowSeparator() {
  return <View style={{ height: spacing.sm }} />;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  body: { flex: 1, flexDirection: 'row' },
  list: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: sizing.contentMaxWidth,
    alignSelf: 'center',
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  tabletContent: { paddingHorizontal: spacing.xl },
  header: { gap: spacing.md, paddingBottom: spacing.md },
  overviewLinks: { gap: spacing.sm },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  phoneTitleRow: { position: 'relative' },
  titleCopy: { flex: 1, gap: spacing.xs },
  phoneTitleCopy: { flex: 0, width: '100%', paddingTop: spacing.xl },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.1 },
  badges: { alignItems: 'flex-end', gap: spacing.sm },
  phoneBadges: { position: 'absolute', top: 0, right: 0, flexDirection: 'row' },
  generationBadge: {
    minHeight: 32,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentDiscovery,
    borderRadius: radius.full,
  },
  generationText: { color: colors.accentDiscovery, fontWeight: '800' },
  statusBadge: {
    minHeight: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.positive,
    borderRadius: radius.full,
  },
  pausedBadge: { borderColor: colors.textMuted },
  statusDot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: colors.positive },
  inactiveStatusDot: { backgroundColor: colors.textMuted },
  dashboard: { gap: spacing.md },
  tabletDashboard: { flexDirection: 'row', alignItems: 'flex-start' },
  mainColumn: { flex: 1, minWidth: 0, gap: spacing.md },
  sideColumn: { width: 276, flexShrink: 0, gap: spacing.md },
  cardPair: { flexDirection: 'row', alignItems: 'stretch', gap: spacing.md },
  phoneCardPair: { flexDirection: 'column' },
  cardColumn: { flex: 1, minWidth: 0 },
  browserHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
});
