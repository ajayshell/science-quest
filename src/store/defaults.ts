import { SUBJECTS } from '../subjects/registry.ts';
import { AVATARS, emptyProgress, type Profile, type ProgressBySubject, type SaveData } from './types.ts';

export const AVATAR_IDS: readonly string[] = AVATARS;

export function emptySubjectProgress(): ProgressBySubject {
  return Object.fromEntries(SUBJECTS.map((subject) => [subject.id, emptyProgress()]));
}

export function createDefaultSave(): SaveData {
  const profiles: Profile[] = [
    {
      id: 'kid-7',
      name: '7th Grader',
      avatar: 'comet',
      role: 'kid',
      gradeLabel: 'BHMS · 7th grade',
    },
    {
      id: 'kid-9',
      name: '9th Grader',
      avatar: 'atom',
      role: 'kid',
      gradeLabel: 'RBHS · 9th grade',
    },
    {
      id: 'parent',
      name: 'Parent',
      avatar: 'sun',
      role: 'parent',
      gradeLabel: 'Family',
    },
  ];
  return {
    version: 2,
    welcomed: false,
    activeProfileId: profiles[0]!.id,
    profiles,
    progress: Object.fromEntries(profiles.map((profile) => [profile.id, emptySubjectProgress()])),
  };
}
