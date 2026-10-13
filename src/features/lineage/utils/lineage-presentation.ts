import type {
  FamilyTreeViewModel,
  IndividualLineage,
  LineagePerson,
} from '@/features/lineage/types';
import { createLineageGraphLayout } from '@/features/lineage/utils/lineage-graph-layout';
import {
  createLineageIndex,
  getAncestors,
  getChildren,
  getDescendants,
  getParents,
  getSiblings,
} from '@/features/lineage/utils/lineage-selectors';
import { getFriendlyName, stableHash } from '@/features/simulation/utils/friendly-name';
import type {
  AgentInspectorSnapshot,
  LineageRecord,
  LineageRegistrySnapshot,
  TraitName,
} from '@/simulation';

type InspectorResolver = (id: string) => AgentInspectorSnapshot | null;

export const lineageTraitNames: readonly TraitName[] = [
  'strength',
  'speed',
  'endurance',
  'dexterity',
  'vision',
  'metabolicEfficiency',
  'memoryPotential',
  'learningAbility',
  'socialSensitivity',
  'curiosity',
];

export function createFamilyTreeViewModel(
  snapshot: LineageRegistrySnapshot,
  requestedId: string | undefined,
  resolveInspector: InspectorResolver,
): FamilyTreeViewModel | null {
  if (!snapshot.records.length) return null;
  const index = createLineageIndex(snapshot.records);
  const fallback =
    snapshot.records.find((record) => resolveInspector(record.id)?.alive) ?? snapshot.records[0]!;
  const selectedRecord = (requestedId && index.records.get(requestedId)) || fallback;
  const siblings = getSiblings(index, selectedRecord.id);
  const children = getChildren(index, selectedRecord.id);
  const lineage: IndividualLineage = {
    individual: selectedRecord,
    parents: getParents(index, selectedRecord.id),
    missingParentIds: selectedRecord.parentIds.filter((id) => !index.records.has(id)),
    siblings,
    children,
    grandchildren: children.flatMap((child) => getChildren(index, child.id)),
    ancestors: getAncestors(index, selectedRecord.id, snapshot.records.length),
    descendants: getDescendants(index, selectedRecord.id, snapshot.records.length),
  };
  const people = new Map<string, LineagePerson>();
  for (const record of snapshot.records)
    people.set(record.id, createPerson(record, resolveInspector));
  const generations = new Set(
    [selectedRecord, ...lineage.ancestors, ...lineage.descendants].map(
      (record) => record.birthGeneration,
    ),
  );
  return {
    selected: people.get(selectedRecord.id)!,
    lineage,
    graph: createLineageGraphLayout(index, selectedRecord.id),
    people,
    statistics: {
      recordedParents: lineage.parents.length,
      missingParents: lineage.missingParentIds.length,
      fullSiblings: siblings.full.length,
      halfSiblings: siblings.half.length,
      children: children.length,
      grandchildren: lineage.grandchildren.length,
      knownAncestors: lineage.ancestors.length,
      knownDescendants: lineage.descendants.length,
      generationsRepresented: generations.size,
    },
    traitNames: lineageTraitNames,
  };
}

function createPerson(record: LineageRecord, resolve: InspectorResolver): LineagePerson {
  const inspector = resolve(record.id);
  return {
    record,
    name: getFriendlyName(record.id),
    alive: inspector?.alive ?? record.deathTick === undefined,
    inspector,
    portraitVariant: stableHash(record.id) % 2,
  };
}
