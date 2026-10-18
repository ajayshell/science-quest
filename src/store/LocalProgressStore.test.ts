import { describe, expect, it } from 'vitest';
import { applyLevelResult } from './award.ts';
import { LocalProgressStore } from './LocalProgressStore.ts';
import type { KeyValueStore } from './ProgressStore.ts';
import { createDefaultSave } from './defaults.ts';

class MemoryKv implements KeyValueStore {
  private readonly map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
}

describe('LocalProgressStore', () => {
  it('starts with two kids and a parent, and round-trips through the store', () => {
    const kv = new MemoryKv();
    const store = new LocalProgressStore(kv);
    const fresh = store.load();
    expect(fresh.profiles.map((profile) => profile.role)).toEqual(['kid', 'kid', 'parent']);
    expect(fresh.welcomed).toBe(false);
    fresh.welcomed = true;
    fresh.progress['kid-7']!.chemistry.points = 120;
    fresh.progress['kid-9']!.chemistry.points = 40;
    fresh.progress['kid-7']!.physics.points = 9;
    store.save(fresh);

    const again = new LocalProgressStore(kv).load();
    expect(again.progress['kid-7']!.chemistry.points).toBe(120);
    expect(again.progress['kid-9']!.chemistry.points).toBe(40);
    expect(again.progress['parent']!.chemistry.points).toBe(0);
    expect(again.progress['kid-7']!.physics.points).toBe(9);
    expect(again.progress['kid-9']!.math.points).toBe(0);
    expect(again.welcomed).toBe(true);
  });

  it('exports and imports JSON without touching any other key', () => {
    const kv = new MemoryKv();
    kv.setItem('unrelated', 'keep');
    const store = new LocalProgressStore(kv);
    const save = store.load();
    save.profiles[0]!.name = 'Nova';
    save.progress['kid-7']!.chemistry.cards = ['H', 'O'];
    store.save(save);

    const json = store.exportJson();
    const other = new MemoryKv();
    const imported = new LocalProgressStore(other).importJson(json);
    expect(imported.profiles[0]!.name).toBe('Nova');
    expect(imported.progress['kid-7']!.chemistry.cards).toEqual(['H', 'O']);
    expect(kv.getItem('unrelated')).toBe('keep');
  });

  it('rejects a damaged import and keeps the previous save', () => {
    const store = new LocalProgressStore(new MemoryKv());
    store.save(createDefaultSave());
    expect(() => store.importJson('{')).toThrow(/JSON/);
    expect(() => store.importJson('{"version":9}')).toThrow(/version/);
    expect(() => store.importJson('{"version":1,"profiles":[]}')).toThrow(/profiles/);
    expect(store.load().profiles).toHaveLength(3);
  });

  it('falls back to a fresh save when stored JSON is corrupt', () => {
    const kv = new MemoryKv();
    kv.setItem('science-quest-v1', '{not json');
    const loaded = new LocalProgressStore(kv).load();
    expect(loaded.profiles).toHaveLength(3);
    expect(loaded.progress['parent']!.chemistry.points).toBe(0);
  });
});

