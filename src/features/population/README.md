# Population Overview

Population Overview reads the active `SimulationSessionController`; it never creates or owns a
simulation engine. The engine exposes a lightweight snapshot containing living-agent identity,
current condition, learned-behaviour types, phenotype, and genome. Memories, relationships, world
tiles, deceased archives, and mutable engine entities are not copied into this view.

The screen refreshes from the controller's existing presentation publication cadence (currently
200 ms), not from every engine tick. Statistics are derived once per published snapshot, while
searching, filtering, and deterministic sorting operate on the presentation rows with stable ID as
the final tie-breaker.

## Trait variation index

For every inherited trait, the adapter calculates the living population's arithmetic mean,
minimum, maximum, and population standard deviation. Since traits are bounded to 0–100, their
maximum possible population standard deviation is 50. The displayed index is:

`100 × mean(standard deviation of each of the 10 traits) / 50`

The result is bounded to 0–100 by the genome bounds. It describes spread across the simulated
trait values; it is not heterozygosity, fitness, prognosis, or a claim about genetic health. At
least two living individuals are required, otherwise the index is unavailable.

Average condition values are arithmetic means of the engine's current 0–100 health, energy,
hydration, and safety values for living individuals only. Cultural adoption counts only durable
learned-behaviour records and is never inferred from inherited learning potential.
