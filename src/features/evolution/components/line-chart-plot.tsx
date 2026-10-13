import { useMemo, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';

export interface LinePlotPoint {
  generation: number;
  value: number;
  critical?: boolean;
}

const stepWidth = 52;
const plotHeight = 136;
const topInset = 40;

export function LineChartPlot({
  points,
  maximum,
  selectedGeneration = null,
  onSelect,
  formatValue = (value) => String(Math.round(value)),
  accent = colors.accentScience,
}: {
  points: readonly LinePlotPoint[];
  maximum?: number;
  selectedGeneration?: number | null;
  onSelect?(generation: number): void;
  formatValue?(value: number): string;
  accent?: string;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const ceiling = maximum ?? Math.max(1, ...points.map((point) => point.value));
  const geometry = useMemo(
    () =>
      points.map((point, index) => ({
        ...point,
        x: index * stepWidth + stepWidth / 2,
        y: topInset + plotHeight - (point.value / Math.max(ceiling, 1)) * plotHeight,
      })),
    [ceiling, points],
  );
  const width = Math.max(320, points.length * stepWidth);

  return (
    <View style={styles.frame}>
      <View style={styles.scale}>
        <AppText variant="caption">{formatValue(ceiling)}</AppText>
        <AppText variant="caption">0</AppText>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
      >
        <View style={[styles.plot, { width }]}>
          <View style={[styles.gridLine, { top: topInset }]} />
          <View style={[styles.gridLine, { top: topInset + plotHeight / 2 }]} />
          <View style={[styles.gridLine, { top: topInset + plotHeight }]} />
          {geometry.slice(1).map((point, index) => {
            const previous = geometry[index]!;
            const deltaX = point.x - previous.x;
            const deltaY = point.y - previous.y;
            const length = Math.sqrt(deltaX ** 2 + deltaY ** 2);
            const angle = `${Math.atan2(deltaY, deltaX)}rad`;
            return (
              <View
                key={`line-${point.generation}`}
                style={[
                  styles.line,
                  {
                    width: length,
                    left: (previous.x + point.x) / 2 - length / 2,
                    top: (previous.y + point.y) / 2 - 1,
                    backgroundColor: accent,
                    transform: [{ rotate: angle }],
                  },
                ]}
              />
            );
          })}
          {geometry.map((point) => {
            const selected = point.generation === selectedGeneration;
            return (
              <Pressable
                key={point.generation}
                accessibilityRole={onSelect ? 'button' : undefined}
                accessibilityLabel={`Generation ${point.generation}, value ${formatValue(point.value)}`}
                accessibilityState={{ selected }}
                disabled={!onSelect}
                onPress={() => onSelect?.(point.generation)}
                style={[styles.hitArea, { left: point.x - stepWidth / 2 }]}
              >
                {selected ? (
                  <View style={[styles.tooltip, { top: Math.max(0, point.y - 35) }]}>
                    <AppText variant="caption" style={styles.tooltipText}>
                      G{point.generation} · {formatValue(point.value)}
                    </AppText>
                  </View>
                ) : null}
                <View
                  style={[
                    styles.dot,
                    {
                      top: point.y - 5,
                      backgroundColor: point.critical ? colors.accentDanger : accent,
                    },
                    selected && styles.selectedDot,
                  ]}
                />
                <AppText
                  variant="caption"
                  style={[styles.axisLabel, selected && styles.selectedLabel]}
                >
                  G{point.generation}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 214, flexDirection: 'row', gap: spacing.sm },
  scale: { height: topInset + plotHeight, justifyContent: 'space-between', paddingTop: topInset },
  plot: { minWidth: '100%', height: 214, position: 'relative' },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  line: { position: 'absolute', height: 2, borderRadius: 1 },
  hitArea: { position: 'absolute', top: 0, width: stepWidth, height: 214, alignItems: 'center' },
  dot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.background,
  },
  selectedDot: { width: 15, height: 15, borderRadius: 8, borderColor: colors.textPrimary },
  tooltip: {
    position: 'absolute',
    minWidth: 68,
    alignItems: 'center',
    padding: spacing.xs,
    borderRadius: radius.sm,
    borderCurve: 'continuous',
    backgroundColor: colors.surfaceStrong,
  },
  tooltipText: { color: colors.accentDiscovery, fontWeight: '800' },
  axisLabel: { position: 'absolute', top: topInset + plotHeight + spacing.sm },
  selectedLabel: { color: colors.accentDiscovery, fontWeight: '800' },
});
