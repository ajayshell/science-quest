import type { Profile } from '../store/types.ts';
import type { Route } from './types.ts';

export type NavState = {
  route: Route;
  subjectId: string;
};

export type NavAction =
  | { type: 'home' }
  | { type: 'open-subject'; subjectId: string; playable: boolean }
  | { type: 'choose-player' }
  | { type: 'switch-player' }
  | { type: 'back' }
  | { type: 'go'; route: Route };

/** Short label on the Who's playing tiles and the top bar. */
export function playerLabel(profile: Profile): string {
  if (profile.role === 'parent') return 'Parent';
  if (profile.id === 'kid-7' || /7th/i.test(profile.gradeLabel)) return '7th grader';
  if (profile.id === 'kid-9' || /9th/i.test(profile.gradeLabel)) return '9th grader';
  return profile.gradeLabel || 'Player';
}

/** Where Back goes. Home and Who's playing use the Home button instead. */
export function backTarget(route: Route): Route | null {
  if (route.name === 'play' || route.name === 'cards' || route.name === 'ranks' || route.name === 'scoring') {
    return { name: 'hub' };
  }
  return null;
}

export function showsTopBar(route: Route): boolean {
  return route.name !== 'subjects';
}

/**
 * Home is the subject picker. A playable subject opens Who's playing.
 * Choosing a player opens that subject's hub. Home and Switch player stay available after that.
 */
export function reduceNav(state: NavState, action: NavAction): NavState {
  switch (action.type) {
    case 'home':
      return { ...state, route: { name: 'subjects' } };
    case 'open-subject':
      if (!action.playable) return state;
      return { subjectId: action.subjectId, route: { name: 'profiles' } };
    case 'choose-player':
      return { ...state, route: { name: 'hub' } };
    case 'switch-player':
      return { ...state, route: { name: 'profiles' } };
    case 'back': {
      const target = backTarget(state.route);
      return target ? { ...state, route: target } : state;
    }
    case 'go':
      return { ...state, route: action.route };
  }
}
