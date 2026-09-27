import { Host } from '@expo/ui';
import type { PropsWithChildren } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export function ApplicationProviders({ children }: PropsWithChildren) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Host style={{ flex: 1 }}>{children}</Host>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
