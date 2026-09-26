import { Children, type PropsWithChildren, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useResponsiveLayout } from '@/responsive/useResponsiveLayout';
import { spacing, type SpacingToken } from '@/theme';

interface Props {
  phoneColumns?: number;
  tabletColumns?: number;
  largeTabletColumns?: number;
  gap?: SpacingToken;
}

export function ResponsiveGrid({
  children,
  phoneColumns = 2,
  tabletColumns = 3,
  largeTabletColumns = 4,
  gap = 'md',
}: PropsWithChildren<Props>) {
  const { isTablet, isLargeTablet } = useResponsiveLayout();
  const [width, setWidth] = useState(0);
  const columns = isLargeTablet ? largeTabletColumns : isTablet ? tabletColumns : phoneColumns;
  const gapSize = spacing[gap];
  const itemWidth = width > 0 ? (width - gapSize * (columns - 1)) / columns : 0;

  return (
    <View
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.grid, { gap: gapSize }]}
    >
      {Children.map(children, (child) => (
        <View style={{ width: itemWidth }}>{child}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap' },
});
