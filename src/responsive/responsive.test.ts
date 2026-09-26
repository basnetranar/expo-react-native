import { classifyBreakpoint, responsive } from '@/responsive/responsive';

describe('responsive helpers', () => {
  test.each([
    [320, 'phone'],
    [767, 'phone'],
    [768, 'tablet'],
    [1023, 'tablet'],
    [1024, 'largeTablet'],
  ] as const)('classifies width %s as %s', (width, expected) => {
    expect(classifyBreakpoint(width)).toBe(expected);
  });

  it('falls back through missing responsive values', () => {
    expect(responsive({ phone: 16, tablet: 32 }, 'largeTablet')).toBe(32);
  });
});
