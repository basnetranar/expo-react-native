function hashSeed(seed: string | number): number {
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export class SeededRng {
  private state: number;
  private spareNormal: number | null = null;

  constructor(seed: string | number) {
    this.state = hashSeed(seed) || 0x6d2b79f5;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let value = this.state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    if (max < min) throw new RangeError('max must be greater than or equal to min');
    return min + this.next() * (max - min);
  }

  integer(min: number, max: number): number {
    if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
      throw new RangeError('integer bounds must be integers with max >= min');
    }
    return Math.floor(this.range(min, max + 1));
  }

  normal(mean = 0, standardDeviation = 1): number {
    if (standardDeviation < 0) throw new RangeError('standardDeviation must be non-negative');
    if (this.spareNormal !== null) {
      const value = this.spareNormal;
      this.spareNormal = null;
      return mean + value * standardDeviation;
    }
    const first = Math.max(this.next(), Number.EPSILON);
    const second = this.next();
    const magnitude = Math.sqrt(-2 * Math.log(first));
    const angle = 2 * Math.PI * second;
    this.spareNormal = magnitude * Math.sin(angle);
    return mean + magnitude * Math.cos(angle) * standardDeviation;
  }

  chance(probability: number): boolean {
    return this.next() < Math.max(0, Math.min(1, probability));
  }

  pick<T>(values: readonly T[]): T {
    if (values.length === 0) throw new RangeError('Cannot pick from an empty collection');
    return values[this.integer(0, values.length - 1)]!;
  }

  exportState(): SeededRngState {
    return { state: this.state, spareNormal: this.spareNormal };
  }

  restoreState(snapshot: SeededRngState): void {
    if (!Number.isInteger(snapshot.state) || snapshot.state < 0 || snapshot.state > 0xffffffff)
      throw new Error('Invalid RNG state.');
    if (snapshot.spareNormal !== null && !Number.isFinite(snapshot.spareNormal))
      throw new Error('Invalid RNG normal-cache state.');
    this.state = snapshot.state;
    this.spareNormal = snapshot.spareNormal;
  }
}

export interface SeededRngState {
  state: number;
  spareNormal: number | null;
}
