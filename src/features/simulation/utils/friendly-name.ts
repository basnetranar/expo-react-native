const names = ['Ara', 'Taro', 'Nira', 'Koa', 'Mira', 'Oru', 'Sena', 'Luma', 'Rai', 'Naro'] as const;

export function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getFriendlyName(id: string): string {
  return names[stableHash(id) % names.length]!;
}
