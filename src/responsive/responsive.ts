import { breakpoints } from '@/responsive/breakpoints';
import type { Breakpoint, ResponsiveValues } from '@/responsive/types';

export function classifyBreakpoint(width: number): Breakpoint {
  if (width >= breakpoints.largeTablet) return 'largeTablet';
  if (width >= breakpoints.tablet) return 'tablet';
  return 'phone';
}

export function responsive<T>(values: ResponsiveValues<T>, breakpoint: Breakpoint): T {
  if (breakpoint === 'largeTablet') return values.largeTablet ?? values.tablet ?? values.phone;
  if (breakpoint === 'tablet') return values.tablet ?? values.phone;
  return values.phone;
}
