import { StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { MetricTile } from '@/components/common/MetricTile';
import { ScreenHeader } from '@/components/common/ScreenHeader';
import { WorldViewport } from '@/components/common/WorldViewport';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { colors, spacing } from '@/theme';

export function WorldOverviewScreen() {
  return (
    <AppScreen scroll maxWidth="none">
      <ScreenHeader
        eyebrow="Living world"
        title="River of Dawn"
        description="A tablet-friendly view of terrain, resources, and population movement."
      />
      <WorldViewport label="Eastern river corridor" />
      <ResponsiveGrid phoneColumns={2} tabletColumns={4} largeTabletColumns={4}>
        <MetricTile label="Food regions" value="7" accent={colors.resourceFood} />
        <MetricTile label="Water regions" value="4" accent={colors.resourceWater} />
        <MetricTile label="Safe shelters" value="3" accent={colors.resourceSafety} />
        <MetricTile label="Population groups" value="2" accent={colors.accentScience} />
      </ResponsiveGrid>
      <View style={styles.row}>
        <Region label="North Ridge" detail="Dry high ground · low predator activity" />
        <Region label="River Bend" detail="Reliable water · dense food resources" />
        <Region label="Southern Grassland" detail="Open terrain · visible predator routes" />
      </View>
    </AppScreen>
  );
}

function Region({ label, detail }: { label: string; detail: string }) {
  return (
    <AppCard style={styles.region}>
      <AppText variant="label">{label}</AppText>
      <AppText color="secondary">{detail}</AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  region: { flexGrow: 1, flexBasis: 220 },
});
