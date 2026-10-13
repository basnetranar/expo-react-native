import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';

export function ScreenHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <View style={styles.container}>
      {eyebrow ? (
        <AppText variant="caption" style={styles.eyebrow}>
          {eyebrow.toUpperCase()}
        </AppText>
      ) : null}
      <AppText variant="title">{title}</AppText>
      {description ? <AppText color="secondary">{description}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  eyebrow: { color: colors.accentScience, fontWeight: '800', letterSpacing: 1.4 },
});
