import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function WorldViewport({
  label = 'Savannah river basin',
  description = 'A living world ready for observation.',
  scenario = 'stableSavannah',
  compact = false,
}: Props) {
  return (
    <View
      accessibilityLabel={`World viewport: ${label}`}
      style={[styles.viewport, compact && styles.compact]}
    >
      <Image
        source={require('../../../assets/world-savannah-background.png')}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          styles.scenarioTreatment,
          scenario === 'drought' && styles.drought,
          scenario === 'hardFood' && styles.hardFood,
        ]}
      />
      <View style={styles.copy}>
        <AppText variant="caption" style={styles.eyebrow}>
          LIVE WORLD VIEW
        </AppText>
        <AppText variant="heading">{label}</AppText>
        <AppText color="secondary">{description}</AppText>
      </View>
    </View>
  );
}

interface Props {
  label?: string;
  description?: string;
  scenario?: 'stableSavannah' | 'drought' | 'hardFood';
  compact?: boolean;
}

const styles = StyleSheet.create({
  viewport: {
    minHeight: 300,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: spacing.lg,
    backgroundColor: '#183248',
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  compact: { minHeight: 220 },
  scenarioTreatment: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(4, 12, 18, 0.22)',
  },
  drought: { backgroundColor: 'rgba(138, 72, 20, 0.3)' },
  hardFood: { backgroundColor: 'rgba(20, 29, 38, 0.38)' },
  copy: {
    gap: spacing.xs,
    margin: -spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(4, 12, 18, 0.72)',
  },
  eyebrow: { color: colors.accentDiscovery, fontWeight: '800', letterSpacing: 1.2 },
});
