import { Stack } from 'expo-router/stack';

export default function MainLayout() {
  return (
    <Stack screenOptions={{ headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="home" options={{ title: 'Heist Planner' }} />
      <Stack.Screen name="missions" options={{ title: 'Missions' }} />
      <Stack.Screen name="crew" options={{ title: 'Crew' }} />
      <Stack.Screen name="equipment" options={{ title: 'Equipment' }} />
      <Stack.Screen name="upgrades" options={{ title: 'Upgrades' }} />
    </Stack>
  );
}
