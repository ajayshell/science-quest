import { CARDS } from '../../data/cards.ts';
import type { SubjectModule } from '../types.ts';
import { LEVELS } from './levels/index.ts';
import { CHEMISTRY_WORLDS } from './worlds.ts';

export const chemistry: SubjectModule = {
  id: 'chemistry',
  title: 'Chemistry',
  blurb: 'Atoms, the periodic table, and the formulas in everyday stuff.',
  accent: '#5ef2ff',
  status: 'playable',
  worlds: CHEMISTRY_WORLDS,
  levels: LEVELS,
  album: {
    title: 'Element & molecule cards',
    lede: 'Clear a level to unlock the cards it teaches.',
    cards: CARDS,
  },
};
