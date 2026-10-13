import type { Hominin, Position } from '@/simulation/engine/types';

const key = (x: number, y: number) => `${x}:${y}`;

export class AgentSpatialIndex {
  private readonly cells = new Map<string, Hominin[]>();

  constructor(population: readonly Hominin[]) {
    for (const agent of population) {
      const cell = key(agent.position.x, agent.position.y);
      const occupants = this.cells.get(cell);
      if (occupants) occupants.push(agent);
      else this.cells.set(cell, [agent]);
    }
  }

  query(position: Position, radius: number): Hominin[] {
    const nearby: Hominin[] = [];
    const rounded = Math.ceil(radius);
    for (let y = position.y - rounded; y <= position.y + rounded; y += 1) {
      for (let x = position.x - rounded; x <= position.x + rounded; x += 1) {
        const occupants = this.cells.get(key(x, y));
        if (occupants) nearby.push(...occupants);
      }
    }
    return nearby;
  }
}
