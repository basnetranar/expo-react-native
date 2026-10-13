# Slice 10B design and repository audit

## Audit findings

The engine already had deterministic seeded random numbers, stable agent IDs, traits for learning
potential, bounded memories, spatial queries, reproduction, stone-cracking discovery, a simple
imitation pass, proficiency, social relationships and groups, event history, checkpoints, branch
cloning, the Evolution Timeline, Population Overview, and Hominin Inspector. These were extended
rather than duplicated.

The original learning records lacked practice evidence and an explicit acquisition path. Observation
could immediately create knowledge, social demonstration was not recorded, cultural loss and
rediscovery were not durable concepts, and there was no per-generation cultural summary. Learning
also had no dedicated product surface. The main performance risk was an all-pairs observer scan; the
implementation instead reuses the spatial index and caps candidates at six per observer.

State that can affect future outcomes now lives in engine/checkpoint data: acquired-behaviour
evidence, learning opportunities, the deterministic cultural event counter, discovery/currently
known flags, milestone history, per-generation counters, and compact summaries. Presentation-only
filters and selected routes remain in React state. Mutable hominins do not enter Zustand.

Existing `AppScreen`, cards, typography, responsive breakpoints, session controller, friendly names,
inspector snapshots, event presentation, and bottom/side navigation patterns were reused.

## Architecture

`SimulationEngine` remains the single owner of mutable simulation state. It coordinates the existing
agent tick, the learning modules, and one branch-local `CulturalHistory`. The latter records compact
facts but does not own knowledge: knowledge remains on individual hominins, and group culture is
derived from living members.

The UI reads immutable snapshots through the existing simulation session. Learning routes call the
controller's nested pause API on focus and restore the prior run/pause state on leave. Opening a
learning screen therefore does not construct, restart, or reset an engine.

The feature presentation adapter maps engine snapshots into display-safe data. It exposes only the
two behaviours backed by real mechanics: stone cracking and social foraging. It does not expose a
technology tree, hidden future inventions, or an aggregate intelligence score.

## Screens and navigation

- Learning Overview: cinematic hero, actual cultural counts, adopted behaviours, and recent events.
- Learned Behaviours: filters for recorded, currently known, and lost behaviours.
- Behaviour Detail: discovery, adoption, proficiency, practitioners, pathways, group distribution,
  and recorded history.
- Cultural History: filterable chronological events and compact generation trends with text values.
- Individual Learning: acquired behaviours, source, practice evidence, and recorded learning events;
  archived final snapshots are used for deceased individuals.
- Transmission Explorer: a bounded list/network of verified transmission edges and separately
  labelled independent origins.

Phone uses a scrollable single column and bottom navigation. Tablet uses wider hero and two-column
content with the established navigation rail. Status is always stated in text as well as colour, and
trend data has a textual equivalent.

## Assets

All nine requested Slice 10B files were found. The four backgrounds are RGB images. Alpha inspection
confirmed that the five cutout files contain alpha channels. Only `learning-stone-core.png` is used
as behaviour-specific artwork because stone cracking is the only matching implemented tool
behaviour. The hero, observation, group-practice, and history backgrounds support their respective
screens. Unsupported stick, plant-processing, water-container, and flake concepts are not presented
as implemented gameplay.

## Data boundaries

Inherited learning ability, memory potential, curiosity, social sensitivity, vision, and dexterity
remain genome/phenotype data. Acquired knowledge and proficiency remain lifetime records. Newborns
start with no acquired behaviours; family transmission can only arise later from a recorded nearby
interaction. Checkpoints deep-clone cultural state, so a branch cannot mutate its parent history.
