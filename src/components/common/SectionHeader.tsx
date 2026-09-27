import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';

export function SectionHeader({ title, eyebrow }: { title: string; eyebrow?: string }) {
  return (
    <View style={styles.container}>
      {eyebrow ? <AppText style={styles.eyebrow}>{eyebrow.toUpperCase()}</AppText> : null}
      <AppText variant="heading">{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
});
