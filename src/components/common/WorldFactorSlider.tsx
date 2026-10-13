import { useCallback, useMemo, useState } from 'react';
import {
  type AccessibilityActionEvent,
  PanResponder,
  type LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native';

import { AppText } from '@/components/common/AppText';
import { colors, radius, sizing, spacing } from '@/theme';

const thumbSize = 24;

export function clampSliderValue(value: number, min: number, max: number, step: number): number {
  const bounded = Math.max(min, Math.min(max, value));
  const snapped = min + Math.round((bounded - min) / step) * step;
  return Number(Math.max(min, Math.min(max, snapped)).toFixed(6));
}

export function sliderValueToRatio(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (Math.max(min, Math.min(max, value)) - min) / (max - min);
}

export function sliderPositionToValue(
  position: number,
  width: number,
  min: number,
  max: number,
  step: number,
): number {
  const ratio = width <= 0 ? 0 : Math.max(0, Math.min(1, position / width));
  return clampSliderValue(min + ratio * (max - min), min, max, step);
}

export function WorldFactorSlider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
}: Props) {
  const [trackWidth, setTrackWidth] = useState(0);
  const updateFromPosition = useCallback(
    (position: number) => {
      onValueChange(sliderPositionToValue(position, trackWidth, min, max, step));
    },
    [max, min, onValueChange, step, trackWidth],
  );
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => updateFromPosition(event.nativeEvent.locationX),
        onPanResponderMove: (event) => updateFromPosition(event.nativeEvent.locationX),
      }),
    [updateFromPosition],
  );
  const ratio = sliderValueToRatio(value, min, max);
  const onLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    setTrackWidth(width);
  };
  const onAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment')
      onValueChange(clampSliderValue(value + step, min, max, step));
    if (event.nativeEvent.actionName === 'decrement')
      onValueChange(clampSliderValue(value - step, min, max, step));
  };
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <AppText variant="label">{label}</AppText>
        <AppText variant="caption" selectable style={styles.value}>
          {value}
        </AppText>
      </View>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: `${value}` }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={onAccessibilityAction}
        onLayout={onLayout}
        style={styles.touchTarget}
        testID={`slider-${label.toLowerCase().replaceAll(' ', '-')}`}
        {...panResponder.panHandlers}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.thumb,
            { transform: [{ translateX: Math.max(0, trackWidth - thumbSize) * ratio }] },
          ]}
        />
      </View>
    </View>
  );
}

interface Props {
  label: string;
  value: number;
  onValueChange(value: number): void;
  min?: number;
  max?: number;
  step?: number;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  value: { color: colors.accentScience, fontVariant: ['tabular-nums'] },
  touchTarget: { height: sizing.minimumTouchTarget, justifyContent: 'center' },
  track: {
    height: 8,
    overflow: 'hidden',
    borderRadius: radius.full,
    backgroundColor: colors.surfaceStrong,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  fill: { height: '100%', backgroundColor: colors.accentScience },
  thumb: {
    position: 'absolute',
    left: 0,
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize / 2,
    backgroundColor: colors.accentDiscovery,
    borderWidth: 3,
    borderColor: colors.backgroundElevated,
  },
});
