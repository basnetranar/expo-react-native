import type { EvolutionBranch } from '@/features/histories/types';

export const branchPalette = ['#F3B74F', '#42B9EE', '#63D49B', '#E96D67', '#B38CF2'] as const;

export function branchColor(branches: readonly EvolutionBranch[], id: string): string {
  const index = Math.max(
    0,
    branches.findIndex((branch) => branch.id === id),
  );
  return branchPalette[index % branchPalette.length]!;
}

export function branchPopulationSeries(branch: EvolutionBranch) {
  const completed = branch.history.map((summary) => ({
    generation: summary.generation,
    population: summary.population,
  }));
  const latest = { generation: branch.generation, population: branch.population };
  return completed.at(-1)?.generation === latest.generation ? completed : [...completed, latest];
}

export function formatBytes(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
