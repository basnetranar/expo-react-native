import { Stack } from 'expo-router/stack';

export default function MissionDetailLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Mission Overview' }} />
      <Stack.Screen name="briefing" options={{ title: 'Briefing' }} />
      <Stack.Screen name="plan" options={{ headerShown: false }} />
      <Stack.Screen name="execute" options={{ title: 'Execution' }} />
      <Stack.Screen name="result" options={{ title: 'Result' }} />
    </Stack>
  );
}
