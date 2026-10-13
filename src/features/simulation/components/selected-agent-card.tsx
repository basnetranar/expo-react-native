import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SelectedAgentSnapshot } from '@/features/simulation/types';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import { SIMULATION_ART } from '@/features/simulation/utils/simulation-assets';
import { colors, radius, spacing } from '@/theme';

export function SelectedAgentCard({
  agent,
  onView,
  detailed,
}: {
  agent: SelectedAgentSnapshot | null;
  onView(): void;
  detailed?: boolean;
}) {
  if (!agent)
    return (
      <View style={styles.empty}>
        <AppText variant="label">Select a hominin</AppText>
        <AppText variant="caption">Tap a figure in the world to observe their needs.</AppText>
      </View>
    );
  const name = getFriendlyName(agent.id);
  const deceased = agent.selectionState === 'deceased';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${name}${deceased ? ', deceased' : ''}`}
      onPress={onView}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={SIMULATION_ART.portrait} contentFit="cover" style={styles.portrait} />
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View>
            <AppText variant="heading">{name}</AppText>
            <AppText variant="caption">
              {formatStage(agent.phenotype.lifeStage)} · {agent.age.toFixed(1)} years · Gen{' '}
              {agent.generation}
            </AppText>
            {deceased ? (
              <AppText variant="caption" style={styles.deceased}>
                Deceased · selection preserved
              </AppText>
            ) : null}
          </View>
          <AppText variant="heading">›</AppText>
        </View>
        <AppText variant="caption" style={styles.behaviour}>
          {deceased ? 'Final recorded state' : formatBehaviour(agent.currentBehaviour)}
        </AppText>
        {agent.groupId ? (
          <AppText variant="caption" style={styles.group}>
            Social group {agent.groupId}
          </AppText>
        ) : null}
        <NeedBar label="Energy" value={agent.needs.energy} color={colors.accentDiscovery} />
        <NeedBar label="Hydration" value={agent.needs.hydration} color={colors.resourceWater} />
        <NeedBar label="Safety" value={agent.needs.safety} color={colors.resourceFood} />
        {detailed ? (
          <View style={styles.traits}>
            <Trait label="Memory" value={agent.traits.memoryPotential} />
            <Trait label="Learning" value={agent.traits.learningAbility} />
            <Trait label="Curiosity" value={agent.traits.curiosity} />
            <Trait label="Social" value={agent.traits.socialSensitivity} />
            <AppText variant="caption">Children {agent.childrenCount}</AppText>
            <AppText variant="caption">
              Learned {agent.learnedBehaviours.map((item) => item.type).join(', ') || 'None yet'}
            </AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function NeedBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.needRow}>
      <AppText variant="caption" style={styles.needLabel}>
        {label}
      </AppText>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: color },
          ]}
        />
      </View>
      <AppText variant="caption" style={styles.number}>
        {Math.round(value)}
      </AppText>
    </View>
  );
}

function Trait({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.trait}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="caption" style={styles.number}>
        {Math.round(value)}
      </AppText>
    </View>
  );
}

const formatStage = (value: string) =>
  value === 'youngAdult' ? 'Young Adult' : `${value[0]!.toUpperCase()}${value.slice(1)}`;
const formatBehaviour = (value: string) =>
  value.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    minHeight: 148,
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderCurve: 'continuous',
  },
  empty: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  portrait: { width: 104, alignSelf: 'stretch' },
  content: { flex: 1, gap: spacing.xs, padding: spacing.md },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  behaviour: { color: colors.accentScience },
  deceased: { color: colors.resourceSafety, fontWeight: '700' },
  group: { color: colors.positive, fontWeight: '700' },
  needRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  needLabel: { width: 62 },
  track: { flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.surfaceStrong },
  fill: { height: '100%', borderRadius: radius.full },
  number: { width: 28, textAlign: 'right', fontVariant: ['tabular-nums'] },
  traits: { gap: spacing.xs, paddingTop: spacing.sm },
  trait: { flexDirection: 'row', justifyContent: 'space-between' },
  pressed: { opacity: 0.74 },
});
