import type { CardDef } from '../data/cards.ts';
import type { LevelDef } from '../engine/level-def.ts';

export type SubjectStatus = 'playable' | 'soon';

export type WorldDef = {
  id: number;
  kicker: string;
  title: string;
  blurb: string;
  color: string;
};

export type SubjectAlbum = {
  title: string;
  lede: string;
  cards: readonly CardDef[];
};

/**
 * One subject. Worlds and levels live in that subject's folder.
 * The hub and the play engine only read this shape.
 */
export type SubjectModule = {
  id: string;
  title: string;
  blurb: string;
  accent: string;
  status: SubjectStatus;
  worlds: readonly WorldDef[];
  levels: readonly LevelDef[];
  album?: SubjectAlbum;
};
