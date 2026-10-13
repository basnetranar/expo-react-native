import { Image } from 'expo-image';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { FeatureCard } from '@/features/home/components/feature-card';
import { useHomeDashboard } from '@/features/home/hooks/use-home-dashboard';
import { scenarioInformation } from '@/features/world/world-configuration';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

const logo = require('../../../../assets/first-minds-logo.png');
const liveImage = require('../../../../assets/home-live-simulation.png');
const populationImage = require('../../../../assets/home-population-overview.png');
const hero = require('../../../../assets/onboarding-savannah-hero.png');

export function LabScreen() {
  const { isTablet } = useResponsiveLayout();
  const dashboard = useHomeDashboard();
  const hasSession = Boolean(dashboard.active || dashboard.saved);
  const activeBranch = dashboard.histories?.branches.find(
    (item) => item.id === dashboard.histories?.activeBranchId,
  );
  const summary = dashboard.active
    ? {
        scenario: dashboard.active.snapshot.scenario,
        generation: dashboard.active.snapshot.generation,
        population: dashboard.active.snapshot.populationSize,
        status: dashboard.active.status,
        branch: activeBranch?.name,
        savedAt: dashboard.saved?.record.lastSavedAt ?? null,
      }
    : dashboard.saved
      ? {
          scenario: dashboard.saved.record.scenario,
          generation: dashboard.saved.record.generation,
          population: dashboard.saved.record.population,
          status: dashboard.saved.record.status,
          branch: dashboard.saved.record.activeBranchName,
          savedAt: dashboard.saved.record.lastSavedAt,
        }
      : null;
  const savedHistoriesCount =
    dashboard.histories?.branches.length ?? dashboard.saved?.manifest.branches.length ?? 0;
  const continueSimulation = () =>
    router.push(
      dashboard.active
        ? routes.simulation
        : { pathname: routes.simulation, params: { restore: '1' } },
    );
  const openSessionDestination = (
    destination:
      | 'population'
      | 'timeline'
      | 'experiments'
      | 'histories'
      | 'guidedExperiment'
      | 'social'
      | 'learning',
  ) => {
    const direct = {
      population: routes.population,
      timeline: routes.evolutionTimeline,
      experiments: routes.experiments,
      histories: routes.histories,
      guidedExperiment: { pathname: routes.experiments, params: { guide: '1' } },
      social: routes.social,
      learning: routes.learning,
    }[destination];
    router.push(
      dashboard.active
        ? direct
        : { pathname: routes.simulation, params: { restore: '1', destination } },
    );
  };

  return (
    <AppScreen scroll maxWidth="none" edges={['top', 'bottom']} style={styles.screen}>
      <View style={styles.header}>
        <Image
          source={logo}
          contentFit="contain"
          accessibilityLabel="First Minds logo"
          style={styles.logo}
        />
        <View style={styles.headerCopy}>
          <AppText variant={isTablet ? 'display' : 'heading'}>
            Welcome {hasSession ? 'back' : 'to First Minds'}
          </AppText>
          <AppText color="secondary">Explore a living simulation of human evolution.</AppText>
        </View>
        <AppButton
          label="Help & Settings"
          variant="secondary"
          onPress={() => router.push(routes.settings)}
        />
      </View>
      <View style={[styles.heroRow, isTablet && styles.heroRowTablet]}>
        <View style={styles.hero}>
          <Image
            source={hero}
            contentFit="cover"
            cachePolicy="memory-disk"
            style={styles.heroImage}
          />
          <View style={styles.heroScrim} />
          <View style={styles.heroCopy}>
            <AppText variant="display">Shape the world.</AppText>
            <AppText variant="heading" style={styles.tagline}>
              Watch intelligence emerge.
            </AppText>
          </View>
        </View>
        <AppCard style={[styles.actionPanel, isTablet && styles.actionPanelTablet]}>
          {summary ? (
            <>
              <AppText variant="heading">Current world</AppText>
              <AppText variant="label">{scenarioInformation[summary.scenario].label}</AppText>
              <AppText color="secondary">
                Generation {summary.generation} · Population {summary.population}
              </AppText>
              <AppText color="secondary">
                {summary.branch ?? 'Active history'} · {capitalize(summary.status)}
              </AppText>
              {summary.savedAt ? (
                <AppText variant="caption">Last saved {formatSavedTime(summary.savedAt)}</AppText>
              ) : null}
              <AppButton label="Continue Simulation" onPress={continueSimulation} />
            </>
          ) : (
            <>
              <AppText variant="heading">Begin a new world</AppText>
              <AppText color="secondary">
                Choose its environmental pressures, then observe what unfolds.
              </AppText>
            </>
          )}
          <AppButton
            label="Create New World"
            variant={summary ? 'secondary' : 'primary'}
            onPress={() => router.push(routes.createWorld)}
          />
          {savedHistoriesCount > 0 ? (
            <AppButton
              label={`Explore Saved Histories (${savedHistoriesCount})`}
              variant="secondary"
              onPress={() =>
                dashboard.active
                  ? openSessionDestination('histories')
                  : router.push({
                      pathname: routes.simulation,
                      params: { restore: '1', destination: 'histories' },
                    })
              }
            />
          ) : null}
          {dashboard.error ? (
            <View accessibilityRole="alert" style={styles.error}>
              <AppText color="destructive">Saved world summary unavailable.</AppText>
              <AppButton
                label="Retry"
                variant="secondary"
                onPress={() => void dashboard.refresh()}
              />
            </View>
          ) : null}
        </AppCard>
      </View>
      <View style={[styles.features, isTablet && styles.featuresTablet]}>
        <FeatureCard
          title="Live Simulation"
          description="Watch inhabitants live, learn, and adapt in real time."
          image={liveImage}
          onPress={continueSimulation}
          disabled={!hasSession}
        />
        <FeatureCard
          title="Population Overview"
          description="Explore population trends, traits, resources, and individuals."
          image={populationImage}
          onPress={() => openSessionDestination('population')}
          disabled={!hasSession}
        />
      </View>
      <View style={[styles.secondary, isTablet && styles.secondaryTablet]}>
        <SecondaryAction
          label="Social Groups"
          disabled={!hasSession}
          onPress={() => openSessionDestination('social')}
        />
        <SecondaryAction
          label="Learning & Culture"
          disabled={!hasSession}
          onPress={() => openSessionDestination('learning')}
        />
        <SecondaryAction
          label="Evolution Timeline"
          disabled={!hasSession}
          onPress={() => openSessionDestination('timeline')}
        />
        <SecondaryAction
          label="Experiments"
          disabled={!hasSession}
          onPress={() => openSessionDestination('experiments')}
        />
        <SecondaryAction
          label="Alternate Histories"
          disabled={!hasSession}
          onPress={() => openSessionDestination('histories')}
        />
        <SecondaryAction
          label="Try Your First Experiment"
          disabled={!hasSession}
          onPress={() => openSessionDestination('guidedExperiment')}
        />
      </View>
    </AppScreen>
  );
}

