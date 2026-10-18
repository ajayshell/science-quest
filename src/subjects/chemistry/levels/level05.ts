import { SRC } from '../../../data/sources.ts';
import type { LevelDef } from '../../../engine/level-def.ts';

export const level05: LevelDef = {
  id: 'w2-table-puzzle',
  number: 5,
  world: 2,
  title: 'Table Puzzle',
  summary: 'Drop six elements into the gaps of a main-group periodic table.',
  how: 'Atomic number increases left to right. Use the filled neighbors to find each gap. Chips show the atomic number. Period 4 shows potassium and calcium only; the transition metals are left out so the grid fits a phone.',
  parSeconds: 110,
  speedMs: 10000,
  cardIds: ['N', 'Al', 'Si', 'Cl', 'Ca'],
  kind: 'table',
  blanks: ['C', 'O', 'Ne', 'Na', 'Cl', 'Ca'].map((symbol) => ({
    symbol,
    source: SRC.symbols,
    note: 'Placement follows IUPAC group and period. Neighbors on the board are already filled.',
  })),
};
