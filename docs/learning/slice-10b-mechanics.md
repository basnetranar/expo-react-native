# Slice 10B learning mechanics

## Behaviour registry

The central registry contains only mechanics the engine can execute:

- `stoneCracking`: tool-use behaviour requiring hard food and stone resources.
- `socialForaging`: foraging behaviour learned through real follow/cooperative-foraging activity.

Definitions provide category, description, base difficulty, observability, trait influences, and
resource requirements. Fire, spears, containers, advanced plant processing, settlements, language,
and agriculture are deliberately absent.

## Knowledge states and experimentation

An individual can have no record, a recorded observation opportunity, an attempted opportunity, or
an acquired `LearnedBehaviour`. Acquired records store proficiency (0–100), practice/success/failure
counts, first-learned and last-practiced ticks, acquisition source, and the source agent when known.

Stone cracking retains the existing environment-first discovery path: a living hominin must reach
hard food with suitable stone resources and pay the existing action costs. The seeded success check
uses the existing learning, curiosity, memory, and dexterity influences. It is not generation-gated.
Separate individuals and groups can discover it independently.

## Observation and imitation

Observation queries the existing spatial index within radius two and considers at most six
stable-ID-sorted candidates. Both participants must be alive, the teacher must have actually used or
successfully demonstrated the behaviour, and the learner must be in `observe` or `follow` rather
than a critical survival action. Learners below energy/hydration 24 or safety 38 do not engage.
Behaviour-specific resources must be present.

Vision, curiosity, social sensitivity, learning ability, relationship familiarity/trust, distance,
and prior observations contribute to the seeded observation/attempt checks. Observation creates a
bounded learning opportunity, never mastery. An imitation attempt can fail. Repeated evidence can
improve its chance, but resource requirements and survival gates always remain in force.

## Practice and proficiency

Proficiency changes only after an actual relevant action outcome. Success increases it according to
learning ability, memory potential, dexterity where relevant, task difficulty, and the remaining
distance to 100. Failure records evidence and can provide a much smaller learning increment. This
produces diminishing returns and clamps every value to 0–100; elapsed time alone changes nothing.

Stone-cracking proficiency continues to affect the real hard-food action outcome. Social-foraging
proficiency is reinforced by the existing follow/cooperative-foraging execution path. No practice
creates resources or modifies inherited traits.

## Demonstration, teaching, and transmission

A demonstration is a real observable execution by a knowledgeable source. It becomes teaching
evidence only when source proficiency is at least 15, familiarity is at least 1, social influence is
at least 5, both agents pass opportunity gates, and the learner makes an attempt. Teaching raises the
quality of the opportunity; it does not guarantee acquisition.

Successful acquisition from another agent records a transmission with source, learner, behaviour,
group when present, acquisition path, and outcome. Group membership by itself transfers nothing.
Parent and offspring use the same post-birth proximity/relationship path as everyone else. A
knowledgeable migrant can therefore expose a different group, but only a verified successful
interaction creates an edge.

## Loss and rediscovery

At each reconciliation, knowledge is calculated from living individuals. A population-wide loss is
recorded only when the final living practitioner disappears. Historical discovery remains durable.
If normal experimentation later succeeds, the first new acquisition is recorded as rediscovery and
uses the same environmental rules as initial discovery. Per-group adoption is derived from current
members, so local disappearance is visible without creating a group-owned knowledge inventory.

## History and analytics

Important discovery, loss, and rediscovery milestones use a separate bounded milestone list.
Recent observation, imitation, practice, acquisition, demonstration, and transmission events use a
2,000-event window; low-value repeated events are throttled. A monotonically checkpointed total
records throughput even after eviction.

At every completed generation, the recorder stores living population plus, per behaviour,
practitioners, adoption, average/highest proficiency, new acquisitions, observations, attempts,
transmissions, independent discoveries, demonstrations, losses, rediscoveries, and group adoption.
At most 200 compact summaries are retained. Adoption is practitioners divided by the actual living
population, with zero population producing zero.

## Persistence, migration, and determinism

The additive schema-v1 migration fills missing practice fields, learning opportunities, telemetry,
and cultural recorder state with deterministic defaults. Existing learned behaviours are preserved.
Older saves bootstrap discovery from their actual population; no invented event history is
backfilled. Archived inspector snapshots preserve the final recorded knowledge of deceased agents.

All candidate and practitioner lists are stably ordered, all probabilities use the engine RNG, event
IDs use a checkpointed counter, and summaries are generated at deterministic boundaries. Cultural
state is exported and restored through deep checkpoint cloning. Direct, batched, restored, and
branched execution therefore remain equivalent for the same seed and interventions.
