export const storageKeys = {
  schemaVersion: '@infrastructure/schema-version',
  migrationMetadata: '@infrastructure/migration-metadata',
  appState: '@infrastructure/app-state',
  healthProbe: '@infrastructure/health-probe',
} as const;

export type StorageKey = (typeof storageKeys)[keyof typeof storageKeys] | `@feature/${string}`;
