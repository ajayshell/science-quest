import { scoreCorrect, type ScoreTick } from '../scoring.ts';

export type AnswerResult = ScoreTick & {
  first: boolean;
  correct: boolean;
};

/** One level run. Each graded item has a scope id so board puzzles can miss and retry. */
export class LevelSession {
  gross = 0;
  combo = 0;
  bestCombo = 0;
  hintsUsed = 0;
  firstTryCorrect = 0;
  total = 0;
  startedAt = 0;
  private questionAt = 0;
  private readonly attempted = new Set<string>();

  start(): void {
    const now = performance.now();
    this.startedAt = now;
    this.questionAt = now;
  }

  addHint(): void {
    this.hintsUsed += 1;
  }

  wasAttempted(scope: string): boolean {
    return this.attempted.has(scope);
  }

  answer(scope: string, correct: boolean, speedMs: number): AnswerResult {
    const first = !this.attempted.has(scope);
    if (first) {
      this.attempted.add(scope);
      this.total += 1;
      if (correct) this.firstTryCorrect += 1;
    }
    if (!correct) {
      this.combo = 0;
      return { points: 0, speed: 0, multiplier: 1, nextCombo: 0, first, correct: false };
    }
    const elapsed = performance.now() - this.questionAt;
    const tick = scoreCorrect(elapsed, speedMs, this.combo);
    this.combo = tick.nextCombo;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.gross += tick.points;
    this.questionAt = performance.now();
    return { ...tick, first, correct: true };
  }

  elapsedMs(): number {
    return this.startedAt ? performance.now() - this.startedAt : 0;
  }
}
