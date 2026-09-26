export type BootstrapStage =
  'configuration' | 'storage' | 'migrations' | 'state' | 'assets' | 'updates' | 'ready';

export interface BootstrapResult {
  completedAt: string;
  storageRepaired: boolean;
}
