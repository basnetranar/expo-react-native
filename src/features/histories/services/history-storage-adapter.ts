import { Directory, File, Paths } from 'expo-file-system';

import { checkpointChecksum } from '@/features/histories/services/checkpoint-integrity';
import type { HistoriesManifest } from '@/features/histories/types';
import { storage } from '@/storage/storage';

export interface HistoryStorageAdapter {
  readManifest(): Promise<HistoriesManifest | null>;
  writeManifest(manifest: HistoriesManifest): Promise<void>;
  readCheckpoint(id: string): Promise<string | null>;
  writeCheckpointAtomic(id: string, payload: string): Promise<void>;
  deleteCheckpoint(id: string): Promise<void>;
  listCheckpointIds(): Promise<string[]>;
  recoverInterruptedWrites(): Promise<void>;
}

export class ExpoHistoryStorageAdapter implements HistoryStorageAdapter {
  private readonly manifestKey: `@feature/${string}`;
  private readonly directory: Directory;

  constructor(worldId: string) {
    const namespace = checkpointChecksum(worldId);
    this.manifestKey = `@feature/evolution-histories-manifest/${namespace}`;
    this.directory = new Directory(Paths.document, 'first-minds', 'histories', namespace);
  }

  async readManifest(): Promise<HistoriesManifest | null> {
    return storage.get<HistoriesManifest>(this.manifestKey);
  }

  async writeManifest(manifest: HistoriesManifest): Promise<void> {
    await storage.set(this.manifestKey, manifest);
  }

  async readCheckpoint(id: string): Promise<string | null> {
    this.ensureDirectory();
    const file = this.file(id);
    return file.exists ? file.text() : null;
  }

  async writeCheckpointAtomic(id: string, payload: string): Promise<void> {
    this.ensureDirectory();
    const temporary = new File(this.directory, `${id}.checkpoint.json.tmp`);
    temporary.create({ overwrite: true, intermediates: true });
    temporary.write(payload);
    await temporary.move(this.file(id), { overwrite: true });
  }

  async deleteCheckpoint(id: string): Promise<void> {
    const file = this.file(id);
    if (file.exists) file.delete();
  }

  async listCheckpointIds(): Promise<string[]> {
    this.ensureDirectory();
    return this.directory
      .list()
      .filter(
        (entry): entry is File => entry instanceof File && entry.name.endsWith('.checkpoint.json'),
      )
      .map((entry) => entry.name.replace('.checkpoint.json', ''));
  }

  async recoverInterruptedWrites(): Promise<void> {
    this.ensureDirectory();
    for (const entry of this.directory.list())
      if (entry instanceof File && entry.name.endsWith('.tmp')) entry.delete();
  }

  private ensureDirectory(): void {
    this.directory.create({ idempotent: true, intermediates: true });
  }

  private file(id: string): File {
    return new File(this.directory, `${id}.checkpoint.json`);
  }
}
