import { router } from 'expo-router';

import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppScreen } from '@/components/layout/AppScreen';

export default function NotFoundScreen() {
  return (
    <AppScreen maxWidth="readable">
      <AppText variant="heading">This screen does not exist.</AppText>
      <AppButton label="Return Home" onPress={() => router.replace('/')} />
    </AppScreen>
  );
}
