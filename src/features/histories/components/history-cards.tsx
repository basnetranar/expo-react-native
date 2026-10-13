import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import type { CheckpointMetadata, EvolutionBranch } from '@/features/histories/types';
import { branchColor, formatBytes } from '@/features/histories/utils/history-presentation';
import { colors, radius, spacing } from '@/theme';

const worldArtwork = require('../../../../assets/world-savannah-background.png');

export function BranchCard({
  branch,
  branches,
  selected,
  disabled,
  onSelect,
  onSwitch,
}: BranchCardProps) {
  return (
    <Pressable onPress={onSelect} accessibilityRole="button" accessibilityState={{ selected }}>
      <AppCard style={selected && styles.selectedCard}>
        <View style={styles.branchRow}>
          <Image
            source={worldArtwork}
            style={styles.preview}
            accessibilityLabel="Savannah world preview"
          />
          <View style={styles.copy}>
            <View style={styles.titleRow}>
              <View style={[styles.dot, { backgroundColor: branchColor(branches, branch.id) }]} />
              <AppText variant="heading" numberOfLines={1}>
                {branch.name}
              </AppText>
            </View>
            <AppText color="secondary">
              Generation {branch.generation} · Population {branch.population}
            </AppText>
            <AppText variant="caption" color="secondary">
              {branch.parentBranchId
                ? `Branched at generation ${branch.originGeneration}`
                : 'Main evolutionary history'}
            </AppText>
          </View>
          <View style={[styles.badge, branch.status === 'active' && styles.liveBadge]}>
            <AppText variant="caption">{branch.status}</AppText>
          </View>
        </View>
        {selected && branch.status !== 'active' ? (
          <AppButton label="Switch to this history" disabled={disabled} onPress={onSwitch} />
        ) : null}
      </AppCard>
    </Pressable>
  );
}

export function CheckpointCard({
  item,
  sourceName,
  disabled,
  onBranch,
  onRename,
  onDelete,
}: CheckpointCardProps) {
  const [label, setLabel] = useState('');
  return (
    <AppCard>
      <View style={styles.titleRow}>
        <View
          style={[
            styles.dot,
            { backgroundColor: item.kind === 'head' ? colors.positive : colors.accentScience },
          ]}
        />
        <View style={styles.copy}>
          <AppText variant="label">{item.label}</AppText>
          <AppText variant="caption" color="secondary">
            {sourceName} · Generation {item.generation} · Tick {item.tick} · Population{' '}
            {item.population}
          </AppText>
          <AppText variant="caption" color="secondary">
            {new Date(item.createdAt).toLocaleString()} · {formatBytes(item.sizeBytes)} · Restorable
            checkpoint
          </AppText>
        </View>
      </View>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Rename checkpoint"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        accessibilityLabel="Checkpoint label"
      />
      <View style={styles.actions}>
        <AppButton
          label="Create branch"
          variant="secondary"
          disabled={disabled}
          onPress={onBranch}
        />
        <AppButton
          label="Rename"
          variant="secondary"
          disabled={disabled || !label.trim()}
          onPress={() => {
            onRename(label);
            setLabel('');
          }}
        />
        {item.kind === 'manual' ? (
          <AppButton label="Delete" variant="secondary" disabled={disabled} onPress={onDelete} />
        ) : null}
      </View>
    </AppCard>
  );
}

interface BranchCardProps {
  branch: EvolutionBranch;
  branches: readonly EvolutionBranch[];
  selected: boolean;
  disabled: boolean;
  onSelect(): void;
  onSwitch(): void;
}
interface CheckpointCardProps {
  item: CheckpointMetadata;
  sourceName: string;
  disabled: boolean;
  onBranch(): void;
  onRename(label: string): void;
  onDelete(): void;
}

const styles = StyleSheet.create({
  selectedCard: { borderColor: colors.accentScience },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  preview: { width: 76, height: 62, borderRadius: radius.md },
  copy: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: colors.surfaceStrong,
  },
  liveBadge: { borderWidth: 1, borderColor: colors.positive },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  input: {
    minHeight: 42,
    color: colors.text,
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
});
