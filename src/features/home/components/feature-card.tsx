import { Image, type ImageSource } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export function FeatureCard({ title, description, image, onPress, disabled }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Image source={image} contentFit="cover" cachePolicy="memory-disk" style={styles.image} />
      <View style={styles.scrim} />
      <View style={styles.copy}>
        <AppText variant="heading">{title}</AppText>
        <AppText style={styles.description}>{description}</AppText>
      </View>
    </Pressable>
  );
}

interface Props {
  title: string;
  description: string;
  image: ImageSource;
  onPress(): void;
  disabled?: boolean;
}

const styles = StyleSheet.create({
  card: {
    minHeight: 220,
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  image: { position: 'absolute', inset: 0 },
  scrim: { position: 'absolute', inset: 0, backgroundColor: 'rgba(2, 10, 18, 0.55)' },
  copy: { gap: spacing.xs, padding: spacing.md },
  description: { color: colors.textPrimary },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.42 },
});
