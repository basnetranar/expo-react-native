import { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import { deduplicateEvents, presentEvent } from '@/features/simulation/utils/event-presentation';
import { getFriendlyName } from '@/features/simulation/utils/friendly-name';
import {
  getAgentRenderSize,
  getDeterministicVariant,
  projectTerrain,
  sortAgentsForHitTesting,
  worldToViewport,
} from '@/features/simulation/utils/world-projection';
import type { SimulationEvent, WorldSnapshot } from '@/simulation';

describe('simulation presentation', () => {
  it('keeps friendly names and asset variants deterministic', () => {
    expect(getFriendlyName('g0-12')).toBe(getFriendlyName('g0-12'));
    expect(getDeterministicVariant('g0-12', 3)).toBe(getDeterministicVariant('g0-12', 3));
  });

  it('maps lifecycle stages to readable marker sizes', () => {
    expect(getAgentRenderSize('juvenile', 40)).toBeLessThan(getAgentRenderSize('adult', 40));
    expect(getAgentRenderSize('youngAdult', 40)).toBeLessThanOrEqual(40);
    expect(getAgentRenderSize('old', 40)).toBeLessThanOrEqual(40);
  });

  it('projects world coordinates to viewport percentages', () => {
    expect(worldToViewport({ x: 0, y: 0 }, 32, 32)).toEqual({ left: '0%', top: '0%' });
    expect(worldToViewport({ x: 31, y: 31 }, 32, 32)).toEqual({
      left: '100%',
      top: '100%',
    });
  });

  it('preserves riverbank terrain in macro projection when it is dominant', () => {
    const world: WorldSnapshot = {
      width: 4,
      height: 4,
      tiles: Array.from({ length: 16 }, () => ({
        terrain: 'riverbank' as const,
        food: 0,
        foodCapacity: 0,
        water: 10,
        waterCapacity: 10,
        hardFood: 0,
        objects: [],
      })),
      predators: [],
    };
    expect(projectTerrain(world)).toEqual([
      {
        id: '0-0',
        x: 0,
        y: 0,
        width: 4,
        height: 4,
        terrain: 'riverbank',
        hasWater: true,
        decoration: false,
      },
    ]);
  });

  it('assigns sparse terrain decoration deterministically without repeating a terrain asset', () => {
    const tiles = Array.from({ length: 64 }, (_, index) => ({
      terrain: (index < 32 ? 'plains' : 'scrub') as 'plains' | 'scrub',
      food: 0,
      foodCapacity: 0,
      water: 0,
      waterCapacity: 0,
      hardFood: 0,
      objects: [] as const,
    }));
    const world: WorldSnapshot = { width: 8, height: 8, tiles, predators: [] };
    const first = projectTerrain(world);
    const second = projectTerrain(world);
    expect(second).toEqual(first);
    const decorated = first.filter((cell) => cell.decoration);
    expect(new Set(decorated.map((cell) => cell.terrain)).size).toBe(decorated.length);
  });

  it('maps structured engine events to display copy outside the engine', () => {
    const event: SimulationEvent = {
      id: 'event-1',
      type: 'firstDiscovery',
      behaviour: 'stoneCracking',
      agentId: 'g0-1',
      tick: 8,
      generation: 1,
    };
    expect(presentEvent(event)).toMatchObject({
      title: 'New Behaviour',
      description: 'Stone cracking has appeared in the population.',
      category: 'discovery',
    });
  });

  it('deduplicates repeated migration presentation without mutating engine events', () => {
    const first: SimulationEvent = {
      id: 'migration-1',
      type: 'migrationDetected',
      generation: 4,
      tick: 160,
      migrationRate: 0.4,
      resourcePressure: 0.5,
      centroidShift: 3,
      meanDisplacement: 5,
    };
    const second: SimulationEvent = { ...first, id: 'migration-2', tick: 161 };
    expect(deduplicateEvents([first, second])).toEqual([second]);
    expect(first.id).toBe('migration-1');
  });

  it('orders overlapping hit targets deterministically and keeps selection on top', () => {
    const controller = new SimulationSessionController({ seed: 'overlap-order' });
    const update = controller.initialize();
    const agents = update.snapshot.aliveAgents.slice(0, 2).map((agent) => ({
      ...agent,
      position: { x: 8, y: 8 },
    }));
    const selected = agents[0]!;
    expect(sortAgentsForHitTesting(agents, selected.id).at(-1)?.id).toBe(selected.id);
    expect(sortAgentsForHitTesting(agents, null).map((agent) => agent.id)).toEqual(
      [...agents].map((agent) => agent.id).sort(),
    );
    controller.dispose();
  });
});
