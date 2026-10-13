# Slice 10A mechanics

## Relationships and memory

Relationships remain per-agent and capped by `config.memory.relationshipLimit` (24 by default).
Familiarity and trust use 0–100; affinity uses -100–100. Values are clamped. A relationship records
interaction count, first/last interaction tick, cooperation, sharing, and grooming counts. Family
kinship remains a separate biological value.

An encounter is recorded no more than once per four ticks for a pair. It adds 1.5 familiarity and
uses a normal bounded `social` memory. After more than 40 ticks apart, familiarity decays by 0.25
every ten ticks and affinity moves 0.1 toward neutral. Competing while both hungry on a tile with
less than four food units reduces affinity and trust. This is avoidance pressure, not combat.

At most six stable-ID-ordered local candidates per individual are considered for encounter updates.
Full relationship lists do not churn new records. This keeps the pass local and bounded.

## Groups

Two ungrouped individuals may form a group when they are within radius two, average mutual
familiarity is at least 6, average affinity is non-negative, and average social sensitivity is at
least 35. A compatible ungrouped individual can join a nearby member. Groups contain 2–8 members;
membership is exclusive, IDs are monotonically deterministic (`group-N`), and all tie resolution
uses stable agent IDs.

Each member has a last-seen tick. More than 12 ticks without another nearby member causes leaving.
Deaths are removed on the next group update, including generation-boundary cleanup. Groups below
two members dissolve. Separated compatible members can form a new group, which provides an
emergent split path. There is no leader, territory, or forced target group count.

## Cooperative behaviour

Social actions compete in the existing behaviour score table. Sharing requires donor energy above
48, hydration above 25, carried food, a nearby recipient, and an energy gap. Grooming requires
energy above 58, hydration above 48, safety above 55, a nearby living individual, and no visible
predator. Urgent food, water, and fleeing scores remain available and normally dominate emergencies.

Cooperative foraging requires two individuals on the same food tile. Up to 20 world-food units are
removed through the existing resource system, split 55/45 as energy, and the actor pays 0.35 energy.
No bonus food is created. A failed attempt yields no food and reduces trust slightly.

Eating stores at most 20% of harvested calories in a 12-unit carried-food inventory. Stored food was
already removed from the world. Sharing transfers at most four units, deducts the donor inventory,
credits the recipient by the identical quantity, and costs the donor 0.15 energy. Grooming costs
0.3 energy, changes relationship values, and provides no health or parasite effect.

Successful cooperation adds trust +2 and affinity +1; sharing adds trust +3 and affinity +4;
grooming adds trust +1.5 and affinity +2. These also modestly increase familiarity. No action
guarantees reciprocity, proficiency, teaching, or discovery.

## Events and persistence

Events cover first encounters, group formation/join/leave/dissolution, cooperative foraging, food
sharing, grooming, and resource conflict. IDs combine the deterministic tick and checkpointed event
counter. Participant IDs are sorted. Transfer quantity and outcome are recorded where applicable.

The existing schema-v1 checkpoint gained optional `social` state. Restore performs an explicit
additive migration: absent carried food, group IDs, relationship fields, archived social events,
groups, and counters receive deterministic defaults. This preserves older saved histories without
silently discarding them. Deep checkpoint cloning keeps branches isolated.

## Presentation thresholds

Affinity above 10 is positive, below -10 is negative, and the inclusive middle is neutral. Kinship
is rendered separately as family even when affinity is neutral. These labels describe current
recorded values, not personality or friendship claims.