describe('progress migration', () => {
  it('keeps a version-1 chemistry save under the chemistry subject', () => {
    const kv = new MemoryKv();
    const profiles = createDefaultSave().profiles;
    kv.setItem(
      'science-quest-v1',
      JSON.stringify({
        version: 1,
        welcomed: true,
        activeProfileId: 'kid-7',
        profiles,
        progress: {
          'kid-7': {
            points: 170,
            bestCombo: 4,
            levels: {
              'w1-matter-sort': { bestStars: 3, bestScore: 240, plays: 2, completed: true },
            },
            cards: ['He', 'O'],
          },
          'kid-9': { points: 15, bestCombo: 1, levels: {}, cards: ['H'] },
          parent: { points: 0, bestCombo: 0, levels: {}, cards: [] },
        },
      }),
    );

    const loaded = new LocalProgressStore(kv).load();
    expect(loaded.version).toBe(2);
    expect(loaded.welcomed).toBe(true);
    expect(loaded.progress['kid-7']!.chemistry.points).toBe(170);
    expect(loaded.progress['kid-7']!.chemistry.bestCombo).toBe(4);
    expect(loaded.progress['kid-7']!.chemistry.cards).toEqual(['He', 'O']);
    expect(loaded.progress['kid-7']!.chemistry.levels['w1-matter-sort']).toEqual({
      bestStars: 3,
      bestScore: 240,
      plays: 2,
      completed: true,
    });
    expect(loaded.progress['kid-9']!.chemistry.points).toBe(15);
    expect(loaded.progress['kid-9']!.chemistry.cards).toEqual(['H']);
    expect(loaded.progress['parent']!.chemistry.points).toBe(0);
    expect(loaded.progress['kid-7']!.physics).toEqual({ points: 0, bestCombo: 0, levels: {}, cards: [] });
    expect(loaded.progress['kid-7']!.math.cards).toEqual([]);
    expect(loaded.progress['kid-9']!.biology.levels).toEqual({});

    const stored = JSON.parse(kv.getItem('science-quest-v1') ?? '{}') as {
      version: number;
      progress: { 'kid-7': { chemistry: { points: number }; points?: number } };
    };
    expect(stored.version).toBe(2);
    expect(stored.progress['kid-7'].chemistry.points).toBe(170);
    expect(stored.progress['kid-7'].points).toBeUndefined();

    const again = new LocalProgressStore(kv).load();
    expect(again.progress['kid-7']!.chemistry.points).toBe(170);
    expect(again.progress['kid-7']!.chemistry.levels['w1-matter-sort']?.bestStars).toBe(3);
    expect(again.progress['kid-7']!.chemistry.cards).toEqual(['He', 'O']);
  });
});

describe('applyLevelResult', () => {
  it('adds a first-clear score, spends hints, and unlocks cards once', () => {
    const save = createDefaultSave();
    const progress = save.progress['kid-7']!.chemistry;
    const first = applyLevelResult(progress, 'w1-matter', {
      gross: 200,
      hintsUsed: 1,
      stars: 2,
      bestCombo: 3,
      cardIds: ['He', 'O'],
    });
    expect(first.gained).toBe(200);
    expect(first.spent).toBe(30);
    expect(first.delta).toBe(170);
    expect(progress.points).toBe(170);
    expect(progress.cards).toEqual(['He', 'O']);
    expect(progress.levels['w1-matter']?.bestStars).toBe(2);

    const replay = applyLevelResult(progress, 'w1-matter', {
      gross: 80,
      hintsUsed: 0,
      stars: 1,
      bestCombo: 1,
      cardIds: ['He', 'C'],
    });
    expect(replay.gained).toBe(0);
    expect(replay.delta).toBe(0);
    expect(progress.points).toBe(170);
    expect(progress.levels['w1-matter']?.bestStars).toBe(2);
    expect(progress.levels['w1-matter']?.bestScore).toBe(200);
    expect(progress.cards).toEqual(['He', 'O', 'C']);
  });

  it('improves a personal best and never lets hint cost push points below zero', () => {
    const progress = createDefaultSave().progress['parent']!.chemistry;
    progress.points = 20;
    const award = applyLevelResult(progress, 'boss', {
      gross: 0,
      hintsUsed: 2,
      stars: 1,
      bestCombo: 0,
      cardIds: [],
    });
    expect(award.spent).toBe(60);
    expect(progress.points).toBe(0);
    expect(award.delta).toBe(-20);
  });

  it('keeps profiles independent', () => {
    const save = createDefaultSave();
    applyLevelResult(save.progress['kid-9']!.chemistry, 'w1-matter', {
      gross: 50,
      hintsUsed: 0,
      stars: 1,
      bestCombo: 1,
      cardIds: ['H'],
    });
    expect(save.progress['kid-7']!.chemistry.points).toBe(0);
    expect(save.progress['kid-7']!.chemistry.cards).toEqual([]);
    expect(save.progress['kid-9']!.chemistry.points).toBe(50);
    expect(save.progress['kid-9']!.physics.points).toBe(0);
  });
});
