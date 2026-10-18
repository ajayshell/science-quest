import type { WorldDef } from '../types.ts';

export const CHEMISTRY_WORLDS: readonly WorldDef[] = [
  {
    id: 1,
    kicker: 'World 01',
    title: 'Atoms',
    blurb: 'States of matter, the parts of an atom, and elements versus compounds.',
    color: '#5ef2ff',
  },
  {
    id: 2,
    kicker: 'World 02',
    title: 'Periodic Table',
    blurb: 'Symbols, the table, families, and elements hiding in real objects.',
    color: '#ff4ecd',
  },
  {
    id: 3,
    kicker: 'World 03',
    title: 'Molecules & Formulas',
    blurb: 'Build compounds, count atoms, and race the clock.',
    color: '#ffc857',
  },
];
