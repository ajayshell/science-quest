export type Role = 'kid' | 'parent';

export type Profile = {
  id: string;
  name: string;
  avatar: string;
  role: Role;
  gradeLabel: string;
};

export type LevelRecord = {
  bestStars: 0 | 1 | 2 | 3;
  bestScore: number;
  plays: number;
  completed: boolean;
};

export type ProfileProgress = {
  points: number;
  bestCombo: number;
  levels: Record<string, LevelRecord>;
  cards: string[];
};

/** profile id -> subject id -> that subject's points, stars, and cards */
export type ProgressBySubject = Record<string, ProfileProgress>;

export type SaveData = {
  version: 2;
  welcomed: boolean;
  activeProfileId: string;
  profiles: Profile[];
  progress: Record<string, ProgressBySubject>;
};

export const AVATARS = ['atom', 'flask', 'comet', 'bolt', 'crystal', 'wave', 'rocket', 'sun'] as const;
export type AvatarId = (typeof AVATARS)[number];

export function emptyProgress(): ProfileProgress {
  return { points: 0, bestCombo: 0, levels: {}, cards: [] };
}
