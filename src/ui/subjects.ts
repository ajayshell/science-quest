import { SUBJECTS } from '../subjects/registry.ts';
import type { AppCtx } from './types.ts';
import { el } from './dom.ts';

export function renderSubjects(root: HTMLElement, ctx: AppCtx): () => void {
  const screen = el('section', 'subjects');
  const hero = el('div', 'hero');
  hero.append(el('p', 'eyebrow', 'Science Quest'));
  hero.append(el('h1', 'display', 'Home'));
  hero.append(el('p', 'lede', 'Pick a subject. Next you choose who is playing. Chemistry is ready. Physics, math, and biology are lighting up next.'));
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
    const detail = el('span', 'subject-meta');
    if (!playable) detail.textContent = 'In the lab';
    else detail.textContent = subject.levels.length ? `${subject.levels.length} levels` : 'Open';
    tile.append(detail);
    tile.addEventListener('click', () => ctx.openSubject(subject.id));
    grid.append(tile);
  }
  screen.append(grid);
  root.append(screen);
  return () => undefined;
}
