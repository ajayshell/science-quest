import type { SubjectModule } from '../types.ts';
import { LEVELS } from './levels/index.ts';
import { MATH_WORLDS } from './worlds.ts';

export const math: SubjectModule = {
  id: 'math',
  title: 'Math',
  blurb: 'Patterns, puzzles, and the numbers behind the science.',
  accent: '#ffc857',
  status: 'soon',
  worlds: MATH_WORLDS,
  levels: LEVELS,
};
