import { Link } from 'expo-router';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { featureFlags } from '@/config/featureFlags';

export function HomeScreen() {
  return (
    <AppScreen scroll>
      <AppText variant="heading">Infrastructure ready</AppText>
      <AppText color="secondary">
        Replace this route with your first feature. The boilerplate owns infrastructure; features
        own business logic.
      </AppText>
      <ResponsiveGrid phoneColumns={1} tabletColumns={2} largeTabletColumns={3}>
        {['Typed configuration', 'Responsive layouts', 'Safe OTA updates'].map((label) => (
          <AppCard key={label}>
            <AppText variant="label">{label}</AppText>
          </AppCard>
        ))}
      </ResponsiveGrid>
      {featureFlags.diagnostics ? (
        <Link href="/diagnostics">Open developer diagnostics</Link>
      ) : null}
    </AppScreen>
  );
}
