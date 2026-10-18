import type { SubjectModule } from '../types.ts';
import { LEVELS } from './levels/index.ts';
import { PHYSICS_WORLDS } from './worlds.ts';

export const physics: SubjectModule = {
  id: 'physics',
  title: 'Physics',
  blurb: 'Motion, forces, energy, waves, and circuits.',
  accent: '#ff4ecd',
  status: 'soon',
  worlds: PHYSICS_WORLDS,
  levels: LEVELS,
};
