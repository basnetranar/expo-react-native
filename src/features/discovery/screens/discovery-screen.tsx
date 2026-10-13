import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { toolUseDiscovery } from '@/features/discovery/data/mock-discoveries';
import { colors, radius, spacing } from '@/theme';
import { routes } from '@/types/navigation';

export function DiscoveryScreen() {
  useLocalSearchParams<{ id: string }>();
  const discovery = toolUseDiscovery;
  return (
    <AppScreen scroll maxWidth="readable" style={styles.screen}>
      <View style={styles.symbol}>
        <View style={styles.stone} />
      </View>
      <AppText variant="caption" style={styles.eyebrow}>
        NEW DISCOVERY
      </AppText>
      <AppText variant="title">{discovery.title}</AppText>
      <AppText>{discovery.body}</AppText>
      <AppCard style={styles.signals}>
        <AppText variant="heading">Signals observed</AppText>
        {discovery.signals.map((signal) => (
          <View key={signal} style={styles.signal}>
            <View style={styles.dot} />
            <AppText color="secondary" style={styles.signalCopy}>
              {signal}
            </AppText>
          </View>
        ))}
      </AppCard>
      <AppButton label="Continue" onPress={() => router.replace(routes.simulation)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'center', gap: spacing.lg },
  symbol: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.full,
  },
  stone: {
    width: 40,
    height: 48,
    backgroundColor: colors.accentDiscovery,
    borderRadius: radius.sm,
    transform: [{ rotate: '18deg' }],
  },
  eyebrow: { color: colors.accentDiscovery, fontWeight: '900', letterSpacing: 1.8 },
  signals: { gap: spacing.md },
  signal: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  dot: {
    width: 8,
    height: 8,
    marginTop: 7,
    backgroundColor: colors.accentScience,
    borderRadius: radius.full,
  },
  signalCopy: { flex: 1 },
});
