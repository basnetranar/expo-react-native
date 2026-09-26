import { useWindowDimensions } from 'react-native';

import { classifyBreakpoint } from '@/responsive/responsive';
import type { ResponsiveLayout } from '@/responsive/types';

export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const breakpoint = classifyBreakpoint(width);
  const isPortrait = height >= width;
  return {
    width,
    height,
    breakpoint,
    isPhone: breakpoint === 'phone',
    isTablet: breakpoint !== 'phone',
    isLargeTablet: breakpoint === 'largeTablet',
    isPortrait,
    isLandscape: !isPortrait,
    orientation: isPortrait ? 'portrait' : 'landscape',
  };
}
