# Slice 8 Storage, Recovery, and Session Lifecycle

## Persistence architecture

Alternate-history manifests use the typed AsyncStorage wrapper. Complete checkpoint envelopes are
stored under a world-seed namespace in Expo FileSystem. A checkpoint envelope contains the complete
engine checkpoint plus a deterministic checksum. Writes use a temporary file followed by a move to
the destination. Initialization removes interrupted temporary files and payloads not referenced by
the manifest.

Payload accounting has a 50 MiB per-world limit. The repository validates the checkpoint before
writing, checks capacity before the atomic payload write, verifies checksum and schema before
restore, serializes mutations through one promise queue, and protects main, active, parent, head,
and branch-origin records from unsafe deletion.

## Recovery matrix

| Condition                           | Behaviour and test result                                            |
| ----------------------------------- | -------------------------------------------------------------------- |
| Successful save / restart restore   | Active branch and exact checkpoint restored                          |
| Interrupted write                   | `.tmp` files removed during initialization                           |
| Corrupt JSON or checksum            | Restore rejected with checkpoint-specific integrity error            |
| Unsupported schema / engine version | Integrity-valid envelope still rejected before activation            |
| Missing checkpoint                  | Restore rejected with checkpoint ID; no regeneration                 |
| Orphan payload                      | Removed while referenced payloads are preserved                      |
| Missing manifest                    | Fresh main history created; pre-existing orphan payloads now removed |
| Storage exhaustion                  | Write rejected before payload creation with deletion guidance        |
| Duplicate save requests             | Serialized and allocated distinct stable IDs                         |
| Concurrent branch switches          | Serialized deterministically; last queued switch is active           |
| Referenced deletion                 | Head/origin, main, active, and parent branch deletion rejected       |
| Failed destination restore          | Current engine and previous active branch remain intact              |

Manifest persistence and payload moves are separate operations. A process termination after a new
payload move but before manifest update leaves an orphan that the next initialization removes. A
platform-level manifest write failure is surfaced; it is not silently replaced or reset.

## Session lifecycle and recovery UI

One `SimulationSessionController` and one mutable engine back all feature routes. Zustand receives
presentation snapshots only. Inspector, Timeline, Family Tree, Experiments, Population, and
Histories use the registered active session rather than creating engines.

- Opening a paused analytical view records whether playback had been running. Nested views use a
  depth counter; only the outermost close may resume.
- Manual pause remains paused across route transitions.
- Backgrounding pauses and persists; foregrounding never resumes implicitly.
- `dispose()` clears the timer and subscriptions, and repeated `resume()` cannot start a second loop.
- Extinct sessions remain queryable and reject new intervention scheduling.
- Missing sessions and missing hominin IDs keep their existing recovery/empty states.
- Saved-history initialization failure is now a non-fatal warning: the newly created active engine
  remains usable and the Live Simulation offers **Retry History Restore**.
- Async history completion checks mount state, preventing stale writes after route teardown.
- Root recovery actions now catch and display their own failures instead of creating unhandled
  promise rejections. No recovery path silently clears user data.

## Remaining storage risks

Checkpoint payloads are large (about 0.53–2.99 MB in 50–500-agent fixtures). Branch count and
manifest metadata have no independent count/byte cap. Deceased archives and lineage are retained in
each checkpoint. Future work should add transactional manifest journaling and lazy/deduplicated
checkpoint storage before very large user history collections; cloud persistence is intentionally
out of scope.
