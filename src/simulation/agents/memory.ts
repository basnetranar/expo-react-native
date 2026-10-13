import { clamp } from '@/simulation/engine/math';
import type { Hominin, MemoryRecord } from '@/simulation/engine/types';

export const memoryCapacity = (memoryPotential: number): number =>
  3 + Math.floor(clamp(memoryPotential) / 10);

export function remember(
  agent: Hominin,
  memory: Omit<MemoryRecord, 'strength' | 'createdAtTick' | 'lastReinforcedTick'>,
  tick: number,
  strength = 70,
): void {
  const existing = agent.memories.find((item) => item.id === memory.id);
  if (existing) {
    existing.strength = clamp(existing.strength + strength * 0.35);
    existing.lastReinforcedTick = tick;
    if (memory.position) existing.position = { ...memory.position };
    return;
  }
  agent.memories.push({
    ...memory,
    ...(memory.position ? { position: { ...memory.position } } : {}),
    strength: clamp(strength),
    createdAtTick: tick,
    lastReinforcedTick: tick,
  });
  const capacity = memoryCapacity(agent.genome.memoryPotential);
  if (agent.memories.length > capacity) {
    agent.memories.sort(
      (first, second) =>
        second.strength - first.strength || second.lastReinforcedTick - first.lastReinforcedTick,
    );
    agent.memories.length = capacity;
  }
}

export function decayMemories(agent: Hominin, baseDecay: number): void {
  const decay = baseDecay * (1 - agent.genome.memoryPotential * 0.006);
  for (const memory of agent.memories) memory.strength = clamp(memory.strength - decay);
  agent.memories = agent.memories.filter((memory) => memory.strength > 0.5);
}

export function strongestMemory(
  agent: Hominin,
  type: MemoryRecord['type'],
): MemoryRecord | undefined {
  return agent.memories
    .filter((memory) => memory.type === type)
    .sort((first, second) => second.strength - first.strength)[0];
}
