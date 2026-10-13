# Experiments & Environmental Interventions

This vertical slice operates on the one active `SimulationSessionController`. Opening the route does
not create, pause, clone, or reset an engine. If the session is already paused, scheduled work waits;
if it is running, a command becomes active on the next simulation tick.

## Engine model

- `EnvironmentInterventionManager` owns deterministic monotonic IDs and lifecycle state.
- Baselines come from the configured world: base food regeneration, water regeneration, and predator
  count. Scenario modifiers remain a separate layer.
- Active intervention factors multiply the baseline and scenario layers. Contributions are sorted by
  numeric value before multiplication, then clamped to `0.25...2.0`, so results do not depend on
  intervention array order.
- Food availability scales future soft and hard food regeneration. Water availability scales future
  replenishment without rewriting source capacities. Predator pressure scales the existing attack
  probability without adding or removing predators.
- Drought contributes fixed food `×0.65` and water `×0.40` factors.
- Temporary durations are simulation ticks. The UI converts generation choices with the engine's
  configured fixed `ticksPerGeneration`; indefinite interventions have a `null` duration.
- Cancellation and expiration recalculate all remaining layers and restore the correct baseline.

## Records and presentation

Lifecycle events are added to the bounded Evolution History recorder and appear as environmental
milestones. The intervention manager also retains scheduled/active records plus a bounded terminal
history; when older terminal records are discarded, the snapshot exposes the count.

Population response charts contain completed-generation measurements only. They do not forecast or
claim causation. The Savannah preview is static artwork labelled with current engine values.

Presets only populate local draft controls. Apply submits the validated batch atomically, and both the
hook and controller reject repeated identical submissions at the same tick.
