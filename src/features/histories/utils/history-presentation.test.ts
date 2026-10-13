import type { EvolutionBranch } from '@/features/histories/types';
import {
  branchColor,
  branchPopulationSeries,
  formatBytes,
} from '@/features/histories/utils/history-presentation';

const branch = {
  id: 'b',
  generation: 4,
  population: 12,
  history: [{ generation: 3, population: 10 }],
} as EvolutionBranch;

describe('history presentation', () => {
  it('uses deterministic colors and actual recorded points', () => {
    expect(branchColor([branch], 'b')).toBe(branchColor([branch], 'b'));
    expect(branchPopulationSeries(branch)).toEqual([
      { generation: 3, population: 10 },
      { generation: 4, population: 12 },
    ]);
  });

  it('does not duplicate the current completed generation', () => {
    expect(branchPopulationSeries({ ...branch, generation: 3, population: 10 })).toHaveLength(1);
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });
});
