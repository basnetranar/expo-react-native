import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { SegmentControl } from '@/components/common/SegmentControl';
import { WorldFactorSlider } from '@/components/common/WorldFactorSlider';
import { WorldViewport } from '@/components/common/WorldViewport';
import { AppScreen } from '@/components/layout/AppScreen';
import { ContextualHelp } from '@/features/help/components/contextual-help';
import {
  loadActiveWorldRecord,
  saveActiveWorldRecord,
} from '@/features/home/services/active-world-storage';
import {
  closeActiveSimulationSession,
  getActiveSimulationSession,
} from '@/features/simulation/services/active-simulation-session';
import { defaultWorldConfiguration } from '@/features/world/types';
import {
  scenarioInformation,
  supportedScenarioNames,
  worldConfigurationToRoute,
} from '@/features/world/world-configuration';
import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import type { ScenarioName } from '@/simulation';
import { colors, radius, sizing, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function CreateWorldScreen() {
  const [config, setConfig] = useState(() => ({
    ...defaultWorldConfiguration,
    seed: `FM-${Date.now().toString(36).toUpperCase()}`,
  }));
  const [hasSavedWorld, setHasSavedWorld] = useState(Boolean(getActiveSimulationSession()));
  const { isTablet } = useResponsiveLayout();
  const update = (key: keyof typeof config, value: number) =>
    setConfig((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    void loadActiveWorldRecord()
      .then((record) => setHasSavedWorld(Boolean(record)))
      .catch(() => undefined);
  }, []);
  const startSimulation = async () => {
    const active = getActiveSimulationSession();
    if (active) {
      active.pause();
      await active.persistActiveHistory();
      await saveActiveWorldRecord(active);
      closeActiveSimulationSession(active);
    }
    if (router.canDismiss()) router.dismissAll();
    router.replace({ pathname: routes.simulation, params: worldConfigurationToRoute(config) });
  };
  const confirmStart = () => {
    if (!getActiveSimulationSession() && !hasSavedWorld) {
      void startSimulation();
      return;
    }
    Alert.alert(
      'Create another world?',
      'Your current active branch will be saved before the new world opens. This version shows one active world on Home; older world files are not erased, but cannot yet be reopened from the interface.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save and Create', onPress: () => void startSimulation() },
      ],
    );
  };
  return (
    <AppScreen scroll>
      <ScreenHeader
        eyebrow="World laboratory"
        title="Create World"
        description="Choose the pressures that will shape the first generations."
      />
      <View style={[styles.layout, isTablet && styles.layoutTablet]}>
        <View style={styles.preview}>
          <WorldViewport
            label={scenarioInformation[config.scenario].label}
            description={scenarioInformation[config.scenario].description}
            scenario={config.scenario}
          />
        </View>
        <AppCard style={styles.controls}>
          <AppText variant="heading">Scenario</AppText>
          <SegmentControl
            label="Simulation scenario"
            options={supportedScenarioNames}
            value={config.scenario}
            getLabel={(scenario) => scenarioInformation[scenario].shortLabel}
            onChange={(scenario: ScenarioName) =>
              setConfig((current) => ({ ...current, scenario }))
            }
          />
          <AppText color="secondary">{scenarioInformation[config.scenario].description}</AppText>
          <View style={styles.sectionTitle}>
            <AppText variant="heading">World factors</AppText>
            <ContextualHelp topic="environmentalPressure" />
          </View>
          <AppText variant="caption">
            These controls shape access to resources and danger. They do not directly edit
            inhabitants, traits, or decisions.
          </AppText>
          <WorldFactorSlider
            label="Food abundance"
            value={config.foodAbundance}
            onValueChange={(value) => update('foodAbundance', value)}
          />
          <AppText variant="caption">
            Controls how easily inhabitants can access food in their environment.
          </AppText>
          <WorldFactorSlider
            label="Water availability"
            value={config.waterAvailability}
            onValueChange={(value) => update('waterAvailability', value)}
          />
          <AppText variant="caption">Controls the number of water sources in the world.</AppText>
          <WorldFactorSlider
            label="Predator pressure"
            value={config.predatorPressure}
            onValueChange={(value) => update('predatorPressure', value)}
          />
          <AppText variant="caption">Controls how many predators inhabit the world.</AppText>
          <WorldFactorSlider
            label="Initial population"
            value={config.initialPopulation}
            min={8}
            max={60}
            onValueChange={(value) => update('initialPopulation', value)}
          />
          <AppText variant="caption">Sets the initial living population from 8 to 60.</AppText>
          <AppText variant="label">Simulation seed</AppText>
          <TextInput
            accessibilityLabel="Simulation seed"
            autoCapitalize="characters"
            autoCorrect={false}
            value={config.seed}
            onChangeText={(seed) => setConfig((current) => ({ ...current, seed }))}
            placeholder="Enter a deterministic seed"
            placeholderTextColor={colors.textMuted}
            style={styles.seedInput}
          />
          <AppText variant="caption">
            The same seed and settings produce the same deterministic starting world.
          </AppText>
          <View style={styles.availabilityNote}>
            <AppText variant="label">Functional in this version</AppText>
            <AppText variant="caption">
              Food patches, water sources, predator count, starting population, and the selected
              scenario are passed directly to the engine.
            </AppText>
            <AppText variant="caption">
              Custom climate timing and additional habitats are not yet available.
            </AppText>
          </View>
          <AppButton label="Start Simulation" onPress={confirmStart} />
        </AppCard>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  layout: { gap: spacing.md },
  layoutTablet: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.lg },
  preview: { flex: 1.2 },
  controls: { flex: 1, gap: spacing.md },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  seedInput: {
    minHeight: sizing.minimumTouchTarget,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  availabilityNote: { gap: spacing.xs },
});
