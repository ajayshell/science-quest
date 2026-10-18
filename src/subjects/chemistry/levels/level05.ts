import type { LevelDef } from '../../../engine/level-def.ts';

export const level05: LevelDef = {
  id: 'w2-table-puzzle',
  number: 5,
  world: 2,
  title: 'Table Puzzle',
  summary: 'Drop six elements into the gaps of a main-group periodic table.',
  how: 'Atomic number increases left to right. Use the filled neighbors to find each gap. Chips show the atomic number.',
  parSeconds: 110,
  speedMs: 10000,
  cardIds: ['N', 'Al', 'Si', 'Cl', 'Ca'],
  kind: 'table',
  blanks: ['C', 'O', 'Ne', 'Na', 'Cl', 'Ca'],
};
