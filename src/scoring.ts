/** Points, combo, speed bonus, and star rules. Pure functions — no DOM. */

export const BASE_POINTS = 100;
export const MAX_SPEED_BONUS = 50;
export const HINT_COST = 30;
export const COMBO_STEP = 0.25;
export const MAX_COMBO_STEPS = 8;

export type ScoreTick = {
  points: number;
  speed: number;
  multiplier: number;
  nextCombo: number;
};

export function speedBonus(elapsedMs: number, targetMs: number): number {
  if (targetMs <= 0) return 0;
  const elapsed = Math.max(0, elapsedMs);
  const ratio = 1 - elapsed / targetMs;
  if (ratio <= 0) return 0;
  return Math.round(MAX_SPEED_BONUS * Math.min(1, ratio));
}

/** Combo is the number of correct answers already in a row, before this one. */
export function comboMultiplier(combo: number): number {
  const steps = Math.max(0, Math.min(MAX_COMBO_STEPS, Math.floor(combo)));
  return 1 + COMBO_STEP * steps;
}

export function scoreCorrect(elapsedMs: number, targetMs: number, combo: number): ScoreTick {
  const speed = speedBonus(elapsedMs, targetMs);
  const multiplier = comboMultiplier(combo);
  const points = Math.round((BASE_POINTS + speed) * multiplier);
  return {
    points,
    speed,
    multiplier,
    nextCombo: combo + 1,
  };
}

export function rateStars(input: {
  firstTryCorrect: number;
  total: number;
  elapsedMs: number;
  parMs: number;
  hintsUsed: number;
}): 1 | 2 | 3 {
  const accuracy = input.total <= 0 ? 0 : input.firstTryCorrect / input.total;
  const onTime = input.elapsedMs <= input.parMs;
  const closeTime = input.elapsedMs <= input.parMs * 1.5;
  if (accuracy === 1 && onTime && input.hintsUsed === 0) return 3;
  if (accuracy >= 0.8 && closeTime && input.hintsUsed <= 1) return 2;
  return 1;
}

export function formatMult(multiplier: number): string {
  const text = Number.isInteger(multiplier)
    ? multiplier.toFixed(0)
    : multiplier.toFixed(2).replace(/0$/, '');
  return `×${text}`;
}

export function formatGain(tick: Pick<ScoreTick, 'points' | 'speed' | 'multiplier'>): string {
  const parts = [`+${tick.points}`];
  if (tick.multiplier > 1) parts.push(formatMult(tick.multiplier));
  if (tick.speed > 0) parts.push(`speed ${tick.speed}`);
  return parts.join(' · ');
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
