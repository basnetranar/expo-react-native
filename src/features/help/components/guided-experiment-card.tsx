import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { radius, spacing } from '@/theme';

const droughtPreview = require('../../../../assets/experiment-drought-preview.png');

export function GuidedExperimentCard({ onDismiss }: { onDismiss(): void }) {
  return (
    <AppCard style={styles.card} accessibilityLabel="Guided first experiment">
      <Image
        source={droughtPreview}
        contentFit="cover"
        cachePolicy="memory-disk"
        style={styles.image}
      />
      <View style={styles.copy}>
        <AppText variant="heading">Try your first experiment</AppText>
        <AppText color="secondary">
          Review the current environment, then adjust food or water below. Changes affect the
          environment—not genetics directly—and only begin after you choose Apply Changes.
        </AppText>
        <AppText variant="caption">
          Illustrative drought preview. It does not depict the current world state or guarantee an
          outcome. Resume the simulation yourself to observe later population changes.
        </AppText>
        <AppButton label="Continue on My Own" variant="secondary" onPress={onDismiss} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 0, overflow: 'hidden' },
  image: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  copy: { gap: spacing.sm, padding: spacing.md },
});
