import type { SaveData } from './types.ts';

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Every read and write of player progress goes through this interface. */
export interface ProgressStore {
  load(): SaveData;
  save(data: SaveData): void;
  exportJson(): string;
  importJson(json: string): SaveData;
}
