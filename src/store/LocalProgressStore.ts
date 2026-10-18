import { createDefaultSave } from './defaults.ts';
import { parseSave } from './parse.ts';
import type { KeyValueStore, ProgressStore } from './ProgressStore.ts';
import type { SaveData } from './types.ts';

const DEFAULT_KEY = 'science-quest-v1';

/** Browser save. Game screens never call localStorage; they only see ProgressStore. */
export class LocalProgressStore implements ProgressStore {
  private readonly kv: KeyValueStore;
  private readonly key: string;

  constructor(kv: KeyValueStore = localStorage, key = DEFAULT_KEY) {
    this.kv = kv;
    this.key = key;
  }

  load(): SaveData {
    const raw = this.kv.getItem(this.key);
    if (!raw) return createDefaultSave();
    try {
      const data = parseSave(raw);
      const stored = JSON.parse(raw) as { version?: unknown };
      if (stored.version !== data.version) this.save(data);
      return data;
    } catch {
      return createDefaultSave();
    }
  }

  save(data: SaveData): void {
    this.kv.setItem(this.key, JSON.stringify(data));
  }

  exportJson(): string {
    return JSON.stringify(this.load(), null, 2);
  }

  importJson(json: string): SaveData {
    const data = parseSave(json);
    this.save(data);
    return data;
  }
}
