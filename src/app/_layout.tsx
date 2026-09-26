import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';

import { AppBootstrap } from '@/bootstrap/AppBootstrap';
import { ApplicationProviders } from '@/components/ApplicationProviders';
import { RootErrorBoundary } from '@/errors/RootErrorBoundary';
import { AppUpdateListener } from '@/updates/AppUpdateListener';

void SplashScreen.preventAutoHideAsync();

function RouterApplication() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Starter' }} />
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
