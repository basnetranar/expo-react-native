import { create } from 'zustand';

import type { UpdateAction, UpdateState } from '@/updates/types';

export const initialUpdateState: UpdateState = {
  status: 'idle',
  lastCheckedAt: null,
  lastError: null,
};

export function updateReducer(state: UpdateState, action: UpdateAction): UpdateState {
  switch (action.type) {
    case 'check':
      return { ...state, status: 'checking', lastError: null };
    case 'available':
      return { ...state, status: 'available', lastCheckedAt: Date.now() };
    case 'download':
      return { ...state, status: 'downloading' };
    case 'ready':
      return { ...state, status: 'ready', lastError: null };
    case 'apply':
      return { ...state, status: 'applying' };
    case 'idle':
      return { status: 'idle', lastCheckedAt: action.checkedAt ?? Date.now(), lastError: null };
    case 'error':
      return {
        status: 'error',
        lastCheckedAt: action.checkedAt ?? Date.now(),
        lastError: action.message,
      };
  }
}

interface UpdateStore extends UpdateState {
  dispatch(action: UpdateAction): void;
}

export const useUpdateStore = create<UpdateStore>((set) => ({
  ...initialUpdateState,
  dispatch: (action) => set((state) => updateReducer(state, action)),
}));
