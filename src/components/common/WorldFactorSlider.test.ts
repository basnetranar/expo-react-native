import {
  clampSliderValue,
  sliderPositionToValue,
  sliderValueToRatio,
} from '@/components/common/WorldFactorSlider';

describe('WorldFactorSlider value mapping', () => {
  it('keeps displayed values and thumb positions synchronized', () => {
    expect(sliderValueToRatio(50, 0, 100)).toBe(0.5);
    expect(sliderPositionToValue(150, 300, 0, 100, 1)).toBe(50);
    expect(sliderPositionToValue(300, 300, 8, 60, 1)).toBe(60);
  });

  it('clamps and snaps values for touch and accessibility changes', () => {
    expect(clampSliderValue(61, 8, 60, 1)).toBe(60);
    expect(clampSliderValue(17, 0, 100, 5)).toBe(15);
    expect(sliderPositionToValue(-20, 200, 0, 100, 1)).toBe(0);
  });
});
