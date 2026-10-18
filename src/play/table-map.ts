/** Main-group periodic table, periods 1–4. Transition metals are left out so the grid fits a phone. */

export const TABLE_COLUMNS = [1, 2, 13, 14, 15, 16, 17, 18] as const;

export const TABLE_ROWS: (string | null)[][] = [
  ['H', null, null, null, null, null, null, 'He'],
  ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', null, null, null, null, null, null],
];

export const MAIN_GROUP_SYMBOLS = new Set(
  TABLE_ROWS.flat().filter((symbol): symbol is string => Boolean(symbol)),
);
