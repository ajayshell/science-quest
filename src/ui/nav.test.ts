import { describe, expect, it } from 'vitest';
import { createDefaultSave } from '../store/defaults.ts';
import { backTarget, playerLabel, reduceNav, type NavState } from './nav.ts';

const home: NavState = { route: { name: 'subjects' }, subjectId: 'chemistry' };

describe('navigation', () => {
  it('goes Home, then Who is playing, then the subject hub', () => {
    const picked = reduceNav(home, { type: 'open-subject', subjectId: 'chemistry', playable: true });
    expect(picked).toEqual({ route: { name: 'profiles' }, subjectId: 'chemistry' });

    const hub = reduceNav(picked, { type: 'choose-player' });
    expect(hub.route).toEqual({ name: 'hub' });
    expect(hub.subjectId).toBe('chemistry');

    expect(reduceNav(hub, { type: 'home' }).route).toEqual({ name: 'subjects' });
    expect(reduceNav(hub, { type: 'switch-player' })).toEqual({
      route: { name: 'profiles' },
      subjectId: 'chemistry',
    });
  });

  it('keeps a coming-soon subject on Home and sends Back to the hub', () => {
    expect(reduceNav(home, { type: 'open-subject', subjectId: 'math', playable: false })).toEqual(home);

    const level: NavState = { route: { name: 'play', level: 4 }, subjectId: 'chemistry' };
    expect(backTarget(level.route)).toEqual({ name: 'hub' });
    expect(reduceNav(level, { type: 'back' }).route).toEqual({ name: 'hub' });
    expect(reduceNav(level, { type: 'switch-player' }).subjectId).toBe('chemistry');

    const hub: NavState = { route: { name: 'hub' }, subjectId: 'chemistry' };
    expect(backTarget(hub.route)).toBeNull();
    expect(reduceNav(hub, { type: 'back' })).toEqual(hub);
    expect(reduceNav({ route: { name: 'cards' }, subjectId: 'chemistry' }, { type: 'back' }).route).toEqual({
      name: 'hub',
    });
  });

  it('labels the three profiles as 7th grader, 9th grader, and Parent', () => {
    const [kid7, kid9, parent] = createDefaultSave().profiles;
    expect(playerLabel(kid7!)).toBe('7th grader');
    expect(playerLabel(kid9!)).toBe('9th grader');
    expect(playerLabel(parent!)).toBe('Parent');
    kid7!.name = 'Ava';
    expect(playerLabel(kid7!)).toBe('7th grader');
  });
});
