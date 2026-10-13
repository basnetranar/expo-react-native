import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';

import { AppBootstrap } from '@/bootstrap/AppBootstrap';
import { ApplicationProviders } from '@/components/ApplicationProviders';
import { RootErrorBoundary } from '@/errors/RootErrorBoundary';
import { colors } from '@/theme';
import { AppUpdateListener } from '@/updates/AppUpdateListener';

void SplashScreen.preventAutoHideAsync();

function RouterApplication() {
  return (
    <Stack
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="lab/index" options={{ title: 'First Minds', headerShown: false }} />
      <Stack.Screen name="world/create" options={{ title: 'Create World' }} />
      <Stack.Screen name="world/overview" options={{ title: 'World Overview' }} />
      <Stack.Screen
        name="simulation/index"
        options={{ title: 'Live Simulation', headerShown: false }}
      />
      <Stack.Screen name="hominin/[id]" options={{ title: 'Hominin Inspector' }} />
      <Stack.Screen name="evolution/timeline" options={{ title: 'Evolution Timeline' }} />
      <Stack.Screen
        name="evolution/generation/[generation]"
        options={{ title: 'Generation Details' }}
      />
      <Stack.Screen name="discovery/[id]" options={{ title: 'Discovery' }} />
      <Stack.Screen name="population/index" options={{ title: 'Population', headerShown: false }} />
      <Stack.Screen name="lineage/index" options={{ title: 'Family Tree', headerShown: false }} />
      <Stack.Screen
        name="experiments/index"
        options={{ title: 'Experiments', headerShown: false }}
      />
      <Stack.Screen
        name="histories/index"
        options={{ title: 'Alternate Histories', headerShown: false }}
      />
      <Stack.Screen name="social/index" options={{ title: 'Social Groups', headerShown: false }} />
      <Stack.Screen name="social/group/[id]" options={{ title: 'Group Details' }} />
      <Stack.Screen name="social/relationships/[id]" options={{ title: 'Relationships' }} />
      <Stack.Screen name="social/activity" options={{ title: 'Group Activity' }} />
      <Stack.Screen name="social/insights" options={{ title: 'Social Insights' }} />
      <Stack.Screen name="learning/index" options={{ title: 'Learning', headerShown: false }} />
      <Stack.Screen name="learning/behaviours/index" options={{ title: 'Learned Behaviours' }} />
      <Stack.Screen name="learning/behaviours/[id]" options={{ title: 'Behaviour Detail' }} />
      <Stack.Screen name="learning/history" options={{ title: 'Cultural History' }} />
      <Stack.Screen name="learning/individual/[id]" options={{ title: 'Individual Learning' }} />
      <Stack.Screen
        name="learning/transmission/[id]"
        options={{ title: 'Knowledge Transmission' }}
      />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="diagnostics" options={{ title: 'Diagnostics' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <RootErrorBoundary>
      <AppBootstrap>
        <AppUpdateListener>
          <ApplicationProviders>
            <RouterApplication />
          </ApplicationProviders>
        </AppUpdateListener>
      </AppBootstrap>
    </RootErrorBoundary>
  );
}
