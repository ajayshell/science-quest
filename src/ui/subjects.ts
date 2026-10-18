import { totalStars } from '../game/unlock.ts';
import { SUBJECTS } from '../subjects/registry.ts';
import type { AppCtx } from './types.ts';
import { el } from './dom.ts';
import { avatarSvg } from './icons.ts';

export function renderSubjects(root: HTMLElement, ctx: AppCtx): () => void {
  const profile = ctx.profile();
  const screen = el('section', 'subjects');
  const top = el('header', 'hub-top');
  const who = el('button', 'who');
  who.type = 'button';
  who.innerHTML = avatarSvg(profile.avatar);
  const meta = el('span', 'who-meta');
  meta.append(el('strong', '', profile.name));
  meta.append(el('span', '', 'Switch player'));
  who.append(meta);
  who.addEventListener('click', () => ctx.go({ name: 'profiles' }));
  top.append(who);
  screen.append(top);

  const hero = el('div', 'hero');
  hero.append(el('p', 'eyebrow', 'Science Quest'));
  hero.append(el('h1', 'display', 'Pick a subject'));
  hero.append(el('p', 'lede', 'Chemistry is ready to play. Physics, math, and biology are lighting up next.'));
  screen.append(hero);

  const grid = el('div', 'subject-grid');
  for (const subject of SUBJECTS) {
    const playable = subject.status === 'playable';
    const tile = el('button', playable ? 'subject-tile' : 'subject-tile is-soon');
    tile.type = 'button';
    tile.style.setProperty('--accent', subject.accent);
    tile.disabled = !playable;
    tile.setAttribute('aria-disabled', playable ? 'false' : 'true');
    tile.append(el('p', 'eyebrow', playable ? 'Play now' : 'Coming soon'));
    tile.append(el('h2', '', subject.title));
    tile.append(el('p', 'subject-blurb', subject.blurb));
    const slice = ctx.save.progress[profile.id]?.[subject.id];
    const detail = el('span', 'subject-meta');
    if (!playable) {
      detail.textContent = 'In the lab';
    } else if (slice && (slice.points > 0 || Object.keys(slice.levels).length > 0)) {
      detail.textContent = `${slice.points.toLocaleString()} pts · ${totalStars(slice)} stars`;
    } else {
      detail.textContent = subject.levels.length ? `${subject.levels.length} levels` : 'Open';
    }
    tile.append(detail);
    tile.addEventListener('click', () => {
      if (!playable) return;
      ctx.subjectId = subject.id;
      ctx.go({ name: 'hub' });
    });
    grid.append(tile);
  }
  screen.append(grid);
  root.append(screen);
  return () => undefined;
}
