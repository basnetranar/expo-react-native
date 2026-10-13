import type { LineageIndex, LineagePathResult } from '@/features/lineage/types';
import type { LineageRecord, TraitName } from '@/simulation';

export function createLineageIndex(records: readonly LineageRecord[]): LineageIndex {
  const byId = new Map(records.map((record) => [record.id, record]));
  const children = new Map<string, string[]>();
  for (const record of records) {
    for (const parentId of record.parentIds) {
      const current = children.get(parentId) ?? [];
      current.push(record.id);
      children.set(parentId, current);
    }
  }
  for (const ids of children.values()) ids.sort((a, b) => a.localeCompare(b));
  return { records: byId, childrenByParent: children };
}

export function getParents(index: LineageIndex, id: string): LineageRecord[] {
  const record = index.records.get(id);
  return record ? compactRecords(index, record.parentIds) : [];
}

export function getChildren(index: LineageIndex, id: string): LineageRecord[] {
  return compactRecords(index, index.childrenByParent.get(id) ?? []);
}

export function getSiblings(index: LineageIndex, id: string) {
  const record = index.records.get(id);
  if (!record) return { full: [], half: [] };
  const knownParents = record.parentIds.filter((parentId) => index.records.has(parentId));
  if (!knownParents.length) return { full: [], half: [] };
  const candidates = new Set(
    knownParents.flatMap((parentId) => index.childrenByParent.get(parentId) ?? []),
  );
  candidates.delete(id);
  const full: LineageRecord[] = [];
  const half: LineageRecord[] = [];
  for (const candidate of compactRecords(index, [...candidates])) {
    const candidateParents = candidate.parentIds.filter((parentId) => index.records.has(parentId));
    const shared = knownParents.filter((parentId) => candidateParents.includes(parentId)).length;
    const bothFullyRecorded = knownParents.length === 2 && candidateParents.length === 2;
    if (shared === 2 && bothFullyRecorded) full.push(candidate);
    else if (shared === 1) half.push(candidate);
  }
  return { full, half };
}

export function getAncestors(index: LineageIndex, id: string, depth: number): LineageRecord[] {
  return traverse(
    index,
    id,
    depth,
    (candidateId) => index.records.get(candidateId)?.parentIds ?? [],
  );
}

export function getDescendants(index: LineageIndex, id: string, depth: number): LineageRecord[] {
  return traverse(index, id, depth, (candidateId) => index.childrenByParent.get(candidateId) ?? []);
}

export function getLineagePath(
  index: LineageIndex,
  ancestorId: string,
  descendantId: string,
): LineagePathResult | null {
  if (!index.records.has(ancestorId) || !index.records.has(descendantId)) return null;
  const queue: string[][] = [[ancestorId]];
  const found: string[][] = [];
  let shortest = Number.POSITIVE_INFINITY;
  while (queue.length && found.length < 2) {
    const path = queue.shift()!;
    if (path.length > shortest) continue;
    const current = path.at(-1)!;
    if (current === descendantId) {
      shortest = path.length;
      found.push(path);
      continue;
    }
    for (const childId of index.childrenByParent.get(current) ?? []) {
      if (!path.includes(childId)) queue.push([...path, childId]);
    }
  }
  if (!found.length) return null;
  return {
    path: compactRecords(index, found[0]!),
    additionalPaths: Math.max(0, found.length - 1),
  };
}

export function getLineageTraitComparison(
  index: LineageIndex,
  ids: readonly string[],
  trait: TraitName,
) {
  return compactRecords(index, ids).map((record) => ({
    id: record.id,
    generation: record.birthGeneration,
    value: record.genome[trait],
  }));
}

function traverse(
  index: LineageIndex,
  startId: string,
  depth: number,
  next: (id: string) => readonly string[],
): LineageRecord[] {
  const visited = new Set([startId]);
  const result: LineageRecord[] = [];
  let frontier = [startId];
  for (let level = 0; level < Math.max(0, depth); level += 1) {
    const following: string[] = [];
    for (const current of frontier) {
      for (const candidateId of [...next(current)].sort((a, b) => a.localeCompare(b))) {
        if (visited.has(candidateId)) continue;
        visited.add(candidateId);
        const record = index.records.get(candidateId);
        if (!record) continue;
        result.push(record);
        following.push(candidateId);
      }
    }
    frontier = following;
    if (!frontier.length) break;
  }
  return result;
}

function compactRecords(index: LineageIndex, ids: readonly string[]): LineageRecord[] {
  return ids
    .map((id) => index.records.get(id))
    .filter((record): record is LineageRecord => Boolean(record))
    .sort(
      (first, second) =>
        first.birthGeneration - second.birthGeneration || first.id.localeCompare(second.id),
    );
}
