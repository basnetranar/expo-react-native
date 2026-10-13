# Slice 10B final report

## 1–3. Audit, reused systems, and new mechanics

The audit found usable deterministic discovery, basic imitation/proficiency, learning traits,
spatial queries, social relationships/groups, checkpoints, branches, inspector archives, and event
presentation. Slice 10B extends those systems with explicit observed/attempted/acquired states,
practice evidence, causal acquisition sources, genuine demonstration, verified transmission,
cultural loss/rediscovery, compact history, and read-only analytics. It does not add a second engine,
group-owned knowledge, scripted progression, or trait editing.

## 4–8. Files, registry, discovery, observation, imitation, and practice

Engine work is concentrated under `src/simulation/learning/`, with integration in engine types,
agent ticks, `SimulationEngine`, snapshots, configuration, invariants, and checkpoints. UI routes
live in `src/app/learning/`; reusable presentation, hooks, cards, and screens live in
`src/features/learning/`. Navigation, inspector, and event presenters were extended in place.

The registry exposes only stone cracking and social foraging because both have real effects.
Stone-cracking discovery requires the real hard-food/stone opportunity and seeded trait-dependent
success; no generation unlock exists. Observation is local, survival-gated, resource-gated,
stable-ordered, and capped at six candidates. It records an opportunity rather than knowledge.
Imitation can fail. Proficiency advances only from a real relevant action, uses diminishing returns,
and is clamped to 0–100.

## 9–12. Teaching, transmission, loss, and analytics

Teaching requires a knowledgeable demonstrator performing an observable action plus minimum
proficiency, familiarity, influence, proximity, learner attention, and resources. The learner still
makes a seeded attempt. A transmission edge is recorded only after successful acquisition with a
known source. Shared membership and shared knowledge alone never create an edge; parent/offspring
knowledge likewise requires post-birth interaction.

Living practitioners are reconciled every tick. Loss occurs only when the last living practitioner
disappears; discovery history survives. Normal experimentation can then produce a distinct
rediscovery. Group patterns and adoption percentages are derived from real living members.
Generation summaries retain actual population, adoption, proficiency, pathways, losses,
rediscoveries, and group distribution without storing historical full-agent copies.

## 13–15. UI, assets, and inspector

Delivered routes cover Learning Overview, Learned Behaviours, Behaviour Detail, Cultural History and
Trends, Individual Learning, and a bounded Transmission Explorer. Phone layouts are scrollable single
columns; tablet layouts use the established rail and multi-column cards. Empty, lost, extinct,
missing-history, and deceased states use explicit copy instead of fabricated results. Learning views
pause through the shared nested session contract and restore the prior playback state on exit.

All nine requested assets were found and inspected. The five cutouts have alpha channels. Only
artwork corresponding to implemented mechanics is used as behaviour artwork; decorative backgrounds
do not imply mechanics. The Hominin Inspector now links to an individual's learning journey and
shows acquisition source and practice evidence. Deceased learners use their archived final snapshot
and only recorded history.

## 16–18. Persistence, branches, and determinism

Checkpoint migration adds deterministic defaults for old learning records/opportunities and
bootstraps cultural discovery from actual saved knowledge without inventing past events. All future-
relevant counters and cultural state are serialized. Deep cloning keeps post-branch events,
practitioners, and summaries independent while preserving the shared pre-branch history.

Direct, batched, restored, and playback-rate runs match. The three-scenario, three-seed determinism
audit and checkpoint-boundary audit pass. The intentional complete-state change is protected by a
clearly labelled Slice 10B golden baseline.

## 19–20. Performance and balance

At 50/150/500 requested agents, measured tick p95 was 2.109/5.794/40.965 ms; peak Node heap was
23.4/93.6/125.6 MB. Candidate count remained capped at six. Bounded 50× playback achieved 5.0, 3.6,
and 1.0 ticks per callback, with backlog at the two larger sizes, so sustained 50× is claimed only
for 50 agents on this host.

Across eight seeds, 30 generations, and each of Stable Savannah, Drought, and Hard Food, all runs
survived and discovered an available behaviour. Verified social transmission appeared rarely in the
hard-food sample (0.875 mean/run), imitation success averaged 12.5% there, and group differences
appeared in every run. Loss remained possible; rediscovery was covered by deterministic tests but
was not naturally observed in this 24-run sample. Detailed distributions and caveats are in the
benchmark report.

## 21–22. Tests and device verification

Tests cover real resource requirements, observation without mastery, teaching without guaranteed
acquisition, discovery/loss/rediscovery milestones, branch-state isolation, presentation identity,
lost/extinct adoption, checkpoint migration/round-trip, replay equivalence, and the existing engine,
social, intervention, inheritance, resource, UI, and storage regressions. TypeScript, ESLint,
Prettier, and `git diff --check` pass; Jest passes 43 suites and 184 tests; Expo Doctor passes all
21 checks. The determinism and checkpoint-boundary audits also pass.

The Learning Overview and its genuine empty state were rendered on an iPhone 17 Pro and iPad Pro
13-inch in portrait. The phone used the scrollable single-column composition, and the tablet used the
intended two-column composition. The compact iPhone 17e remained at Expo Go's system confirmation
sheet, and the available headless CoreSimulator service did not expose an orientation control for an
iPad landscape capture. Those two device states are unverified; no result is inferred from tests or
responsive code inspection.

## 23. Known limitations

- Cultural history starts at the first Slice 10B-capable checkpoint; older saves are not backfilled.
- Recent event detail is capped at 2,000 and generation summaries at 200; milestone history has its
  own bound.
- The transmission view is intentionally capped and evidence-based rather than a free-form,
  unbounded graph.
- Local group disappearance is visible through derived adoption, while only population-wide loss is
  retained as a durable milestone.
- Stable/drought samples mostly reinforce social foraging; long-lived practitioners often approach
  the proficiency cap and may need later balance tuning.
- Unsupported asset concepts remain illustrative files only and are not behaviours.

## 24. Recommended next milestone

Profile and tune cultural event volume and late-life social-foraging proficiency on physical mobile
hardware, then expand the behaviour registry only alongside a fully simulated action and resource
model. Do not begin a scripted technology tree or infer Slice 10C mechanics from unused artwork.
