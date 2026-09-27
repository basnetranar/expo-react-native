import { Switch } from '@expo/ui';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { SectionHeader } from '@/components/common/SectionHeader';
import { AppScreen } from '@/components/layout/AppScreen';
import { appConfig } from '@/config/app';
import { spacing } from '@/theme';

export function SettingsScreen() {
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [haptics, setHaptics] = useState(true);
  return (
    <AppScreen scroll maxWidth="readable">
      <SectionHeader eyebrow="Preferences" title="Settings" />
      <AppCard>
        <SettingRow label="Sound Effects">
          <Switch value={sound} onValueChange={setSound} />
        </SettingRow>
        <SettingRow label="Music">
          <Switch value={music} onValueChange={setMusic} />
        </SettingRow>
        <SettingRow label="Haptics">
          <Switch value={haptics} onValueChange={setHaptics} />
        </SettingRow>
      </AppCard>
      <AppButton
        label="Reset Tutorial"
        variant="secondary"
        onPress={() =>
          Alert.alert('Tutorial reset', 'The tutorial will appear on the next supported launch.')
        }
      />
      <AppCard>
        <AppText variant="label">About</AppText>
        <AppText color="secondary">
          {appConfig.name} · Version {appConfig.version}
        </AppText>
        <AppText color="secondary">A tactical planning game from Challenge Me Lab.</AppText>
      </AppCard>
    </AppScreen>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <AppText>{label}</AppText>
      {children}
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
