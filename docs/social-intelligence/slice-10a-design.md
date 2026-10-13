# Slice 10A design

## Audit findings

The engine already had bounded per-agent memories, local spatial perception, unilateral relationship
records, biological parent/child identifiers, follow/observe behaviours, imitation, learned social
foraging, deterministic RNG, bounded event history, complete checkpoints, branch cloning, and a
read-only Hominin Inspector. It did not have affinity, interaction timestamps or counts, groups,
carried food, social actions, social events, or social projections.

Slice 10A extends those systems. There is no second engine, relationship store, family model, or
React Native simulation state. Social screens read presentation-safe snapshots from the active
`SimulationSessionController`; entering any social route pauses a running session and leaving the
last social route resumes it only if it was previously running.

## Modules

- `simulation/social/SocialSystem.ts`: deterministic encounters, relationship changes, group
  lifecycle, events, and analytics.
- Existing behaviour engine: scores and executes cooperative foraging, sharing, and grooming.
- Existing bounded memory: stores social subjects using the normal capacity and decay rules.
- Existing history recorder: bounds social events with all other engine events.
- Existing checkpoint: contains group state and counters; additive migration supplies defaults for
  pre-Slice-10A checkpoints.
- `features/social`: read-only adapter, responsive screens, navigation, activity filters, and
  relationship explorer.

## UI and navigation

Routes are `/social`, `/social/group/[id]`, `/social/relationships/[id]`, `/social/activity`, and
`/social/insights`. Phone layouts scroll in one column. Tablet layouts use wide heroes and
side-by-side panels. The relationship explorer uses touchable native views and bounded connection
cards rather than rendering all-pair lines. Group names are deterministic labels derived from
stable IDs; no fictional settlements or leaders are introduced.

The supplied assets were inspected before use. `social-group-foraging.png` and
`social-food-sharing.png` are RGBA; `social-group-hero.png` and `social-grooming.png` are opaque RGB.
Illustrations are decorative and never create or imply an engine event.
