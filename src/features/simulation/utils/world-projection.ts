import type {
  ResourceMarkerSnapshot,
  TerrainMacroCell,
  WorldPresentationSnapshot,
} from '@/features/simulation/types';
import { stableHash } from '@/features/simulation/utils/friendly-name';
import type { AgentSnapshot, LifeStage, Position, Terrain, WorldSnapshot } from '@/simulation';

const macroSize = 4;
const terrainPriority: Terrain[] = ['riverbank', 'rocky', 'scrub', 'plains'];

export function worldToViewport(
  position: Position,
  worldWidth: number,
  worldHeight: number,
): { left: `${number}%`; top: `${number}%` } {
  return {
    left: `${(position.x / Math.max(1, worldWidth - 1)) * 100}%`,
    top: `${(position.y / Math.max(1, worldHeight - 1)) * 100}%`,
  };
}

export function getAgentRenderSize(stage: LifeStage, base = 34): number {
  if (stage === 'juvenile') return base * 0.72;
  if (stage === 'old') return base * 0.9;
  if (stage === 'youngAdult') return base * 0.88;
  return base;
}

export function getDeterministicVariant(id: string, count: number): number {
  return stableHash(id) % Math.max(1, count);
}

export function resolveAgentAssetIndex(agent: Pick<AgentSnapshot, 'id' | 'phenotype'>): number {
  const counts: Record<LifeStage, number> = { juvenile: 2, youngAdult: 2, adult: 3, old: 2 };
  return getDeterministicVariant(agent.id, counts[agent.phenotype.lifeStage]);
}

export function sortAgentsForHitTesting(
  agents: readonly AgentSnapshot[],
  selectedId: string | null,
): AgentSnapshot[] {
  return [...agents].sort((first, second) => {
    if (first.id === selectedId) return 1;
    if (second.id === selectedId) return -1;
    return (
      first.position.y - second.position.y ||
      first.position.x - second.position.x ||
      first.id.localeCompare(second.id)
    );
  });
}

export function projectTerrain(world: WorldSnapshot): TerrainMacroCell[] {
  const cells: TerrainMacroCell[] = [];
  const decoratedTerrains = new Set<Terrain>();
  for (let y = 0; y < world.height; y += macroSize) {
    for (let x = 0; x < world.width; x += macroSize) {
      const counts = new Map<Terrain, number>();
      let hasWater = false;
      for (let offsetY = 0; offsetY < macroSize && y + offsetY < world.height; offsetY += 1) {
        for (let offsetX = 0; offsetX < macroSize && x + offsetX < world.width; offsetX += 1) {
          const tile = world.tiles[(y + offsetY) * world.width + x + offsetX]!;
          counts.set(tile.terrain, (counts.get(tile.terrain) ?? 0) + 1);
          if (tile.waterCapacity > 0) hasWater = true;
        }
      }
      const terrain = terrainPriority.reduce((best, candidate) =>
        (counts.get(candidate) ?? 0) > (counts.get(best) ?? 0) ? candidate : best,
      );
      const decoration =
        !hasWater &&
        !decoratedTerrains.has(terrain) &&
        getDeterministicVariant(`${x}-${y}-${terrain}`, 3) === 0;
      if (decoration) decoratedTerrains.add(terrain);
      cells.push({
        id: `${x}-${y}`,
        x,
        y,
        width: Math.min(macroSize, world.width - x),
        height: Math.min(macroSize, world.height - y),
        terrain,
        hasWater,
        decoration,
      });
    }
  }
  return cells;
}

function selectMarkers(world: WorldSnapshot, kind: ResourceMarkerSnapshot['kind'], limit: number) {
  const candidates = world.tiles
    .map((tile, index) => ({
      tile,
      position: { x: index % world.width, y: Math.floor(index / world.width) },
      strength:
        kind === 'food'
          ? tile.foodCapacity > 0
            ? tile.food / tile.foodCapacity
            : 0
          : kind === 'water'
            ? tile.waterCapacity > 0
              ? tile.water / tile.waterCapacity
              : 0
            : tile.objects.includes('stone')
              ? 1
              : 0,
    }))
    .filter(({ strength }) => strength > 0.3)
    .sort((a, b) => b.strength - a.strength);
  const selected: ResourceMarkerSnapshot[] = [];
  for (const candidate of candidates) {
    if (
      selected.some(
        (marker) =>
          Math.hypot(
            marker.position.x - candidate.position.x,
            marker.position.y - candidate.position.y,
          ) < 4,
      )
    )
      continue;
    selected.push({
      id: `${kind}-${candidate.position.x}-${candidate.position.y}`,
      kind,
      position: candidate.position,
      strength: candidate.strength,
    });
    if (selected.length === limit) break;
  }
  return selected;
}

export function projectWorld(
  world: WorldSnapshot,
  terrainCells: readonly TerrainMacroCell[] = projectTerrain(world),
): WorldPresentationSnapshot {
  return {
    width: world.width,
    height: world.height,
    terrainCells,
    resources: [
      ...selectMarkers(world, 'food', 10),
      ...selectMarkers(world, 'water', 6),
      ...selectMarkers(world, 'stone', 6),
    ],
    predators: world.predators.map((predator) => ({
      id: predator.id,
      position: { ...predator.position },
      state: predator.state,
    })),
  };
}
