import { saveActiveWorldRecord } from '@/features/home/services/active-world-storage';
import type { SimulationSessionController } from '@/features/simulation/services/simulation-session-controller';
import { storage } from '@/storage/storage';

jest.mock('@/storage/storage', () => ({
  storage: { set: jest.fn(), get: jest.fn() },
}));

describe('active world metadata', () => {
  it('maps real controller identity and active branch metadata without checkpoints', async () => {
    const controller = {
      getHistoriesSnapshot: () => ({
        activeBranchId: 'branch-2',
        branches: [{ id: 'branch-2', name: 'Dry future' }],
        checkpoints: [],
        totalStorageBytes: 0,
        storageLimitBytes: 1,
      }),
      getUpdate: () => ({
        status: 'paused',
        snapshot: { scenario: 'drought', generation: 7, populationSize: 18 },
      }),
      getConfig: () => ({ seed: 'saved-seed' }),
    } as unknown as SimulationSessionController;
    const record = await saveActiveWorldRecord(controller, '2026-10-10T00:00:00.000Z');
    expect(record).toMatchObject({
      schemaVersion: 1,
      scenario: 'drought',
      generation: 7,
      population: 18,
      status: 'paused',
      activeBranchId: 'branch-2',
      activeBranchName: 'Dry future',
      lastSavedAt: '2026-10-10T00:00:00.000Z',
    });
    expect(storage.set).toHaveBeenCalledWith('@feature/active-world/v1', record);
  });
});
