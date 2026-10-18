import type { LevelDef } from '../engine/level-def.ts';
import type { ProfileProgress, Role } from '../store/types.ts';

function ordered(levels: readonly LevelDef[]): LevelDef[] {
  return [...levels].sort((a, b) => a.number - b.number);
}

/**
 * Kids open the next level only after the previous one is finished.
 * The parent profile can open every level, world, and boss.
 */
export function isUnlocked(
  progress: ProfileProgress,
  levelNumber: number,
  levels: readonly LevelDef[],
  role: Role,
): boolean {
  if (role === 'parent') return true;
  const list = ordered(levels);
  const index = list.findIndex((level) => level.number === levelNumber);
  if (index < 0) return false;
  if (index === 0) return true;
  const prev = list[index - 1];
  return Boolean(prev && progress.levels[prev.id]?.completed);
}

export function isWorldUnlocked(
  progress: ProfileProgress,
  worldId: number,
  levels: readonly LevelDef[],
  role: Role,
): boolean {
  if (role === 'parent') return true;
  const first = ordered(levels).find((level) => level.world === worldId);
  if (!first) return false;
  return isUnlocked(progress, first.number, levels, role);
}

export function totalStars(progress: ProfileProgress): number {
  return Object.values(progress.levels).reduce((sum, level) => sum + level.bestStars, 0);
}

export function nextOpenLevel(
  progress: ProfileProgress,
  levels: readonly LevelDef[],
  role: Role,
): number | null {
  for (const level of ordered(levels)) {
    if (!isUnlocked(progress, level.number, levels, role)) return null;
    if (!progress.levels[level.id]?.completed) return level.number;
  }
  return null;
}
