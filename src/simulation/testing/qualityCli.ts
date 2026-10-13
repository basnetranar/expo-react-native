import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface LatencyDistribution {
  samples: number;
  mean: number;
  median: number;
  p95: number;
  maximum: number;
}

export function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
}

export function integerArgument(name: string, fallback: number): number {
  const value = Number.parseInt(argument(name, String(fallback)), 10);
  if (!Number.isSafeInteger(value) || value < 1) throw new Error(`--${name} must be positive.`);
  return value;
}

export function listArgument(name: string, fallback: readonly number[]): number[] {
  return argument(name, fallback.join(','))
    .split(',')
    .map((value) => Number.parseInt(value.trim(), 10))
    .filter((value) => Number.isSafeInteger(value) && value > 0);
}

export function latencyDistribution(values: readonly number[]): LatencyDistribution {
  const sorted = [...values].sort((first, second) => first - second);
  const percentile = (proportion: number) =>
    sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * proportion))] ?? 0;
  const rounded = (value: number) => Number(value.toFixed(3));
  return {
    samples: sorted.length,
    mean: rounded(sorted.reduce((sum, value) => sum + value, 0) / Math.max(1, sorted.length)),
    median: rounded(percentile(0.5)),
    p95: rounded(percentile(0.95)),
    maximum: rounded(sorted.at(-1) ?? 0),
  };
}

export function timed<T>(operation: () => T): { value: T; milliseconds: number } {
  const started = performance.now();
  const value = operation();
  return { value, milliseconds: performance.now() - started };
}

export function writeQualityReport(
  name: string,
  data: unknown,
  markdown: string,
  outputDirectory = argument('output', 'simulation-output/slice-8'),
): void {
  const directory = resolve(outputDirectory);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, `${name}.json`), `${JSON.stringify(data, null, 2)}\n`);
  writeFileSync(resolve(directory, `${name}.md`), `${markdown.trim()}\n`);
  console.log(`Wrote ${resolve(directory, `${name}.json`)}`);
  console.log(`Wrote ${resolve(directory, `${name}.md`)}`);
}

export function markdownTable(headers: readonly string[], rows: readonly (readonly unknown[])[]) {
  const row = (values: readonly unknown[]) => `| ${values.join(' | ')} |`;
  return [row(headers), row(headers.map(() => '---')), ...rows.map(row)].join('\n');
}
