import { createLineageGraphLayout } from '@/features/lineage/utils/lineage-graph-layout';
import {
  createLineageIndex,
  getAncestors,
  getChildren,
  getDescendants,
  getLineagePath,
  getLineageTraitComparison,
  getParents,
  getSiblings,
} from '@/features/lineage/utils/lineage-selectors';
import type { LineageRecord } from '@/simulation';
import { genome } from '@/simulation/testing/fixtures';

function record(
  id: string,
  generation: number,
  parentIds: readonly string[] = [],
  value = 50,
): LineageRecord {
  return {
    id,
    parentIds,
    birthTick: generation * 40,
    birthGeneration: generation,
    genome: genome(value),
  };
}

const family = [
  record('a', 0),
  record('b', 0),
  record('c', 0),
  record('child', 1, ['a', 'b'], 60),
  record('full', 1, ['a', 'b']),
  record('half', 1, ['a', 'c']),
  record('grandchild', 2, ['child', 'full'], 70),
];

describe('lineage selectors', () => {
  const index = createLineageIndex(family);

  it('resolves parents, children, and full versus half siblings by stable ID', () => {
    expect(getParents(index, 'child').map(({ id }) => id)).toEqual(['a', 'b']);
    expect(getChildren(index, 'a').map(({ id }) => id)).toEqual(['child', 'full', 'half']);
    expect(getSiblings(index, 'child').full.map(({ id }) => id)).toEqual(['full']);
    expect(getSiblings(index, 'child').half.map(({ id }) => id)).toEqual(['half']);
  });

  it('traverses ancestors and descendants without duplicates', () => {
    expect(getAncestors(index, 'grandchild', 20).map(({ id }) => id)).toEqual([
      'child',
      'full',
      'a',
      'b',
    ]);
    expect(getDescendants(index, 'a', 20).map(({ id }) => id)).toEqual([
      'child',
      'full',
      'half',
      'grandchild',
    ]);
  });

  it('finds a deterministic shortest path and reports another valid path', () => {
    const path = getLineagePath(index, 'a', 'grandchild');
    expect(path?.path.map(({ id }) => id)).toEqual(['a', 'child', 'grandchild']);
    expect(path?.additionalPaths).toBe(1);
  });

  it('returns unavailable states for missing identifiers and disconnected branches', () => {
    expect(getParents(index, 'missing')).toEqual([]);
    expect(getLineagePath(index, 'a', 'missing')).toBeNull();
    expect(getLineagePath(index, 'c', 'grandchild')).toBeNull();
  });

  it('protects traversals from malformed cycles', () => {
    const cyclic = createLineageIndex([record('one', 1, ['two']), record('two', 2, ['one'])]);
    expect(getAncestors(cyclic, 'one', 100).map(({ id }) => id)).toEqual(['two']);
    expect(getDescendants(cyclic, 'one', 100).map(({ id }) => id)).toEqual(['two']);
    expect(getLineagePath(cyclic, 'one', 'two')?.path.map(({ id }) => id)).toEqual(['one', 'two']);
  });

  it('formats trait comparisons from stored inherited genomes', () => {
    expect(getLineageTraitComparison(index, ['a', 'child', 'grandchild'], 'curiosity')).toEqual([
      { id: 'a', generation: 0, value: 50 },
      { id: 'child', generation: 1, value: 60 },
      { id: 'grandchild', generation: 2, value: 70 },
    ]);
  });

  it('lays out the same graph deterministically and keeps the selected person visible', () => {
    const large = Array.from({ length: 40 }, (_, position) =>
      record(`child-${position.toString().padStart(2, '0')}`, 1, ['a', 'b']),
    );
    const largeIndex = createLineageIndex([...family, ...large]);
    const first = createLineageGraphLayout(largeIndex, 'a');
    expect(first).toEqual(createLineageGraphLayout(largeIndex, 'a'));
    expect(first.nodes).toHaveLength(32);
    expect(first.nodes.some(({ id }) => id === 'a')).toBe(true);
    expect(first.truncated).toBe(true);
  });

  it('bounds rendering for a lineage containing thousands of descendants', () => {
    const records = [
      record('founder', 0),
      ...Array.from({ length: 5_000 }, (_, position) =>
        record(`descendant-${position.toString().padStart(4, '0')}`, 1, ['founder']),
      ),
    ];
    const started = performance.now();
    const largeIndex = createLineageIndex(records);
    const layout = createLineageGraphLayout(largeIndex, 'founder');
    const elapsed = performance.now() - started;
    expect(layout.nodes).toHaveLength(32);
    expect(layout.truncated).toBe(true);
    expect(elapsed).toBeLessThan(1_000);
  });
});
