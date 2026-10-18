import { describe, expect, it } from 'vitest';
import {
  BASE_POINTS,
  HINT_COST,
  MAX_SPEED_BONUS,
  comboMultiplier,
  formatMult,
  rateStars,
  scoreCorrect,
  speedBonus,
} from './scoring.ts';

describe('speed bonus', () => {
  it('pays the full bonus for an instant answer', () => {
    expect(speedBonus(0, 8000)).toBe(MAX_SPEED_BONUS);
  });

  it('scales down as time passes and hits zero at the target', () => {
    expect(speedBonus(4000, 8000)).toBe(25);
    expect(speedBonus(8000, 8000)).toBe(0);
    expect(speedBonus(12000, 8000)).toBe(0);
  });

  it('treats a negative elapsed time as instant', () => {
    expect(speedBonus(-50, 8000)).toBe(MAX_SPEED_BONUS);
  });
});

describe('combo multiplier', () => {
  it('starts at 1× and steps by 0.25', () => {
    expect(comboMultiplier(0)).toBe(1);
    expect(comboMultiplier(1)).toBe(1.25);
    expect(comboMultiplier(2)).toBe(1.5);
  });

  it('caps at 3×', () => {
    expect(comboMultiplier(8)).toBe(3);
    expect(comboMultiplier(20)).toBe(3);
  });
});

describe('scoreCorrect', () => {
  it('awards base points plus speed, then the combo multiplier', () => {
    const tick = scoreCorrect(0, 8000, 0);
    expect(tick.speed).toBe(MAX_SPEED_BONUS);
    expect(tick.multiplier).toBe(1);
    expect(tick.points).toBe(BASE_POINTS + MAX_SPEED_BONUS);
    expect(tick.nextCombo).toBe(1);
  });

  it('applies the streak from before this answer', () => {
    const tick = scoreCorrect(8000, 8000, 2);
    expect(tick.speed).toBe(0);
    expect(tick.multiplier).toBe(1.5);
    expect(tick.points).toBe(150);
    expect(tick.nextCombo).toBe(3);
  });

  it('rounds fractional totals', () => {
    const tick = scoreCorrect(0, 8000, 1);
    expect(tick.points).toBe(Math.round(150 * 1.25));
  });
});

describe('stars', () => {
  const par = 60_000;

  it('gives 3 stars for a perfect, fast, hint-free run', () => {
    expect(
      rateStars({
        firstTryCorrect: 6,
        total: 6,
        elapsedMs: par,
        parMs: par,
        hintsUsed: 0,
      }),
    ).toBe(3);
  });

  it('gives 2 stars for a strong run that used one hint or a little extra time', () => {
    expect(
      rateStars({
        firstTryCorrect: 6,
        total: 6,
        elapsedMs: par + 1,
        parMs: par,
        hintsUsed: 0,
      }),
    ).toBe(2);
    expect(
      rateStars({
        firstTryCorrect: 4,
        total: 5,
        elapsedMs: par,
        parMs: par,
        hintsUsed: 1,
      }),
    ).toBe(2);
  });

  it('gives 1 star when accuracy, time, or hints fall short', () => {
    expect(
      rateStars({
        firstTryCorrect: 3,
        total: 5,
        elapsedMs: par,
        parMs: par,
        hintsUsed: 0,
      }),
    ).toBe(1);
    expect(
      rateStars({
        firstTryCorrect: 5,
        total: 5,
        elapsedMs: par * 2,
        parMs: par,
        hintsUsed: 0,
      }),
    ).toBe(1);
    expect(
      rateStars({
        firstTryCorrect: 5,
        total: 5,
        elapsedMs: par,
        parMs: par,
        hintsUsed: 2,
      }),
    ).toBe(1);
  });
});

describe('formatters', () => {
  it('prints multipliers without a trailing zero', () => {
    expect(formatMult(1)).toBe('×1');
    expect(formatMult(1.5)).toBe('×1.5');
    expect(formatMult(1.25)).toBe('×1.25');
    expect(formatMult(3)).toBe('×3');
  });

  it('exports a stable hint cost', () => {
    expect(HINT_COST).toBe(30);
  });
});
