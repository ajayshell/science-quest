import type { SubjectModule } from '../types.ts';
import { LEVELS } from './levels/index.ts';
import { BIOLOGY_WORLDS } from './worlds.ts';

export const biology: SubjectModule = {
  id: 'biology',
  title: 'Biology',
  blurb: 'Cells, DNA, and how living things fit together.',
  accent: '#c6ff4d',
  status: 'soon',
  worlds: BIOLOGY_WORLDS,
  levels: LEVELS,
};
