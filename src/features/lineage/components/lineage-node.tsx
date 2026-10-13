import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import type { LineagePerson } from '@/features/lineage/types';
import { HOMININ_ASSETS } from '@/features/simulation/utils/simulation-assets';
import { colors, radius, sizing, spacing } from '@/theme';

export function LineageNode({ person, selected, onPress }: Props) {
  const stage = person.inspector?.phenotype.lifeStage ?? 'adult';
  const variants = HOMININ_ASSETS[stage];
  const source = variants[person.portraitVariant % variants.length]!;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${person.name}, generation ${person.record.birthGeneration}, ${person.alive ? 'living' : 'deceased'}`}
      accessibilityState={{ selected }}
      onPress={() => onPress(person.record.id)}
      style={({ pressed }) => [
        styles.node,
        selected && styles.selected,
        !person.alive && styles.deceased,
        pressed && styles.pressed,
      ]}
    >
      <Image source={source} contentFit="cover" style={styles.portrait} />
      <View style={styles.copy}>
        <AppText variant="label" numberOfLines={1} style={styles.name}>
          {person.name}
        </AppText>
        <AppText variant="caption" color="secondary" numberOfLines={1}>
          Gen {person.record.birthGeneration}
        </AppText>
        <AppText
          variant="caption"
          style={{ color: person.alive ? colors.positive : colors.textMuted }}
        >
          {person.alive ? 'Living' : 'Deceased'}
        </AppText>
      </View>
    </Pressable>
  );
}

interface Props {
  person: LineagePerson;
  selected: boolean;
  onPress(id: string): void;
}

const styles = StyleSheet.create({
  node: {
    minWidth: 88,
    minHeight: sizing.minimumTouchTarget,
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.accentScience,
    borderRadius: radius.md,
    borderCurve: 'continuous',
  },
  selected: { borderWidth: 2, borderColor: colors.accentDiscovery },
  deceased: { opacity: 0.72, borderColor: colors.textMuted },
  portrait: { width: '100%', height: 64, backgroundColor: colors.surfaceStrong },
  copy: { alignItems: 'center', padding: spacing.xs },
  name: { color: colors.textPrimary },
  pressed: { opacity: 0.65 },
});
