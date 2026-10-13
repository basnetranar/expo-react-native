import type { Hominin, LineageRecord, LineageRegistrySnapshot } from '@/simulation/engine/types';

/**
 * Compact ancestry retained for the lifetime of an active simulation session.
 * It is intentionally unbounded: silently pruning records would make biological
 * relationships misleading. No mutable agents, memories, or relationships are retained.
 */
export class LineageRegistry {
  private readonly records = new Map<string, LineageRecord>();

  recordFounder(agent: Hominin): void {
    this.recordBirth(agent, null);
  }

  recordBirth(agent: Hominin, birthTick: number | null): void {
    if (this.records.has(agent.id)) return;
    this.records.set(agent.id, {
      id: agent.id,
      parentIds: [...agent.parents],
      birthTick,
      birthGeneration: agent.generation,
      genome: { ...agent.genome },
    });
  }

  recordDeath(agent: Hominin): void {
    const existing = this.records.get(agent.id);
    if (!existing || !agent.death) return;
    this.records.set(agent.id, {
      ...existing,
      deathTick: agent.death.tick,
      deathCause: agent.death.cause,
    });
  }

  snapshot(currentTick: number, currentGeneration: number): LineageRegistrySnapshot {
    return {
      currentTick,
      currentGeneration,
      records: [...this.records.values()]
        .sort((first, second) => first.id.localeCompare(second.id))
        .map(cloneRecord),
      retention: { policy: 'active-session-unbounded', recordsDiscarded: 0 },
    };
  }

  exportState(): LineageRegistryState {
    return { records: [...this.records.values()].map(cloneRecord) };
  }

  restoreState(state: LineageRegistryState): void {
    this.records.clear();
    for (const record of state.records) this.records.set(record.id, cloneRecord(record));
  }
}

export interface LineageRegistryState {
  records: LineageRecord[];
}

function cloneRecord(record: LineageRecord): LineageRecord {
  return { ...record, parentIds: [...record.parentIds], genome: { ...record.genome } };
}
