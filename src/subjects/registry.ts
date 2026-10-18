import { biology } from './biology/index.ts';
import { chemistry } from './chemistry/index.ts';
import { math } from './math/index.ts';
import { physics } from './physics/index.ts';
import type { SubjectModule } from './types.ts';

/** The only list the app walks. A new subject is a folder plus one line here. */
export const SUBJECTS: readonly SubjectModule[] = [chemistry, physics, math, biology];

export const SUBJECT_IDS: readonly string[] = SUBJECTS.map((subject) => subject.id);

export function getSubject(id: string): SubjectModule {
  const subject = SUBJECTS.find((item) => item.id === id);
  if (!subject) throw new Error(`Unknown subject ${id}`);
  return subject;
}

export function levelsInWorld(subject: SubjectModule, worldId: number): SubjectModule['levels'] {
  return subject.levels.filter((level) => level.world === worldId);
}
