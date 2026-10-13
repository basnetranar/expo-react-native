import type { LineageGraphLayout, LineageIndex } from '@/features/lineage/types';
import {
  getAncestors,
  getDescendants,
  getSiblings,
} from '@/features/lineage/utils/lineage-selectors';

const nodeWidth = 96;
const nodeHeight = 118;
const horizontalGap = 30;
const verticalGap = 58;
const labelGutter = 100;
const padding = 20;
const maximumVisibleNodes = 32;

export function createLineageGraphLayout(
  index: LineageIndex,
  selectedId: string,
  ancestorDepth = 2,
  descendantDepth = 2,
): LineageGraphLayout {
  const selected = index.records.get(selectedId);
  if (!selected)
    return { width: 320, height: 240, nodes: [], edges: [], generations: [], truncated: false };
  const siblings = getSiblings(index, selectedId);
  const requested = [
    ...getAncestors(index, selectedId, ancestorDepth),
    ...siblings.full,
    ...siblings.half,
    selected,
    ...getDescendants(index, selectedId, descendantDepth),
  ];
  const unique = new Map(requested.map((record) => [record.id, record]));
  const ordered = [...unique.values()].sort(
    (first, second) =>
      first.birthGeneration - second.birthGeneration || first.id.localeCompare(second.id),
  );
  const visible = ordered.slice(0, maximumVisibleNodes);
  if (!visible.some((record) => record.id === selectedId)) {
    visible[visible.length - 1] = selected;
    visible.sort(
      (first, second) =>
        first.birthGeneration - second.birthGeneration || first.id.localeCompare(second.id),
    );
  }
  const rows = new Map<number, typeof visible>();
  for (const record of visible) {
    const row = rows.get(record.birthGeneration) ?? [];
    row.push(record);
    rows.set(record.birthGeneration, row);
  }
  const generations = [...rows.keys()].sort((a, b) => a - b);
  const largestRow = Math.max(1, ...[...rows.values()].map((row) => row.length));
  const contentWidth = largestRow * (nodeWidth + horizontalGap) - horizontalGap;
  const width = labelGutter + contentWidth + padding * 2;
  const nodes = generations.flatMap((generation, rowIndex) => {
    const row = rows.get(generation)!;
    const rowWidth = row.length * (nodeWidth + horizontalGap) - horizontalGap;
    const offset = labelGutter + padding + (contentWidth - rowWidth) / 2;
    return row.map((record, columnIndex) => ({
      id: record.id,
      generation,
      x: offset + columnIndex * (nodeWidth + horizontalGap),
      y: padding + rowIndex * (nodeHeight + verticalGap),
    }));
  });
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const edges = visible.flatMap((child) =>
    child.parentIds.flatMap((parentId) => {
      const parent = nodeById.get(parentId);
      const childNode = nodeById.get(child.id);
      return parent && childNode
        ? [
            {
              id: `${parentId}-${child.id}`,
              parentId,
              childId: child.id,
              x1: parent.x + nodeWidth / 2,
              y1: parent.y + nodeHeight,
              x2: childNode.x + nodeWidth / 2,
              y2: childNode.y,
            },
          ]
        : [];
    }),
  );
  return {
    width,
    height:
      padding * 2 +
      generations.length * nodeHeight +
      Math.max(0, generations.length - 1) * verticalGap,
    nodes,
    edges,
    generations,
    truncated: ordered.length > visible.length,
  };
}

export const lineageNodeSize = { width: nodeWidth, height: nodeHeight } as const;
