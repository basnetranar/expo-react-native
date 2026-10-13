import { SeededRng } from '@/simulation/engine/seededRng';

describe('SeededRng', () => {
  it('repeats the exact sequence for string seeds', () => {
    const first = new SeededRng('FIRST-MINDS-001');
    const second = new SeededRng('FIRST-MINDS-001');
    expect(Array.from({ length: 100 }, () => first.next())).toEqual(
      Array.from({ length: 100 }, () => second.next()),
    );
  });

  it('supports deterministic number seeds and divergent seeds', () => {
    const first = new SeededRng(42);
    const repeat = new SeededRng(42);
    const other = new SeededRng(43);
    expect(first.next()).toBe(repeat.next());
    expect(first.next()).not.toBe(other.next());
  });

  it('keeps ranges and inclusive integers within bounds', () => {
    const rng = new SeededRng('bounds');
    const ranges = Array.from({ length: 500 }, () => rng.range(-3, 7));
    const integers = Array.from({ length: 500 }, () => rng.integer(2, 5));
    expect(ranges.every((value) => value >= -3 && value < 7)).toBe(true);
    expect(integers.every((value) => Number.isInteger(value) && value >= 2 && value <= 5)).toBe(
      true,
    );
    expect(new Set(integers)).toEqual(new Set([2, 3, 4, 5]));
  });

  it('produces a stable normal distribution near the requested moments', () => {
    const rng = new SeededRng('normal');
    const values = Array.from({ length: 20_000 }, () => rng.normal(50, 8));
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
    expect(mean).toBeCloseTo(50, 0);
    expect(Math.sqrt(variance)).toBeCloseTo(8, 0);
  });

  it('handles probability edges without consuming unsafe randomness', () => {
    const rng = new SeededRng('chance');
    expect(rng.chance(0)).toBe(false);
    expect(rng.chance(-1)).toBe(false);
    expect(rng.chance(1)).toBe(true);
    expect(rng.chance(2)).toBe(true);
  });
});
