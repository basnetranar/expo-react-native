# Family Tree & Lineage Explorer

The explorer reads the active `SimulationSessionController`; it never creates or owns a simulation
engine. Entering the route acquires a nested read-only pause lease and leaving releases it. Opening
an Inspector above the tree acquires another lease, so returning to the tree cannot resume the world.

## Retention

`LineageRegistry` is an engine-independent, compact registry retained for the lifetime of the active
session. Every founder and birth stores only the stable ID, parent IDs, birth tick when known,
generation, inherited genome, and optional death metadata. Its explicit policy is
`active-session-unbounded`: records are not silently discarded because that would make ancestry
misleading. Mutable agents, memories, learned behaviours, and relationships are never retained in
the registry.

Founders have `birthTick: null` because the engine does not record their literal birth tick. Current
and deceased Inspector snapshots supply life state, learned behaviours, and actual recorded events
where available. A missing archived Inspector record remains a lineage node with an unavailable-detail
state; the UI does not invent that history.

## Relationship semantics

- Parent and child links use stable engine IDs.
- Full siblings share both known parent records; half siblings share exactly one.
- Ancestor and descendant traversal is breadth-first, deterministic, and cycle-safe.
- Path mode finds deterministic shortest recorded descent paths and flags when another shortest path
  exists.
- The focused tree renders two generations above and below plus siblings, capped at 32 nodes. The
  selected individual is always retained in the visible graph; selecting a branch recenters the data.

This slice deliberately does not add simulation mechanics, relationship inference, persistence across
app restarts, sex/gender assumptions, or speculative life events.
