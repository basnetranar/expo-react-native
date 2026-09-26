import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { spacing } from '@/theme';

export function EmptyState({
  title = 'Nothing here yet',
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <View style={styles.container}>
      <AppText variant="heading">{title}</AppText>
      {message ? <AppText color="secondary">{message}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm, padding: spacing.xl },
});
