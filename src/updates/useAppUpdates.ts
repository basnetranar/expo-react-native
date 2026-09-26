import { updateManager } from '@/updates/updateService';
import { useUpdateStore } from '@/updates/updateStore';

export function useAppUpdates() {
  const state = useUpdateStore();
  return {
    ...state,
    isChecking: state.status === 'checking',
    isDownloading: state.status === 'downloading',
    updateAvailable: ['available', 'downloading', 'ready'].includes(state.status),
    updateReady: state.status === 'ready',
    checkForUpdate: () => updateManager.checkForUpdate({ bypassCooldown: true }),
    downloadUpdate: updateManager.downloadUpdate,
    applyUpdate: updateManager.applyUpdate,
  };
}
