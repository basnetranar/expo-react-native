import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { LineageNode } from '@/features/lineage/components/lineage-node';
import type { FamilyTreeViewModel, LineageGraphEdge } from '@/features/lineage/types';
import { lineageNodeSize } from '@/features/lineage/utils/lineage-graph-layout';
import { colors, radius, sizing, spacing } from '@/theme';

const zoomLevels = [0.75, 1, 1.25] as const;

export function FamilyTreeCanvas({ family, onSelect }: Props) {
  const scroll = useRef<ScrollView>(null);
  const [zoomIndex, setZoomIndex] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(320);
  const zoom = zoomLevels[zoomIndex]!;
  const selectedNode = family.graph.nodes.find((node) => node.id === family.selected.record.id);
  const centerSelected = () => {
    if (!selectedNode) return;
    const target = Math.max(0, selectedNode.x * zoom - viewportWidth / 2);
    scroll.current?.scrollTo({ x: target, animated: true });
  };
  return (
    <View style={styles.frame}>
      <View style={styles.toolbar}>
        <AppText variant="caption" color="secondary">
          Drag to explore · tap a relative to focus
        </AppText>
        <View style={styles.controls}>
          <Control
            label="−"
            disabled={zoomIndex === 0}
            onPress={() => setZoomIndex(zoomIndex - 1)}
          />
          <AppText variant="caption">{Math.round(zoom * 100)}%</AppText>
          <Control
            label="+"
            disabled={zoomIndex === zoomLevels.length - 1}
            onPress={() => setZoomIndex(zoomIndex + 1)}
          />
          <Control label="Center" onPress={centerSelected} />
        </View>
      </View>
      <ScrollView
        ref={scroll}
        horizontal
        nestedScrollEnabled
        onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
        contentContainerStyle={{ width: family.graph.width * zoom }}
        showsHorizontalScrollIndicator
      >
        <View style={{ width: family.graph.width * zoom, height: family.graph.height * zoom }}>
          {family.graph.generations.map((generation, rowIndex) => (
            <AppText
              key={generation}
              variant="caption"
              color="secondary"
              style={[styles.generation, { top: (20 + rowIndex * 176) * zoom }]}
            >
              Gen {generation}
            </AppText>
          ))}
          {family.graph.edges.map((edge) => (
            <Connector key={edge.id} edge={edge} zoom={zoom} />
          ))}
          {family.graph.nodes.map((node) => {
            const person = family.people.get(node.id);
            return person ? (
              <View
                key={node.id}
                style={{
                  position: 'absolute',
                  left: node.x * zoom,
                  top: node.y * zoom,
                  width: lineageNodeSize.width,
                  transform: [{ scale: zoom }],
                  transformOrigin: 'top left',
                }}
              >
                <LineageNode
                  person={person}
                  selected={node.id === family.selected.record.id}
                  onPress={onSelect}
                />
              </View>
            ) : null;
          })}
        </View>
      </ScrollView>
      {family.graph.truncated ? (
        <AppText variant="caption" color="secondary" style={styles.notice}>
          Showing the nearest 32 recorded relatives. Select a branch to continue exploring.
        </AppText>
      ) : null}
    </View>
  );
}

function Connector({ edge, zoom }: { edge: LineageGraphEdge; zoom: number }) {
  const middle = ((edge.y1 + edge.y2) / 2) * zoom;
  const firstX = edge.x1 * zoom;
  const secondX = edge.x2 * zoom;
  return (
    <>
      <View
        style={[
          styles.line,
          { left: firstX, top: edge.y1 * zoom, width: 1, height: middle - edge.y1 * zoom },
        ]}
      />
      <View
        style={[
          styles.line,
          {
            left: Math.min(firstX, secondX),
            top: middle,
            width: Math.abs(secondX - firstX),
            height: 1,
          },
        ]}
      />
      <View
        style={[
          styles.line,
          { left: secondX, top: middle, width: 1, height: edge.y2 * zoom - middle },
        ]}
      />
    </>
  );
}

function Control({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === '−' ? 'Zoom out' : label === '+' ? 'Zoom in' : label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.control,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <AppText variant="caption">{label}</AppText>
    </Pressable>
  );
}

interface Props {
  family: FamilyTreeViewModel;
  onSelect(id: string): void;
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: colors.backgroundElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  toolbar: {
    minHeight: sizing.minimumTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  controls: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  control: {
    minWidth: sizing.minimumTouchTarget,
    minHeight: sizing.minimumTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
  },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.65 },
  generation: { position: 'absolute', left: spacing.sm },
  line: { position: 'absolute', backgroundColor: colors.accentScience, opacity: 0.75 },
  notice: {
    padding: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
