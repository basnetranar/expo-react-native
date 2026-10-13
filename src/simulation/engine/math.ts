import type { Position } from '@/simulation/engine/types';

export const clamp = (value: number, min = 0, max = 100): number =>
  Math.max(min, Math.min(max, value));

export function distance(first: Position, second: Position): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

export function moveOneStep(from: Position, to: Position, width: number, height: number): Position {
  const x = from.x + Math.sign(to.x - from.x);
  const y = from.y + Math.sign(to.y - from.y);
  return { x: clamp(x, 0, width - 1), y: clamp(y, 0, height - 1) };
}

export const tileIndex = (position: Position, width: number): number =>
  position.y * width + position.x;
export const regionFor = (position: Position): string =>
  `${Math.floor(position.x / 8)}:${Math.floor(position.y / 8)}`;