function SecondaryAction(props: { label: string; disabled: boolean; onPress(): void }) {
  return <AppButton {...props} variant="secondary" style={styles.secondaryAction} />;
}

function capitalize(value: string) {
  return `${value[0]?.toUpperCase() ?? ''}${value.slice(1)}`;
}
function formatSavedTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toLocaleString();
}

const styles = StyleSheet.create({
  screen: { gap: spacing.lg },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.md },
  logo: { width: 72, height: 64 },
  headerCopy: { flex: 1, minWidth: 220, gap: spacing.xs },
  heroRow: { gap: spacing.md },
  heroRowTablet: { minHeight: 430, flexDirection: 'row' },
  hero: {
    minHeight: 340,
    flex: 1.6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderRadius: radius.lg,
  },
  heroImage: { position: 'absolute', inset: 0 },
  heroScrim: { position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 10, 18, 0.38)' },
  heroCopy: { gap: spacing.xs, padding: spacing.lg },
  tagline: { color: colors.accentDiscovery },
  actionPanel: { justifyContent: 'center' },
  actionPanelTablet: { flex: 0.9, padding: spacing.lg },
  error: { gap: spacing.sm },
  features: { gap: spacing.md },
  featuresTablet: { flexDirection: 'row' },
  secondary: { gap: spacing.sm },
  secondaryTablet: { flexDirection: 'row', flexWrap: 'wrap' },
  secondaryAction: { flexGrow: 1 },
});
