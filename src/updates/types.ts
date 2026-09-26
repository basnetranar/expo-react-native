export type UpdateStatus =
  'idle' | 'checking' | 'available' | 'downloading' | 'ready' | 'applying' | 'error';

export interface UpdateState {
  status: UpdateStatus;
  lastCheckedAt: number | null;
  lastError: string | null;
}

export type UpdateAction =
  | { type: 'check' }
  | { type: 'available' }
  | { type: 'download' }
  | { type: 'ready' }
  | { type: 'apply' }
  | { type: 'idle'; checkedAt?: number }
  | { type: 'error'; message: string; checkedAt?: number };

export interface UpdateCheckOptions {
  bypassCooldown?: boolean;
  download?: boolean;
  applyIfSafe?: boolean;
}
