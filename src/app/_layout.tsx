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
      <Stack.Screen name="(main)" options={{ headerShown: false }} />
      <Stack.Screen name="mission" options={{ headerShown: false }} />
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
