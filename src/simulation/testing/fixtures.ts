import { createHominin } from '@/simulation/agents/Hominin';
import type { Genome, Hominin } from '@/simulation/engine/types';
import { traitNames } from '@/simulation/engine/types';

export function genome(value = 50): Genome {
  return Object.freeze(
    Object.fromEntries(traitNames.map((trait) => [trait, value])) as unknown as Genome,
  );
}

export function hominin(id = 'test-agent', genomeValue = 50): Hominin {
  return createHominin({
    id,
    generation: 0,
    position: { x: 2, y: 2 },
    genome: genome(genomeValue),
    age: 24,
  });
}
