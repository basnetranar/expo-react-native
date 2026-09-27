import type { Href } from 'expo-router';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { colors, spacing } from '@/theme';

export function NavigationCard({
  title,
  description,
  href,
  accent = colors.primary,
}: {
  title: string;
  description: string;
  href: Href;
  accent?: string;
}) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={({ pressed }) => pressed && styles.pressed}>
        <AppCard style={styles.card}>
          <View style={[styles.marker, { backgroundColor: accent }]} />
          <View style={styles.copy}>
            <AppText variant="label">{title}</AppText>
            <AppText variant="caption">{description}</AppText>
          </View>
          <AppText style={{ color: accent }}>›</AppText>
        </AppCard>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 84, flexDirection: 'row', alignItems: 'center' },
  marker: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  copy: { flex: 1, gap: spacing.xs },
  pressed: { opacity: 0.72 },
});
