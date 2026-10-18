import { describe, expect, it } from 'vitest';
import { chemistry } from '../subjects/chemistry/index.ts';
import { emptyProgress } from '../store/types.ts';
import { isUnlocked, isWorldUnlocked, nextOpenLevel } from './unlock.ts';

const levels = chemistry.levels;

describe('parent unlock', () => {
  it('opens every level, world, and boss for the parent and keeps kids linear', () => {
    const progress = emptyProgress();
    const bosses = levels.filter((level) => level.boss).map((level) => level.number);
    expect(bosses).toEqual([7, 11]);

    expect(isUnlocked(progress, 1, levels, 'kid')).toBe(true);
    expect(isUnlocked(progress, 2, levels, 'kid')).toBe(false);
    expect(isUnlocked(progress, 7, levels, 'kid')).toBe(false);
    expect(isUnlocked(progress, 11, levels, 'kid')).toBe(false);
    expect(isWorldUnlocked(progress, 1, levels, 'kid')).toBe(true);
    expect(isWorldUnlocked(progress, 2, levels, 'kid')).toBe(false);
    expect(isWorldUnlocked(progress, 3, levels, 'kid')).toBe(false);

    for (const level of levels) {
      expect(isUnlocked(progress, level.number, levels, 'parent')).toBe(true);
    }
    expect(isWorldUnlocked(progress, 1, levels, 'parent')).toBe(true);
    expect(isWorldUnlocked(progress, 2, levels, 'parent')).toBe(true);
    expect(isWorldUnlocked(progress, 3, levels, 'parent')).toBe(true);
    expect(nextOpenLevel(progress, levels, 'parent')).toBe(1);
    expect(nextOpenLevel(progress, levels, 'kid')).toBe(1);

    progress.levels[levels[0]!.id] = { bestStars: 1, bestScore: 10, plays: 1, completed: true };
    expect(isUnlocked(progress, 2, levels, 'kid')).toBe(true);
    expect(isUnlocked(progress, 3, levels, 'kid')).toBe(false);
    expect(isWorldUnlocked(progress, 2, levels, 'kid')).toBe(false);
  });
});
