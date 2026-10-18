import { LEVELS } from '../data/levels/index.ts';
import type { ProfileProgress } from '../store/types.ts';

export function isUnlocked(progress: ProfileProgress, levelNumber: number): boolean {
  if (levelNumber <= 1) return true;
  const prev = LEVELS.find((level) => level.number === levelNumber - 1);
  return Boolean(prev && progress.levels[prev.id]?.completed);
}

export function totalStars(progress: ProfileProgress): number {
  return Object.values(progress.levels).reduce((sum, level) => sum + level.bestStars, 0);
}

export function nextOpenLevel(progress: ProfileProgress): number | null {
  for (const level of LEVELS) {
    if (!isUnlocked(progress, level.number)) return null;
    if (!progress.levels[level.id]?.completed) return level.number;
  }
  return null;
}
