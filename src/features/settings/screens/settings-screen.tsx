import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AppScreen } from '@/components/layout/AppScreen';
import { appConfig } from '@/config/app';
import { featureFlags } from '@/config/featureFlags';
import { ContextualHelp } from '@/features/help/components/contextual-help';
import { spacing } from '@/theme';

export function SettingsScreen() {
  return (
    <AppScreen scroll maxWidth="readable">
      <SectionHeader eyebrow="First Minds" title="Settings" />
      <AppCard>
        <SettingRow label="Application" value={appConfig.name} />
        <SettingRow label="Version" value={appConfig.version} />
        <SettingRow label="Milestone" value="Player experience" />
      </AppCard>
      <AppCard>
        <AppText variant="heading">Help</AppText>
        <HelpRow label="How Simulation Works" topic="generation" />
        <HelpRow label="Understanding Evolution" topic="naturalSelection" />
        <HelpRow label="Environmental Experiments" topic="environmentalPressure" />
        <HelpRow label="Checkpoints" topic="checkpoints" />
        <HelpRow label="Evolutionary Branches" topic="branches" />
        <AppButton
          label="Replay Introduction"
          variant="secondary"
          onPress={() => router.push({ pathname: '/onboarding', params: { replay: '1' } })}
        />
      </AppCard>
      <AppButton
        label="Reset Local Simulation Data"
        variant="secondary"
        onPress={() =>
          Alert.alert(
            'Reset unavailable',
            'Reset is intentionally unavailable in this build. No saved simulation data was changed.',
          )
        }
      />
      {featureFlags.diagnostics ? (
        <AppButton
          label="Diagnostics & Developer Tools"
          variant="secondary"
          onPress={() => router.push('/diagnostics')}
        />
      ) : null}
      <AppCard>
        <AppText variant="label">About</AppText>
        <AppText color="secondary">Shape the world. Watch intelligence emerge.</AppText>
        <AppText color="secondary">
          A cinematic evolution and intelligence simulation from Challenge Me Lab.
        </AppText>
      </AppCard>
    </AppScreen>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <AppText>{label}</AppText>
      <AppText color="secondary" selectable>
        {value}
      </AppText>
    </View>
  );
}

function HelpRow({
  label,
  topic,
}: {
  label: string;
  topic: Parameters<typeof ContextualHelp>[0]['topic'];
}) {
  return (
    <View style={styles.row}>
      <AppText>{label}</AppText>
      <ContextualHelp topic={topic} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
});
