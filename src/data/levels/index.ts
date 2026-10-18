import { level01 } from './level01.ts';
import { level02 } from './level02.ts';
import { level03 } from './level03.ts';
import { level04 } from './level04.ts';
import { level05 } from './level05.ts';
import { level06 } from './level06.ts';
import { level07 } from './level07.ts';
import { level08 } from './level08.ts';
import { level09 } from './level09.ts';
import { level10 } from './level10.ts';
import { level11 } from './level11.ts';
import type { LevelDef } from './types.ts';

export const LEVELS: LevelDef[] = [
  level01,
  level02,
  level03,
  level04,
  level05,
  level06,
  level07,
  level08,
  level09,
  level10,
  level11,
];

export const WORLDS = [
  {
    id: 1 as const,
    kicker: 'World 01',
    title: 'Atoms',
    blurb: 'States of matter, the parts of an atom, and elements versus compounds.',
    color: '#5ef2ff',
  },
  {
    id: 2 as const,
    kicker: 'World 02',
    title: 'Periodic Table',
    blurb: 'Symbols, the table, families, and elements hiding in real objects.',
    color: '#ff4ecd',
  },
  {
    id: 3 as const,
    kicker: 'World 03',
    title: 'Molecules & Formulas',
    blurb: 'Build compounds, count atoms, and race the clock.',
    color: '#ffc857',
  },
];

export function getLevel(number: number): LevelDef {
  const level = LEVELS.find((item) => item.number === number);
  if (!level) throw new Error(`Missing level ${number}`);
  return level;
}

export function levelsInWorld(world: 1 | 2 | 3): LevelDef[] {
  return LEVELS.filter((level) => level.world === world);
}
