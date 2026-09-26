import { initialUpdateState, updateReducer } from '@/updates/updateStore';

describe('update state reducer', () => {
  it('models check, download, and ready transitions', () => {
    const checking = updateReducer(initialUpdateState, { type: 'check' });
    const available = updateReducer(checking, { type: 'available' });
    const downloading = updateReducer(available, { type: 'download' });
    expect(updateReducer(downloading, { type: 'ready' }).status).toBe('ready');
  });

  it('retains a safe error message', () => {
    const state = updateReducer(initialUpdateState, {
      type: 'error',
      message: 'Update check failed.',
      checkedAt: 10,
    });
    expect(state).toMatchObject({
      status: 'error',
      lastError: 'Update check failed.',
      lastCheckedAt: 10,
    });
  });
});
