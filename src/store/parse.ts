import { SUBJECTS } from '../subjects/registry.ts';
import { AVATAR_IDS, emptySubjectProgress } from './defaults.ts';
import {
  emptyProgress,
  type LevelRecord,
  type Profile,
  type ProfileProgress,
  type ProgressBySubject,
  type SaveData,
} from './types.ts';

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} is missing.`);
  }
  return value as Record<string, unknown>;
}

function readProfile(value: unknown, index: number): Profile {
  const row = asRecord(value, `Profile ${index + 1}`);
  if (typeof row.id !== 'string' || !row.id.trim()) throw new Error('A profile is missing an id.');
  const name = typeof row.name === 'string' ? row.name.trim().slice(0, 20) : '';
  const avatar = typeof row.avatar === 'string' && AVATAR_IDS.includes(row.avatar) ? row.avatar : 'atom';
  const role = row.role === 'parent' ? 'parent' : 'kid';
  const gradeLabel = typeof row.gradeLabel === 'string' ? row.gradeLabel.slice(0, 40) : '';
  return {
    id: row.id,
    name: name || 'Player',
    avatar,
    role,
    gradeLabel,
  };
}

function readLevel(value: unknown): LevelRecord {
  const row = asRecord(value, 'Level');
  const stars = row.bestStars;
  const bestStars = stars === 0 || stars === 1 || stars === 2 || stars === 3 ? stars : 0;
  const bestScore = typeof row.bestScore === 'number' && row.bestScore > 0 ? Math.floor(row.bestScore) : 0;
  const plays = typeof row.plays === 'number' && row.plays > 0 ? Math.floor(row.plays) : 0;
  return {
    bestStars,
    bestScore,
    plays,
    completed: row.completed === true || bestStars > 0,
  };
}

function readProgress(value: unknown): ProfileProgress {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return emptyProgress();
  const row = value as Record<string, unknown>;
  const levelsIn = row.levels && typeof row.levels === 'object' && !Array.isArray(row.levels)
    ? (row.levels as Record<string, unknown>)
    : {};
  const levels: Record<string, LevelRecord> = {};
  for (const [id, level] of Object.entries(levelsIn)) levels[id] = readLevel(level);
  const cards = Array.isArray(row.cards) ? row.cards.filter((id): id is string => typeof id === 'string') : [];
  return {
    points: typeof row.points === 'number' && row.points > 0 ? Math.floor(row.points) : 0,
    bestCombo: typeof row.bestCombo === 'number' && row.bestCombo > 0 ? Math.floor(row.bestCombo) : 0,
    levels,
    cards,
  };
}

/** A version-1 profile blob stores points directly. A version-2 blob stores subjects. */
function isFlatProgress(value: unknown): boolean {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return 'points' in row || 'levels' in row || 'cards' in row || 'bestCombo' in row;
}

function readSubjectMap(value: unknown): ProgressBySubject {
  const map = emptySubjectProgress();
  if (isFlatProgress(value)) {
    map.chemistry = readProgress(value);
    return map;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const [subjectId, progress] of Object.entries(value as Record<string, unknown>)) {
      map[subjectId] = readProgress(progress);
    }
  }
  for (const subject of SUBJECTS) {
    if (!map[subject.id]) map[subject.id] = emptyProgress();
  }
  return map;
}

export function parseSave(raw: string): SaveData {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const row = asRecord(value, 'Progress file');
  if (row.version !== 1 && row.version !== 2) throw new Error('This progress file is from a different version.');
  if (!Array.isArray(row.profiles) || row.profiles.length === 0) {
    throw new Error('No profiles in that file.');
  }
  const profiles = row.profiles.map(readProfile);
  const ids = new Set<string>();
  for (const profile of profiles) {
    if (ids.has(profile.id)) throw new Error('Two profiles share an id.');
    ids.add(profile.id);
  }
  const progressIn =
    row.progress && typeof row.progress === 'object' && !Array.isArray(row.progress)
      ? (row.progress as Record<string, unknown>)
      : {};
  const progress: Record<string, ProgressBySubject> = {};
  for (const profile of profiles) progress[profile.id] = readSubjectMap(progressIn[profile.id]);
  let active = typeof row.activeProfileId === 'string' ? row.activeProfileId : profiles[0]!.id;
  if (!ids.has(active)) active = profiles[0]!.id;
  return {
    version: 2,
    welcomed: row.welcomed === true,
    activeProfileId: active,
    profiles,
    progress,
  };
}
