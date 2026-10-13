import type { AgentInspectorSnapshot, Genome, LineageRecord, TraitName } from '@/simulation';

export interface LineageIndex {
  records: ReadonlyMap<string, LineageRecord>;
  childrenByParent: ReadonlyMap<string, readonly string[]>;
}

export interface SiblingGroups {
  full: readonly LineageRecord[];
  half: readonly LineageRecord[];
}

export interface IndividualLineage {
  individual: LineageRecord;
  parents: readonly LineageRecord[];
  missingParentIds: readonly string[];
  siblings: SiblingGroups;
  children: readonly LineageRecord[];
  grandchildren: readonly LineageRecord[];
  ancestors: readonly LineageRecord[];
  descendants: readonly LineageRecord[];
}

export interface LineageTraitValue {
  id: string;
  generation: number;
  value: number;
}

export interface LineagePathResult {
  path: readonly LineageRecord[];
  additionalPaths: number;
}

export interface LineageGraphNode {
  id: string;
  generation: number;
  x: number;
  y: number;
}

export interface LineageGraphEdge {
  id: string;
  parentId: string;
  childId: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LineageGraphLayout {
  width: number;
  height: number;
  nodes: readonly LineageGraphNode[];
  edges: readonly LineageGraphEdge[];
  generations: readonly number[];
  truncated: boolean;
}

export interface LineagePerson {
  record: LineageRecord;
  name: string;
  alive: boolean;
  inspector: AgentInspectorSnapshot | null;
  portraitVariant: number;
}

export interface FamilyStatistics {
  recordedParents: number;
  missingParents: number;
  fullSiblings: number;
  halfSiblings: number;
  children: number;
  grandchildren: number;
  knownAncestors: number;
  knownDescendants: number;
  generationsRepresented: number;
}

export interface FamilyTreeViewModel {
  selected: LineagePerson;
  lineage: IndividualLineage;
  graph: LineageGraphLayout;
  people: ReadonlyMap<string, LineagePerson>;
  statistics: FamilyStatistics;
  traitNames: readonly TraitName[];
}

export interface LineageTraitComparison {
  trait: TraitName;
  values: readonly LineageTraitValue[];
  genomes: ReadonlyMap<string, Genome>;
}
