import type { EngineCheckpointV1 } from '@/simulation/checkpoints/engine-checkpoint';

export function canonicalStateJson(checkpoint: EngineCheckpointV1): string {
  return JSON.stringify(sortValue(checkpoint));
}

export function canonicalStateHash(checkpoint: EngineCheckpointV1): string {
  const text = canonicalStateJson(checkpoint);
  let first = 2166136261;
  let second = 2246822507;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    first = Math.imul(first ^ code, 16777619);
    second = Math.imul(second ^ code, 3266489909);
  }
  return `${(first >>> 0).toString(16).padStart(8, '0')}${(second >>> 0)
    .toString(16)
    .padStart(8, '0')}`;
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([key, child]) => [key, sortValue(child)]),
  );
}
