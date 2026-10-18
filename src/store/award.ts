import { HINT_COST } from '../scoring.ts';
import type { ProfileProgress } from './types.ts';

export type LevelOutcome = {
  gross: number;
  hintsUsed: number;
  stars: 1 | 2 | 3;
  bestCombo: number;
  cardIds: string[];
};

export type Award = {
  /** Change in saved points. Negative when hints cost more than a new best. */
  delta: number;
  gained: number;
  spent: number;
  newCards: string[];
};

/**
 * Fold a finished level into a profile.
 * Gross score can raise the personal best. Hint cost is always spent, and points never go below 0.
 * Stars only go up. Cards unlock once.
 */
export function applyLevelResult(progress: ProfileProgress, levelId: string, outcome: LevelOutcome): Award {
  const prev = progress.levels[levelId];
  const prevBest = prev?.bestScore ?? 0;
  const gained = Math.max(0, outcome.gross - prevBest);
  const spent = Math.max(0, outcome.hintsUsed) * HINT_COST;
  const before = progress.points;
  progress.points = Math.max(0, progress.points + gained - spent);
  const bestStars = Math.max(prev?.bestStars ?? 0, outcome.stars) as 0 | 1 | 2 | 3;
  progress.levels[levelId] = {
    bestStars,
    bestScore: Math.max(prevBest, outcome.gross),
    plays: (prev?.plays ?? 0) + 1,
    completed: true,
  };
  progress.bestCombo = Math.max(progress.bestCombo, outcome.bestCombo);
  const newCards: string[] = [];
  for (const id of outcome.cardIds) {
    if (!progress.cards.includes(id)) {
      progress.cards.push(id);
      newCards.push(id);
    }
  }
  return { delta: progress.points - before, gained, spent, newCards };
}
