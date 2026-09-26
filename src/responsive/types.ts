export type Breakpoint = 'phone' | 'tablet' | 'largeTablet';
export type Orientation = 'portrait' | 'landscape';

export interface ResponsiveLayout {
  width: number;
  height: number;
  isPhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  isPortrait: boolean;
  isLandscape: boolean;
  orientation: Orientation;
  breakpoint: Breakpoint;
}

export interface ResponsiveValues<T> {
  phone: T;
  tablet?: T;
  largeTablet?: T;
}
