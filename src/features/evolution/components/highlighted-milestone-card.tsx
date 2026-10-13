import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { EvolutionMilestone } from '@/features/evolution/types';
import { colors, radius, spacing } from '@/theme';

const stoneArtwork = require('../../../../assets/event-stone-cracking.png');

export function HighlightedMilestoneCard({ milestone }: { milestone: EvolutionMilestone }) {
  const showStone = milestone.title.toLowerCase().includes('stone cracking');
  return (
    <AppCard style={styles.card}>
      {showStone ? <Image source={stoneArtwork} contentFit="cover" style={styles.artwork} /> : null}
      <View style={styles.copy}>
        <AppText variant="caption" style={styles.eyebrow}>
          KEY MILESTONE · GEN {milestone.generation}
        </AppText>
        <AppText variant="heading">{milestone.title}</AppText>
        <AppText color="secondary">{milestone.description}</AppText>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'stretch' },
  artwork: { width: 82, minHeight: 82, borderRadius: radius.md, borderCurve: 'continuous' },
  copy: { flex: 1, gap: spacing.xs },
  eyebrow: { color: colors.accentDiscovery, fontWeight: '800' },
});
