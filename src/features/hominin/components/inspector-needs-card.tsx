import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { HomininInspectorViewModel } from '@/features/hominin/types';
import { colors, radius, spacing } from '@/theme';

export function InspectorNeedsCard({ individual }: { individual: HomininInspectorViewModel }) {
  return (
    <AppCard>
      <AppText variant="heading">
        {individual.alive ? 'Current condition' : 'Final recorded condition'}
      </AppText>
      <Need label="Energy" value={individual.needs.energy} color={colors.accentDiscovery} />
      <Need label="Hydration" value={individual.needs.hydration} color={colors.resourceWater} />
      <Need label="Health" value={individual.needs.health} color={colors.accentNature} />
      <Need label="Safety" value={individual.needs.safety} color={colors.resourceSafety} />
    </AppCard>
  );
}

function Need({ label, value, color }: { label: string; value: number; color: string }) {
  const normalized = Math.max(0, Math.min(100, value));
  return (
    <View accessibilityLabel={`${label}: ${Math.round(value)} percent`} style={styles.need}>
      <View style={styles.row}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="caption" selectable style={styles.value}>
          {Math.round(value)}
        </AppText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { backgroundColor: color, width: `${normalized}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  need: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  value: { fontVariant: ['tabular-nums'] },
  track: {
    height: 7,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.background,
  },
  fill: { height: '100%', borderRadius: radius.full },
});
