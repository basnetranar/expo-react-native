import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { SimulationSessionSnapshot } from '@/features/simulation/types';
import { scenarioInformation } from '@/features/world/world-configuration';
import { colors, radius, spacing } from '@/theme';

export function SimulationHud({ snapshot }: { snapshot: SimulationSessionSnapshot }) {
  const scenario = scenarioInformation[snapshot.scenario] ?? scenarioInformation.stableSavannah!;
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <View style={styles.worldDot} />
        <View style={styles.identityCopy}>
          <AppText variant="heading" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            {scenario.label}
          </AppText>
          <AppText variant="caption" style={styles.stable}>
            {scenario.status}
          </AppText>
        </View>
      </View>
      <HudMetric label="Generation" value={snapshot.generation} />
      <HudMetric
        label="Population"
        value={snapshot.populationSize}
        {...(snapshot.populationChange === null
          ? {}
          : {
              detail: `${snapshot.populationChange >= 0 ? '+' : ''}${snapshot.populationChange}`,
            })}
      />
    </View>
  );
}

function HudMetric({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return (
    <View style={styles.metric}>
      <AppText variant="caption">{label}</AppText>
      <AppText variant="metric" selectable style={styles.numeral}>
        {value}
      </AppText>
      {detail ? (
        <AppText variant="caption" style={styles.change}>
          {detail} vs previous
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  identity: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  identityCopy: { flex: 1, minWidth: 0 },
  worldDot: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.accentNature,
    borderWidth: 2,
    borderColor: colors.accentDiscovery,
    flexShrink: 0,
  },
  stable: { color: colors.accentNature },
  metric: {
    minWidth: 62,
    paddingLeft: spacing.sm,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
  },
  numeral: { fontVariant: ['tabular-nums'] },
  change: { color: colors.accentNature, fontSize: 10, lineHeight: 12 },
});
